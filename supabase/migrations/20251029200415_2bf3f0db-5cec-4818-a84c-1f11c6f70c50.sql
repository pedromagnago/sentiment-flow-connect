-- ============================================
-- FASE 3: MOTOR DE RECONCILIAÇÃO + WHATSAPP + HIERARQUIA
-- ============================================

-- ============================================
-- PARTE 1: MOTOR DE RECONCILIAÇÃO INTELIGENTE
-- ============================================

-- Tabela principal de matches de reconciliação
CREATE TABLE IF NOT EXISTS reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Transação bancária
  transaction_id UUID NOT NULL REFERENCES bank_transactions(id) ON DELETE CASCADE,
  
  -- Conta vinculada (pagar OU receber)
  payable_id UUID REFERENCES contas_pagar(id) ON DELETE CASCADE,
  receivable_id UUID REFERENCES contas_receber(id) ON DELETE CASCADE,
  
  -- Metadados de match
  match_type TEXT NOT NULL CHECK (match_type IN ('manual', 'exact', 'fuzzy', 'ai', 'rule')),
  match_score NUMERIC(5,2) CHECK (match_score >= 0 AND match_score <= 100),
  match_details JSONB DEFAULT '{}'::jsonb,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'confirmed', 'rejected')),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT check_one_account CHECK (
    (payable_id IS NOT NULL AND receivable_id IS NULL) OR
    (payable_id IS NULL AND receivable_id IS NOT NULL)
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_transaction ON reconciliation_matches(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_payable ON reconciliation_matches(payable_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_receivable ON reconciliation_matches(receivable_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_company ON reconciliation_matches(company_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_matches_status ON reconciliation_matches(status);

-- Adicionar flags de reconciliação em bank_transactions
ALTER TABLE bank_transactions 
  ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reconciled_by UUID;

-- Adicionar flags em contas_pagar/receber
ALTER TABLE contas_pagar 
  ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reconciled_by UUID;

ALTER TABLE contas_receber 
  ADD COLUMN IF NOT EXISTS reconciled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reconciled_by UUID;

-- ============================================
-- PARTE 2: INTEGRAÇÃO WHATSAPP → RECONCILIAÇÃO
-- ============================================

-- Vincular suggested_actions com contas
ALTER TABLE suggested_actions 
  ADD COLUMN IF NOT EXISTS payable_id UUID REFERENCES contas_pagar(id),
  ADD COLUMN IF NOT EXISTS receivable_id UUID REFERENCES contas_receber(id);

-- Adicionar metadados de documento
ALTER TABLE contas_pagar 
  ADD COLUMN IF NOT EXISTS whatsapp_document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_analysis JSONB DEFAULT '{}'::jsonb;

ALTER TABLE contas_receber 
  ADD COLUMN IF NOT EXISTS whatsapp_document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_analysis JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- PARTE 3: HIERARQUIA DE EMPRESAS
-- ============================================

-- Tabela de grupos empresariais
CREATE TABLE IF NOT EXISTS company_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'holding' CHECK (tipo IN ('holding', 'grupo_economico', 'franquia', 'filial')),
  
  -- Empresa principal (matriz)
  parent_company_id UUID REFERENCES companies(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Relacionamento M:N entre empresas e grupos
CREATE TABLE IF NOT EXISTS company_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES company_groups(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Tipo de relacionamento
  member_type TEXT NOT NULL DEFAULT 'filial' CHECK (member_type IN ('matriz', 'filial', 'coligada')),
  
  -- Peso para consolidação (padrão 100%)
  consolidation_weight NUMERIC(5,2) DEFAULT 100.00 CHECK (consolidation_weight >= 0 AND consolidation_weight <= 100),
  
  -- Ativo/Inativo
  is_active BOOLEAN DEFAULT true,
  
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  
  UNIQUE(group_id, company_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_company_group_members_group ON company_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_company_group_members_company ON company_group_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_groups_parent ON company_groups(parent_company_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Reconciliation matches
ALTER TABLE reconciliation_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches for their company"
  ON reconciliation_matches FOR SELECT
  USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can create matches for their company"
  ON reconciliation_matches FOR INSERT
  WITH CHECK (user_id = auth.uid() AND user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can update matches for their company"
  ON reconciliation_matches FOR UPDATE
  USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can delete matches for their company"
  ON reconciliation_matches FOR DELETE
  USING (user_can_access_company(auth.uid(), company_id));

-- Company groups
ALTER TABLE company_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage company groups"
  ON company_groups FOR ALL
  USING (user_is_admin(auth.uid()));

CREATE POLICY "Users can view company groups"
  ON company_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_group_members cgm
      WHERE cgm.group_id = company_groups.id
      AND user_can_access_company(auth.uid(), cgm.company_id)
    )
  );

-- Company group members
ALTER TABLE company_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage group members"
  ON company_group_members FOR ALL
  USING (user_is_admin(auth.uid()));

CREATE POLICY "Users can view group members for their companies"
  ON company_group_members FOR SELECT
  USING (user_can_access_company(auth.uid(), company_id));

-- ============================================
-- TRIGGERS
-- ============================================

-- Atualizar updated_at automaticamente
CREATE TRIGGER update_reconciliation_matches_updated_at
  BEFORE UPDATE ON reconciliation_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_groups_updated_at
  BEFORE UPDATE ON company_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();