-- Create suggested_actions table
CREATE TABLE IF NOT EXISTS public.suggested_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'payment', 'invoice', 'task', 'question', 'document_analysis'
  extracted_data JSONB, -- Dados extraídos pela IA (valor, vencimento, beneficiário, etc)
  ai_confidence NUMERIC DEFAULT 0, -- 0-1 score de confiança da IA
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'ignored', 'failed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  executed_by UUID REFERENCES public.profiles(id),
  executed_at TIMESTAMP WITH TIME ZONE,
  result_data JSONB, -- Dados do resultado (ID criado no sistema, etc)
  notes TEXT,
  ai_suggestion TEXT -- Texto da sugestão original da IA
);

-- Enable RLS
ALTER TABLE public.suggested_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view suggested actions for their company
CREATE POLICY "Users can view suggested actions for their company"
  ON public.suggested_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id_contact = suggested_actions.contact_id
      AND (c.empresa_id = get_current_company_id() OR c.empresa_id IS NULL)
    )
  );

-- Policy: Users can insert suggested actions
CREATE POLICY "Users can insert suggested actions"
  ON public.suggested_actions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id_contact = suggested_actions.contact_id
      AND (c.empresa_id = get_current_company_id() OR c.empresa_id IS NULL)
    )
  );

-- Policy: Users can update suggested actions
CREATE POLICY "Users can update suggested actions"
  ON public.suggested_actions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contacts c
      WHERE c.id_contact = suggested_actions.contact_id
      AND (c.empresa_id = get_current_company_id() OR c.empresa_id IS NULL)
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_suggested_actions_contact_id ON public.suggested_actions(contact_id);
CREATE INDEX IF NOT EXISTS idx_suggested_actions_message_id ON public.suggested_actions(message_id);
CREATE INDEX IF NOT EXISTS idx_suggested_actions_status ON public.suggested_actions(status);
CREATE INDEX IF NOT EXISTS idx_suggested_actions_created_at ON public.suggested_actions(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_suggested_actions_updated_at
  BEFORE UPDATE ON public.suggested_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();