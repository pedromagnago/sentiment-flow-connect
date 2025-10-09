-- =====================================================
-- FASE 1A: SEGURANÇA - Sistema de Roles Seguro
-- =====================================================

-- PARTE 1: Criar Infraestrutura Segura
-- =====================================================

-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'supervisor', 'operator', 'viewer');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  revoked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role, company_id)
);

-- 3. Índices para performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_company_id ON public.user_roles(company_id);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active) WHERE is_active = true;

-- 4. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view roles in their company"
ON public.user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = user_roles.company_id
      AND ur.role IN ('admin', 'owner')
      AND ur.is_active = true
  )
);

CREATE POLICY "Owners can manage roles"
ON public.user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = user_roles.company_id
      AND ur.role = 'owner'
      AND ur.is_active = true
  )
);

-- 6. Funções de segurança (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role, _company_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND is_active = true
      AND revoked_at IS NULL
      AND (_company_id IS NULL OR company_id = _company_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID, _company_id UUID DEFAULT NULL)
RETURNS TABLE(role public.app_role, company_id UUID)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role, company_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
    AND revoked_at IS NULL
    AND (_company_id IS NULL OR company_id = _company_id);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id UUID, _company_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'owner')
      AND is_active = true
      AND revoked_at IS NULL
      AND (_company_id IS NULL OR company_id = _company_id)
  );
$$;

-- 7. Migrar dados existentes de profiles.role para user_roles
INSERT INTO public.user_roles (user_id, role, company_id, granted_by, granted_at)
SELECT 
  p.id,
  CASE 
    WHEN p.role = 'owner' THEN 'owner'::public.app_role
    WHEN p.role = 'admin' THEN 'admin'::public.app_role
    ELSE 'operator'::public.app_role
  END,
  p.company_id,
  p.id, -- Self-granted na migração
  p.created_at
FROM public.profiles p
WHERE p.role IS NOT NULL 
  AND p.company_id IS NOT NULL
ON CONFLICT (user_id, role, company_id) DO NOTHING;

-- =====================================================
-- PARTE 2: Atualizar RLS Policies em Tabelas Existentes
-- =====================================================

-- AUDIT_LOGS
DROP POLICY IF EXISTS "Admins can view audit logs for their company" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs for their company"
ON public.audit_logs FOR SELECT
USING (
  public.is_admin_or_owner(auth.uid(), (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
);

-- SETTINGS
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings"
ON public.settings FOR ALL
USING (public.is_admin_or_owner(auth.uid()));

-- CONVERSATION_ASSIGNMENTS
DROP POLICY IF EXISTS "Users can create assignments" ON public.conversation_assignments;
DROP POLICY IF EXISTS "Users can update assignments" ON public.conversation_assignments;
DROP POLICY IF EXISTS "Users can view assignments for their company" ON public.conversation_assignments;

CREATE POLICY "Users can create assignments"
ON public.conversation_assignments FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR 
  public.is_admin_or_owner(auth.uid(), (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Users can update assignments"
ON public.conversation_assignments FOR UPDATE
USING (
  user_id = auth.uid() OR 
  public.is_admin_or_owner(auth.uid(), (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "Users can view assignments for their company"
ON public.conversation_assignments FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.is_admin_or_owner(auth.uid(), (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
);

-- CONTAS_PAGAR (Exemplo com limite de valor para operators)
DROP POLICY IF EXISTS "Users can insert payables for their company" ON public.contas_pagar;
DROP POLICY IF EXISTS "Users can update payables for their company" ON public.contas_pagar;
DROP POLICY IF EXISTS "Users can delete payables for their company" ON public.contas_pagar;

CREATE POLICY "Users can insert payables for their company"
ON public.contas_pagar FOR INSERT
WITH CHECK (
  company_id = get_current_company_id() AND
  user_id = auth.uid() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'supervisor', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can update payables for their company"
ON public.contas_pagar FOR UPDATE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'supervisor', company_id) OR
    (public.has_role(auth.uid(), 'operator', company_id) AND valor <= 5000)
  )
);

CREATE POLICY "Users can delete payables for their company"
ON public.contas_pagar FOR DELETE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id)
  )
);

-- TASKS
DROP POLICY IF EXISTS "Users can insert tasks for their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks for their company" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks for their company" ON public.tasks;

CREATE POLICY "Users can insert tasks for their company"
ON public.tasks FOR INSERT
WITH CHECK (
  company_id = get_current_company_id() AND
  user_id = auth.uid() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'supervisor', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can update tasks for their company"
ON public.tasks FOR UPDATE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'supervisor', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can delete tasks for their company"
ON public.tasks FOR DELETE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id)
  )
);

-- FATURAS
DROP POLICY IF EXISTS "Users can insert invoices for their company" ON public.faturas;
DROP POLICY IF EXISTS "Users can update invoices for their company" ON public.faturas;
DROP POLICY IF EXISTS "Users can delete invoices for their company" ON public.faturas;

CREATE POLICY "Users can insert invoices for their company"
ON public.faturas FOR INSERT
WITH CHECK (
  company_id = get_current_company_id() AND
  user_id = auth.uid() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can update invoices for their company"
ON public.faturas FOR UPDATE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can delete invoices for their company"
ON public.faturas FOR DELETE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id)
  )
);

-- DOCUMENT_ANALYSIS
DROP POLICY IF EXISTS "Users can insert document analysis for their company" ON public.document_analysis;
DROP POLICY IF EXISTS "Users can update document analysis for their company" ON public.document_analysis;
DROP POLICY IF EXISTS "Users can delete document analysis for their company" ON public.document_analysis;

CREATE POLICY "Users can insert document analysis for their company"
ON public.document_analysis FOR INSERT
WITH CHECK (
  company_id = get_current_company_id() AND
  user_id = auth.uid() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can update document analysis for their company"
ON public.document_analysis FOR UPDATE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id) OR
    public.has_role(auth.uid(), 'operator', company_id)
  )
);

CREATE POLICY "Users can delete document analysis for their company"
ON public.document_analysis FOR DELETE
USING (
  company_id = get_current_company_id() AND
  (
    public.has_role(auth.uid(), 'owner', company_id) OR
    public.has_role(auth.uid(), 'admin', company_id)
  )
);

-- =====================================================
-- COMENTÁRIO: profiles.role DEPRECADO (não deletado)
-- =====================================================
-- A coluna profiles.role NÃO será deletada nesta migração
-- para permitir rollback seguro. Deve ser removida manualmente
-- após confirmar que tudo funciona corretamente.