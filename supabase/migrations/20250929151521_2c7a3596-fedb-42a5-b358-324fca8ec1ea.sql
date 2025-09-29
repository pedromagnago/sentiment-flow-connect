-- Add user profile fields for team management
ALTER TABLE public.profiles 
ADD COLUMN cargo text,
ADD COLUMN horario_atendimento jsonb DEFAULT '{"inicio": "09:00", "fim": "18:00", "dias": ["segunda", "terca", "quarta", "quinta", "sexta"]}'::jsonb,
ADD COLUMN especialidade text[] DEFAULT '{}',
ADD COLUMN ativo boolean DEFAULT true,
ADD COLUMN max_atendimentos_simultaneos integer DEFAULT 5;

-- Add conversation status tracking
CREATE TABLE IF NOT EXISTS public.conversation_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id text NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'em_atendimento', 'finalizado', 'aguardando_retorno')),
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  tags text[] DEFAULT '{}',
  assigned_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  sla_deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation assignments
CREATE POLICY "Users can view assignments for their company" 
ON public.conversation_assignments 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can create assignments" 
ON public.conversation_assignments 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can update assignments" 
ON public.conversation_assignments 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_conversation_assignments_updated_at
  BEFORE UPDATE ON public.conversation_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for conversation assignments
ALTER TABLE public.conversation_assignments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_assignments;