-- Create document_analysis table
CREATE TABLE IF NOT EXISTS public.document_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT NOT NULL, -- 'pdf', 'image', 'audio'
  analysis_result JSONB NOT NULL,
  extracted_text TEXT,
  summary TEXT,
  suggested_action_id UUID REFERENCES public.suggested_actions(id),
  contact_id TEXT,
  message_id UUID REFERENCES public.messages(id),
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view document analysis for their company"
  ON public.document_analysis
  FOR SELECT
  TO authenticated
  USING (company_id = get_current_company_id());

CREATE POLICY "Users can insert document analysis for their company"
  ON public.document_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = get_current_company_id() AND user_id = auth.uid());

CREATE POLICY "Users can update document analysis for their company"
  ON public.document_analysis
  FOR UPDATE
  TO authenticated
  USING (company_id = get_current_company_id());

CREATE POLICY "Users can delete document analysis for their company"
  ON public.document_analysis
  FOR DELETE
  TO authenticated
  USING (company_id = get_current_company_id());

-- Add trigger for updated_at
CREATE TRIGGER update_document_analysis_updated_at
  BEFORE UPDATE ON public.document_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_document_analysis_company_id ON public.document_analysis(company_id);
CREATE INDEX idx_document_analysis_contact_id ON public.document_analysis(contact_id);
CREATE INDEX idx_document_analysis_created_at ON public.document_analysis(created_at DESC);