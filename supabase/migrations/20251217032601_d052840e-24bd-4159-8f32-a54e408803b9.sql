-- =====================================================
-- FASE 1: Migração CFI - Estrutura Financeira Completa
-- =====================================================

-- 1. ENUM para status de transação
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE public.transaction_status AS ENUM ('pending', 'classified', 'audited');
  END IF;
END $$;

-- 2. TABELA: categories (Plano de Contas Hierárquico)
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  codigo text NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa', 'ativo', 'passivo')),
  dre_grupo text CHECK (dre_grupo IN (
    'receita_bruta', 
    'deducoes_receita', 
    'custo_mercadoria_vendida',
    'despesas_operacionais',
    'despesas_administrativas',
    'despesas_comerciais',
    'despesas_financeiras',
    'outras_receitas',
    'outras_despesas',
    'impostos'
  )),
  fluxo_caixa_tipo text CHECK (fluxo_caixa_tipo IN (
    'operacional_entrada',
    'operacional_saida',
    'investimento_entrada',
    'investimento_saida',
    'financiamento_entrada',
    'financiamento_saida'
  )),
  is_fixed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  nivel integer DEFAULT 1,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, codigo)
);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_company ON public.categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_tipo ON public.categories(tipo);
CREATE INDEX IF NOT EXISTS idx_categories_dre_grupo ON public.categories(dre_grupo);

-- RLS para categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories for their company"
ON public.categories FOR SELECT
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create categories for their company"
ON public.categories FOR INSERT
WITH CHECK (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update categories for their company"
ON public.categories FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (user_is_admin(auth.uid()));

-- 3. ADICIONAR CAMPOS em bank_transactions
ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS transaction_status text DEFAULT 'pending' 
  CHECK (transaction_status IN ('pending', 'classified', 'audited'));

ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS attachment_url text;

ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS audited_at timestamptz;

ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS audited_by uuid REFERENCES auth.users(id);

-- Índice para category_id
CREATE INDEX IF NOT EXISTS idx_bank_transactions_category ON public.bank_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON public.bank_transactions(transaction_status);

-- 4. TABELA: audit_periods (Trava de Segurança BPO)
CREATE TABLE IF NOT EXISTS public.audit_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked', 'approved')),
  locked_by uuid REFERENCES auth.users(id),
  locked_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  notes text,
  transactions_count integer DEFAULT 0,
  total_debits numeric(15,2) DEFAULT 0,
  total_credits numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, period_start, period_end)
);

-- Índices para audit_periods
CREATE INDEX IF NOT EXISTS idx_audit_periods_company ON public.audit_periods(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_periods_status ON public.audit_periods(status);
CREATE INDEX IF NOT EXISTS idx_audit_periods_dates ON public.audit_periods(period_start, period_end);

-- RLS para audit_periods
ALTER TABLE public.audit_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit periods for their company"
ON public.audit_periods FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Admins can create audit periods"
ON public.audit_periods FOR INSERT
WITH CHECK (user_is_admin(auth.uid()) AND user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Admins can update audit periods"
ON public.audit_periods FOR UPDATE
USING (user_is_admin(auth.uid()) AND user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Admins can delete audit periods"
ON public.audit_periods FOR DELETE
USING (user_is_admin(auth.uid()));

-- 5. TABELA: daily_balances (Saldos Diários para Conciliação)
CREATE TABLE IF NOT EXISTS public.daily_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  bank_account_id uuid REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  date date NOT NULL,
  opening_balance numeric(15,2) DEFAULT 0,
  closing_balance numeric(15,2) NOT NULL,
  calculated_balance numeric(15,2),
  difference numeric(15,2) GENERATED ALWAYS AS (closing_balance - COALESCE(calculated_balance, closing_balance)) STORED,
  is_reconciled boolean DEFAULT false,
  source text CHECK (source IN ('ofx', 'manual', 'api', 'calculated')),
  reconciled_by uuid REFERENCES auth.users(id),
  reconciled_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, bank_account_id, date)
);

-- Índices para daily_balances
CREATE INDEX IF NOT EXISTS idx_daily_balances_company ON public.daily_balances(company_id);
CREATE INDEX IF NOT EXISTS idx_daily_balances_account ON public.daily_balances(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_daily_balances_date ON public.daily_balances(date);
CREATE INDEX IF NOT EXISTS idx_daily_balances_reconciled ON public.daily_balances(is_reconciled);

-- RLS para daily_balances
ALTER TABLE public.daily_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view daily balances for their company"
ON public.daily_balances FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can create daily balances for their company"
ON public.daily_balances FOR INSERT
WITH CHECK (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can update daily balances for their company"
ON public.daily_balances FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Admins can delete daily balances"
ON public.daily_balances FOR DELETE
USING (user_is_admin(auth.uid()));

-- 6. FUNÇÃO: Verificar se período está bloqueado
CREATE OR REPLACE FUNCTION public.is_period_locked(
  _company_id uuid,
  _transaction_date date
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.audit_periods
    WHERE company_id = _company_id
      AND status IN ('locked', 'approved')
      AND _transaction_date BETWEEN period_start AND period_end
  );
$$;

-- 7. TRIGGER: Impedir edição de transações em períodos bloqueados
CREATE OR REPLACE FUNCTION public.check_audit_period_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permitir admins/owners bypassar a trava
  IF user_is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Verificar se o período está bloqueado
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    IF public.is_period_locked(OLD.company_id, OLD.date) THEN
      RAISE EXCEPTION 'Este período está fechado para edição. Contate o BPO para alterações.';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF public.is_period_locked(NEW.company_id, NEW.date) THEN
      RAISE EXCEPTION 'Este período está fechado para edição. Contate o BPO para alterações.';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger em bank_transactions
DROP TRIGGER IF EXISTS check_audit_lock_on_transactions ON public.bank_transactions;
CREATE TRIGGER check_audit_lock_on_transactions
  BEFORE INSERT OR UPDATE OR DELETE ON public.bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_audit_period_lock();

-- 8. TRIGGER: Atualizar updated_at automaticamente
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_periods_updated_at
  BEFORE UPDATE ON public.audit_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_balances_updated_at
  BEFORE UPDATE ON public.daily_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. INSERIR CATEGORIAS PADRÃO (Estrutura DRE FullBPO)
INSERT INTO public.categories (codigo, nome, tipo, dre_grupo, fluxo_caixa_tipo, nivel, ordem, company_id) VALUES
-- RECEITAS
('1', 'RECEITAS', 'receita', NULL, NULL, 1, 1, NULL),
('1.1', 'Receita Bruta de Vendas', 'receita', 'receita_bruta', 'operacional_entrada', 2, 1, NULL),
('1.1.1', 'Venda de Produtos', 'receita', 'receita_bruta', 'operacional_entrada', 3, 1, NULL),
('1.1.2', 'Prestação de Serviços', 'receita', 'receita_bruta', 'operacional_entrada', 3, 2, NULL),
('1.1.3', 'Receita de Assinaturas', 'receita', 'receita_bruta', 'operacional_entrada', 3, 3, NULL),
('1.2', 'Deduções da Receita', 'receita', 'deducoes_receita', 'operacional_saida', 2, 2, NULL),
('1.2.1', 'Impostos sobre Vendas', 'receita', 'deducoes_receita', 'operacional_saida', 3, 1, NULL),
('1.2.2', 'Devoluções e Abatimentos', 'receita', 'deducoes_receita', 'operacional_saida', 3, 2, NULL),

-- CUSTOS
('2', 'CUSTOS', 'despesa', NULL, NULL, 1, 2, NULL),
('2.1', 'Custo dos Produtos Vendidos', 'despesa', 'custo_mercadoria_vendida', 'operacional_saida', 2, 1, NULL),
('2.1.1', 'Matéria Prima', 'despesa', 'custo_mercadoria_vendida', 'operacional_saida', 3, 1, NULL),
('2.1.2', 'Mão de Obra Direta', 'despesa', 'custo_mercadoria_vendida', 'operacional_saida', 3, 2, NULL),
('2.2', 'Custo dos Serviços Prestados', 'despesa', 'custo_mercadoria_vendida', 'operacional_saida', 2, 2, NULL),
('2.2.1', 'Custos Diretos de Serviço', 'despesa', 'custo_mercadoria_vendida', 'operacional_saida', 3, 1, NULL),

-- DESPESAS OPERACIONAIS
('3', 'DESPESAS OPERACIONAIS', 'despesa', NULL, NULL, 1, 3, NULL),
('3.1', 'Despesas Administrativas', 'despesa', 'despesas_administrativas', 'operacional_saida', 2, 1, NULL),
('3.1.1', 'Salários e Encargos', 'despesa', 'despesas_administrativas', 'operacional_saida', 3, 1, NULL),
('3.1.2', 'Aluguel e Condomínio', 'despesa', 'despesas_administrativas', 'operacional_saida', 3, 2, NULL),
('3.1.3', 'Energia e Utilities', 'despesa', 'despesas_administrativas', 'operacional_saida', 3, 3, NULL),
('3.1.4', 'Contabilidade e Assessoria', 'despesa', 'despesas_administrativas', 'operacional_saida', 3, 4, NULL),
('3.1.5', 'Software e Tecnologia', 'despesa', 'despesas_administrativas', 'operacional_saida', 3, 5, NULL),
('3.2', 'Despesas Comerciais', 'despesa', 'despesas_comerciais', 'operacional_saida', 2, 2, NULL),
('3.2.1', 'Marketing e Publicidade', 'despesa', 'despesas_comerciais', 'operacional_saida', 3, 1, NULL),
('3.2.2', 'Comissões de Vendas', 'despesa', 'despesas_comerciais', 'operacional_saida', 3, 2, NULL),
('3.3', 'Despesas Financeiras', 'despesa', 'despesas_financeiras', 'financiamento_saida', 2, 3, NULL),
('3.3.1', 'Juros e Multas', 'despesa', 'despesas_financeiras', 'financiamento_saida', 3, 1, NULL),
('3.3.2', 'Tarifas Bancárias', 'despesa', 'despesas_financeiras', 'financiamento_saida', 3, 2, NULL),
('3.3.3', 'IOF', 'despesa', 'despesas_financeiras', 'financiamento_saida', 3, 3, NULL),

-- OUTRAS RECEITAS/DESPESAS
('4', 'OUTRAS RECEITAS', 'receita', 'outras_receitas', 'operacional_entrada', 1, 4, NULL),
('4.1', 'Receitas Financeiras', 'receita', 'outras_receitas', 'financiamento_entrada', 2, 1, NULL),
('4.1.1', 'Rendimentos de Aplicações', 'receita', 'outras_receitas', 'financiamento_entrada', 3, 1, NULL),
('4.1.2', 'Descontos Obtidos', 'receita', 'outras_receitas', 'operacional_entrada', 3, 2, NULL),

-- INVESTIMENTOS
('5', 'INVESTIMENTOS', 'ativo', NULL, NULL, 1, 5, NULL),
('5.1', 'Aquisição de Ativos', 'ativo', NULL, 'investimento_saida', 2, 1, NULL),
('5.1.1', 'Equipamentos', 'ativo', NULL, 'investimento_saida', 3, 1, NULL),
('5.1.2', 'Veículos', 'ativo', NULL, 'investimento_saida', 3, 2, NULL),
('5.1.3', 'Móveis e Utensílios', 'ativo', NULL, 'investimento_saida', 3, 3, NULL),

-- FINANCIAMENTOS
('6', 'FINANCIAMENTOS', 'passivo', NULL, NULL, 1, 6, NULL),
('6.1', 'Empréstimos', 'passivo', NULL, 'financiamento_entrada', 2, 1, NULL),
('6.1.1', 'Empréstimo Bancário', 'passivo', NULL, 'financiamento_entrada', 3, 1, NULL),
('6.1.2', 'Financiamento de Equipamentos', 'passivo', NULL, 'financiamento_entrada', 3, 2, NULL),
('6.2', 'Amortizações', 'passivo', NULL, 'financiamento_saida', 2, 2, NULL),
('6.2.1', 'Pagamento de Empréstimos', 'passivo', NULL, 'financiamento_saida', 3, 1, NULL)

ON CONFLICT (company_id, codigo) DO NOTHING;

-- Atualizar parent_id das categorias
UPDATE public.categories c1 
SET parent_id = c2.id 
FROM public.categories c2 
WHERE c1.codigo LIKE c2.codigo || '.%' 
  AND length(c1.codigo) = length(c2.codigo) + 2
  AND c1.company_id IS NULL 
  AND c2.company_id IS NULL;