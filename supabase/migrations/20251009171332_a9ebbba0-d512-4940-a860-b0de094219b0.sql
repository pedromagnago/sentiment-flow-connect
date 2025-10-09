-- =====================================================
-- FASE 1B: Contas a Receber + Recibos
-- Parte 1: Infraestrutura SQL Completa
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA contas_receber
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id TEXT REFERENCES public.contacts(id_contact),
  message_id UUID REFERENCES public.messages(id),
  suggested_action_id UUID REFERENCES public.suggested_actions(id),
  fatura_id UUID REFERENCES public.faturas(id),
  
  -- Identificação
  cliente TEXT NOT NULL,
  cpf_cnpj_cliente TEXT,
  descricao TEXT NOT NULL,
  
  -- Valores e Datas
  valor_total NUMERIC NOT NULL CHECK (valor_total > 0),
  valor_recebido NUMERIC DEFAULT 0 CHECK (valor_recebido >= 0),
  saldo_devedor NUMERIC GENERATED ALWAYS AS (valor_total - valor_recebido) STORED,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_competencia DATE NOT NULL,
  recebido_em DATE,
  
  -- Tipo de Documento
  tipo_documento TEXT NOT NULL DEFAULT 'nf_saida' 
    CHECK (tipo_documento IN ('nf_saida', 'nfs_e', 'recibo_emitido', 'comprovante_recebido', 'instrucao_escrita')),
  chave_nfe TEXT,
  numero_recibo TEXT,
  
  -- Campos Contábeis
  centro_custo TEXT,
  projeto TEXT,
  categoria TEXT,
  subcategoria TEXT,
  rateio JSONB DEFAULT '[]',
  
  -- Controle
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'parcialmente_recebido', 'recebido', 'em_cobranca', 'conciliado', 'cancelado')),
  forma_recebimento TEXT,
  comprovante_url TEXT,
  documento_original_url TEXT,
  tags TEXT[],
  tipo_titulo TEXT DEFAULT 'normal' 
    CHECK (tipo_titulo IN ('normal', 'adiantamento', 'sinal')),
  
  -- Recebimentos Parciais
  recebimentos_parciais JSONB DEFAULT '[]',
  
  -- Workflow de Aprovação
  aprovador_id UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  status_aprovacao TEXT DEFAULT 'pendente'
    CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado')),
  
  -- Auditoria
  observacoes TEXT,
  historico_atividades JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_recebimentos CHECK (valor_recebido <= valor_total),
  CONSTRAINT valid_datas CHECK (data_vencimento >= data_emissao)
);

-- Índices para performance
CREATE INDEX idx_contas_receber_company ON public.contas_receber(company_id);
CREATE INDEX idx_contas_receber_status ON public.contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON public.contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_cliente ON public.contas_receber(cliente);
CREATE INDEX idx_contas_receber_cpf_cnpj ON public.contas_receber(cpf_cnpj_cliente);
CREATE INDEX idx_contas_receber_tipo_doc ON public.contas_receber(tipo_documento);
CREATE INDEX idx_contas_receber_fatura ON public.contas_receber(fatura_id);

-- Trigger para updated_at
CREATE TRIGGER update_contas_receber_updated_at
BEFORE UPDATE ON public.contas_receber
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. ADICIONAR CAMPOS CONTÁBEIS EM TABELAS EXISTENTES
-- =====================================================

-- 2.1 Adicionar campos em contas_pagar
ALTER TABLE public.contas_pagar 
  ADD COLUMN IF NOT EXISTS data_competencia DATE,
  ADD COLUMN IF NOT EXISTS centro_custo TEXT,
  ADD COLUMN IF NOT EXISTS projeto TEXT,
  ADD COLUMN IF NOT EXISTS subcategoria TEXT,
  ADD COLUMN IF NOT EXISTS rateio JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tipo_documento TEXT DEFAULT 'nf_entrada',
  ADD COLUMN IF NOT EXISTS chave_nfe TEXT,
  ADD COLUMN IF NOT EXISTS numero_recibo TEXT,
  ADD COLUMN IF NOT EXISTS cpf_cnpj_beneficiario TEXT,
  ADD COLUMN IF NOT EXISTS documento_original_url TEXT,
  ADD COLUMN IF NOT EXISTS historico_atividades JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS valor_pago NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saldo_devedor NUMERIC,
  ADD COLUMN IF NOT EXISTS pagamentos_parciais JSONB DEFAULT '[]';

-- Adicionar constraint em tipo_documento
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contas_pagar_tipo_documento_check'
  ) THEN
    ALTER TABLE public.contas_pagar 
      ADD CONSTRAINT contas_pagar_tipo_documento_check
      CHECK (tipo_documento IN ('nf_entrada', 'recibo_simples', 'boleto', 'comprovante_bancario', 'instrucao_escrita'));
  END IF;
END $$;

-- 2.2 Adicionar campos em faturas
ALTER TABLE public.faturas
  ADD COLUMN IF NOT EXISTS data_competencia DATE,
  ADD COLUMN IF NOT EXISTS centro_custo TEXT,
  ADD COLUMN IF NOT EXISTS projeto TEXT,
  ADD COLUMN IF NOT EXISTS subcategoria TEXT,
  ADD COLUMN IF NOT EXISTS rateio JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tipo_documento TEXT DEFAULT 'nf_saida',
  ADD COLUMN IF NOT EXISTS chave_nfe TEXT,
  ADD COLUMN IF NOT EXISTS numero_recibo TEXT,
  ADD COLUMN IF NOT EXISTS cpf_cnpj_destinatario TEXT,
  ADD COLUMN IF NOT EXISTS is_recibo_simples BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS historico_atividades JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS itens_fatura JSONB DEFAULT '[]';

-- Adicionar constraint em tipo_documento
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'faturas_tipo_documento_check'
  ) THEN
    ALTER TABLE public.faturas 
      ADD CONSTRAINT faturas_tipo_documento_check
      CHECK (tipo_documento IN ('nf_saida', 'nfs_e', 'recibo_servico', 'nota_debito'));
  END IF;
END $$;

-- 2.3 Adicionar campos em bank_transactions
ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS data_competencia DATE,
  ADD COLUMN IF NOT EXISTS centro_custo TEXT,
  ADD COLUMN IF NOT EXISTS projeto TEXT,
  ADD COLUMN IF NOT EXISTS subcategoria TEXT,
  ADD COLUMN IF NOT EXISTS rateio JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS reconciliado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reconciliado_em TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reconciliado_por UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reconciliado_com_tipo TEXT,
  ADD COLUMN IF NOT EXISTS reconciliado_com_id UUID,
  ADD COLUMN IF NOT EXISTS match_score NUMERIC,
  ADD COLUMN IF NOT EXISTS cpf_cnpj_origem TEXT,
  ADD COLUMN IF NOT EXISTS nome_origem TEXT,
  ADD COLUMN IF NOT EXISTS historico_atividades JSONB DEFAULT '[]';

-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_contas_pagar_tipo_doc ON public.contas_pagar(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_cpf_cnpj ON public.contas_pagar(cpf_cnpj_beneficiario);
CREATE INDEX IF NOT EXISTS idx_faturas_tipo_doc ON public.faturas(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_faturas_cpf_cnpj ON public.faturas(cpf_cnpj_destinatario);
CREATE INDEX IF NOT EXISTS idx_bank_trans_reconciliado ON public.bank_transactions(reconciliado);
CREATE INDEX IF NOT EXISTS idx_bank_trans_cpf_cnpj ON public.bank_transactions(cpf_cnpj_origem);

-- =====================================================
-- 3. EXPANDIR TIPOS DE suggested_actions
-- =====================================================

-- Remover constraint antiga se existir e criar nova
ALTER TABLE public.suggested_actions DROP CONSTRAINT IF EXISTS suggested_actions_action_type_check;

ALTER TABLE public.suggested_actions 
  ADD CONSTRAINT suggested_actions_action_type_check 
  CHECK (action_type IN (
    'payment_nfe', 
    'payment_recibo', 
    'payment_boleto', 
    'payment_instrucao', 
    'receivable_nfe', 
    'receivable_recibo', 
    'receivable_comprovante', 
    'receivable_instrucao',
    'invoice',
    'task',
    'question',
    'document_analysis',
    'reconciliation',
    'payment'
  ));

-- =====================================================
-- 4. RLS POLICIES PARA contas_receber
-- =====================================================

ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

-- Policy: VIEW
CREATE POLICY "Users can view receivables for their company"
ON public.contas_receber FOR SELECT
USING (company_id = public.get_current_company_id());

-- Policy: INSERT
CREATE POLICY "Users can insert receivables for their company"
ON public.contas_receber FOR INSERT
WITH CHECK (
  company_id = public.get_current_company_id() AND
  user_id = auth.uid() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'supervisor', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

-- Policy: UPDATE
CREATE POLICY "Users can update receivables for their company"
ON public.contas_receber FOR UPDATE
USING (
  company_id = public.get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'supervisor', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

-- Policy: DELETE
CREATE POLICY "Admins can delete receivables for their company"
ON public.contas_receber FOR DELETE
USING (
  company_id = public.get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id)
  )
);

-- =====================================================
-- 5. TRIGGERS DE INTEGRAÇÃO COM FATURAS
-- =====================================================

-- 5.1 Trigger: Auto-criar conta a receber ao emitir fatura
CREATE OR REPLACE FUNCTION public.auto_create_receivable_from_invoice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se fatura foi marcada como 'emitida' E ainda não tem conta a receber vinculada
  IF NEW.status = 'emitida' AND (OLD.status IS NULL OR OLD.status != 'emitida') THEN
    -- Verificar se já existe conta a receber vinculada
    IF NOT EXISTS (
      SELECT 1 FROM public.contas_receber WHERE fatura_id = NEW.id
    ) THEN
      -- Criar conta a receber automaticamente
      INSERT INTO public.contas_receber (
        company_id,
        user_id,
        contact_id,
        message_id,
        suggested_action_id,
        fatura_id,
        cliente,
        cpf_cnpj_cliente,
        descricao,
        valor_total,
        data_emissao,
        data_vencimento,
        data_competencia,
        tipo_documento,
        chave_nfe,
        numero_recibo,
        centro_custo,
        projeto,
        categoria,
        subcategoria,
        rateio,
        status,
        historico_atividades
      )
      VALUES (
        NEW.company_id,
        NEW.user_id,
        NEW.contact_id,
        NEW.message_id,
        NEW.suggested_action_id,
        NEW.id,
        NEW.destinatario,
        NEW.cpf_cnpj_destinatario,
        NEW.descricao,
        NEW.valor,
        COALESCE(NEW.data_emissao, CURRENT_DATE),
        COALESCE(NEW.data_vencimento, CURRENT_DATE + INTERVAL '30 days'),
        COALESCE(NEW.data_competencia, CURRENT_DATE),
        COALESCE(NEW.tipo_documento, 'nf_saida'),
        NEW.chave_nfe,
        NEW.numero_recibo,
        NEW.centro_custo,
        NEW.projeto,
        NEW.categoria,
        NEW.subcategoria,
        COALESCE(NEW.rateio, '[]'::jsonb),
        'pendente',
        jsonb_build_array(
          jsonb_build_object(
            'timestamp', now(),
            'user_id', 'sistema',
            'user_name', 'Sistema - Trigger',
            'action', 'criou_automaticamente',
            'origem', 'trigger',
            'details', 'Conta a receber criada automaticamente ao emitir fatura #' || COALESCE(NEW.numero_nota, NEW.id::text)
          )
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_create_receivable
AFTER UPDATE ON public.faturas
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_receivable_from_invoice();

-- 5.2 Trigger: Sincronizar status da fatura ao receber
CREATE OR REPLACE FUNCTION public.sync_invoice_status_from_receivable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se conta a receber foi marcada como 'recebido' E está vinculada a uma fatura
  IF NEW.status = 'recebido' AND NEW.fatura_id IS NOT NULL THEN
    UPDATE public.faturas 
    SET status = 'paga'
    WHERE id = NEW.fatura_id AND status != 'paga';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_invoice_status
AFTER UPDATE ON public.contas_receber
FOR EACH ROW
EXECUTE FUNCTION public.sync_invoice_status_from_receivable();