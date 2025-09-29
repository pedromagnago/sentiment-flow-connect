-- Create tasks table (internal tasks, separate from ClickUp)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  suggested_action_id UUID REFERENCES public.suggested_actions(id) ON DELETE SET NULL,
  
  -- Dados da tarefa
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo DATE,
  prioridade TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Status e workflow
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  responsavel_id UUID REFERENCES public.profiles(id),
  
  -- Dados do contato
  contact_id TEXT,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  
  -- Metadados
  tags TEXT[],
  observacoes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks for their company
CREATE POLICY "Users can view tasks for their company"
  ON public.tasks
  FOR SELECT
  USING (
    company_id = get_current_company_id()
  );

-- Policy: Users can insert tasks for their company
CREATE POLICY "Users can insert tasks for their company"
  ON public.tasks
  FOR INSERT
  WITH CHECK (
    company_id = get_current_company_id() AND
    user_id = auth.uid()
  );

-- Policy: Users can update tasks for their company
CREATE POLICY "Users can update tasks for their company"
  ON public.tasks
  FOR UPDATE
  USING (
    company_id = get_current_company_id()
  );

-- Policy: Users can delete tasks for their company
CREATE POLICY "Users can delete tasks for their company"
  ON public.tasks
  FOR DELETE
  USING (
    company_id = get_current_company_id()
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_prazo ON public.tasks(prazo);
CREATE INDEX IF NOT EXISTS idx_tasks_responsavel_id ON public.tasks(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON public.tasks(contact_id);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();