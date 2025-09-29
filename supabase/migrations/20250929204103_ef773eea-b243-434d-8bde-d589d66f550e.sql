-- Create faturas table
CREATE TABLE IF NOT EXISTS public.faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  suggested_action_id UUID REFERENCES public.suggested_actions(id) ON DELETE SET NULL,
  
  -- Dados da fatura
  valor NUMERIC NOT NULL,
  descricao TEXT NOT NULL,
  destinatario TEXT NOT NULL,
  numero_nota TEXT,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  
  -- Dados fiscais
  tipo_nota TEXT, -- 'nfse', 'nfe', 'nfce'
  cfop TEXT,
  natureza_operacao TEXT,
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'emitida', 'enviada', 'paga', 'cancelada'
  emitida_em TIMESTAMP WITH TIME ZONE,
  xml_url TEXT,
  pdf_url TEXT,
  
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
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invoices for their company
CREATE POLICY "Users can view invoices for their company"
  ON public.faturas
  FOR SELECT
  USING (
    company_id = get_current_company_id()
  );

-- Policy: Users can insert invoices for their company
CREATE POLICY "Users can insert invoices for their company"
  ON public.faturas
  FOR INSERT
  WITH CHECK (
    company_id = get_current_company_id() AND
    user_id = auth.uid()
  );

-- Policy: Users can update invoices for their company
CREATE POLICY "Users can update invoices for their company"
  ON public.faturas
  FOR UPDATE
  USING (
    company_id = get_current_company_id()
  );

-- Policy: Users can delete invoices for their company
CREATE POLICY "Users can delete invoices for their company"
  ON public.faturas
  FOR DELETE
  USING (
    company_id = get_current_company_id()
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_faturas_company_id ON public.faturas(company_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON public.faturas(status);
CREATE INDEX IF NOT EXISTS idx_faturas_data_emissao ON public.faturas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_faturas_contact_id ON public.faturas(contact_id);

-- Add trigger for updated_at
CREATE TRIGGER update_faturas_updated_at
  BEFORE UPDATE ON public.faturas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();