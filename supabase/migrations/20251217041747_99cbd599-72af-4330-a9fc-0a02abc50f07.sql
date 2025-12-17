-- FASE 1: Adicionar company_id à team_invitations e criar invitation_companies

-- 1.1 Adicionar coluna company_id à tabela team_invitations (para compatibilidade com convites simples)
ALTER TABLE public.team_invitations 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- 1.2 Criar tabela invitation_companies para suportar múltiplas empresas por convite
CREATE TABLE IF NOT EXISTS public.invitation_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.team_invitations(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(invitation_id, company_id)
);

-- 1.3 Habilitar RLS na nova tabela
ALTER TABLE public.invitation_companies ENABLE ROW LEVEL SECURITY;

-- 1.4 Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_invitation_companies_invitation_id ON public.invitation_companies(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_companies_company_id ON public.invitation_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_company_id ON public.team_invitations(company_id);

-- 1.5 Políticas RLS para invitation_companies
CREATE POLICY "Admins can manage invitation_companies"
ON public.invitation_companies
FOR ALL
USING (user_is_admin(auth.uid()));

CREATE POLICY "Users can view invitation_companies for their companies"
ON public.invitation_companies
FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

-- 1.6 Criar tabela documentos para onboarding (se não existir)
CREATE TABLE IF NOT EXISTS public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.7 Habilitar RLS na tabela documentos
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- 1.8 Políticas RLS para documentos
CREATE POLICY "Users can create their documents"
ON public.documentos
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view documents for their company"
ON public.documentos
FOR SELECT
USING (
  user_id = auth.uid() OR 
  (company_id IS NOT NULL AND user_can_access_company(auth.uid(), company_id))
);

CREATE POLICY "Users can update their documents"
ON public.documentos
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their documents"
ON public.documentos
FOR DELETE
USING (user_id = auth.uid());