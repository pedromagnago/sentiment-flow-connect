-- Create contas_pagar table
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  suggested_action_id UUID REFERENCES public.suggested_actions(id) ON DELETE SET NULL,
  
  -- Dados do pagamento
  valor NUMERIC NOT NULL,
  vencimento DATE NOT NULL,
  beneficiario TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  forma_pagamento TEXT, -- 'boleto', 'pix', 'transferencia', etc
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'aprovado', 'pago', 'cancelado'
  pago_em DATE,
  comprovante_url TEXT,
  
  -- Dados do contato
  contact_id TEXT,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  
  -- Metadados
  observacoes TEXT,
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view payables for their company
CREATE POLICY "Users can view payables for their company"
  ON public.contas_pagar
  FOR SELECT
  USING (
    company_id = get_current_company_id()
  );

-- Policy: Users can insert payables for their company
CREATE POLICY "Users can insert payables for their company"
  ON public.contas_pagar
  FOR INSERT
  WITH CHECK (
    company_id = get_current_company_id() AND
    user_id = auth.uid()
  );

-- Policy: Users can update payables for their company
CREATE POLICY "Users can update payables for their company"
  ON public.contas_pagar
  FOR UPDATE
  USING (
    company_id = get_current_company_id()
  );

-- Policy: Users can delete payables for their company
CREATE POLICY "Users can delete payables for their company"
  ON public.contas_pagar
  FOR DELETE
  USING (
    company_id = get_current_company_id()
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contas_pagar_company_id ON public.contas_pagar(company_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar(vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_contact_id ON public.contas_pagar(contact_id);

-- Add trigger for updated_at
CREATE TRIGGER update_contas_pagar_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();