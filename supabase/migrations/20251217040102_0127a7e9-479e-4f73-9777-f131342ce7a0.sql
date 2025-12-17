-- Create reconciliation_links table for many-to-many relationships
CREATE TABLE public.reconciliation_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id),
  user_id uuid NOT NULL,
  
  -- The linked items (at least one must be set)
  bank_transaction_id uuid REFERENCES public.bank_transactions(id),
  conta_pagar_id uuid REFERENCES public.contas_pagar(id),
  conta_receber_id uuid REFERENCES public.contas_receber(id),
  
  -- Grouping - links with same group_id belong together
  group_id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Metadata
  valor_alocado numeric, -- Partial allocation amount
  observacao text,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  
  -- Ensure at least one reference is set
  CONSTRAINT at_least_one_reference CHECK (
    bank_transaction_id IS NOT NULL OR 
    conta_pagar_id IS NOT NULL OR 
    conta_receber_id IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE public.reconciliation_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reconciliation links for their company"
ON public.reconciliation_links FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can create reconciliation links for their company"
ON public.reconciliation_links FOR INSERT
WITH CHECK (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can update reconciliation links for their company"
ON public.reconciliation_links FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can delete reconciliation links for their company"
ON public.reconciliation_links FOR DELETE
USING (user_can_access_company(auth.uid(), company_id));

-- Indexes for performance
CREATE INDEX idx_reconciliation_links_company ON public.reconciliation_links(company_id);
CREATE INDEX idx_reconciliation_links_group ON public.reconciliation_links(group_id);
CREATE INDEX idx_reconciliation_links_transaction ON public.reconciliation_links(bank_transaction_id);
CREATE INDEX idx_reconciliation_links_pagar ON public.reconciliation_links(conta_pagar_id);
CREATE INDEX idx_reconciliation_links_receber ON public.reconciliation_links(conta_receber_id);

-- Comments
COMMENT ON TABLE public.reconciliation_links IS 'Links many-to-many between bank transactions and accounts payable/receivable';
COMMENT ON COLUMN public.reconciliation_links.group_id IS 'Groups related links together (e.g., multiple payables linked to multiple transactions)';
COMMENT ON COLUMN public.reconciliation_links.valor_alocado IS 'Partial amount allocated when splitting transactions';