-- ============================================
-- SOLUÇÃO DEFINITIVA: RLS com subqueries puras
-- Remove dependência de funções SECURITY DEFINER
-- ============================================

-- Drop todas as políticas atuais de contacts
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can create contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can view contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts for their company" ON public.contacts;

-- ============================================
-- POLÍTICA UPDATE - Permite owners classificarem para qualquer empresa
-- ============================================
CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
USING (
  -- Pode atualizar se:
  -- 1. Contato não tem empresa (qualquer usuário pode editar não-classificados)
  (company_id IS NULL) 
  OR 
  -- 2. OU usuário tem role na empresa atual do contato
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND company_id = contacts.company_id
      AND is_active = true 
      AND revoked_at IS NULL
  )
)
WITH CHECK (
  -- Pode definir company_id SE:
  -- 1. É owner de QUALQUER empresa (pode classificar para qualquer empresa)
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true 
      AND revoked_at IS NULL
  )
  OR 
  -- 2. OU tem role específica na empresa de destino
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND company_id = contacts.company_id
      AND is_active = true 
      AND revoked_at IS NULL
  )
);

-- ============================================
-- POLÍTICA INSERT
-- ============================================
CREATE POLICY "Users can create contacts for their company"
ON public.contacts
FOR INSERT
WITH CHECK (
  (company_id IS NULL) 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND company_id = contacts.company_id
      AND is_active = true 
      AND revoked_at IS NULL
  )
);

-- ============================================
-- POLÍTICA SELECT
-- ============================================
CREATE POLICY "Users can view contacts for their company"
ON public.contacts
FOR SELECT
USING (
  (company_id IS NULL) 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND company_id = contacts.company_id
      AND is_active = true 
      AND revoked_at IS NULL
  )
);

-- ============================================
-- POLÍTICA DELETE
-- ============================================
CREATE POLICY "Users can delete contacts for their company"
ON public.contacts
FOR DELETE
USING (
  (company_id IS NULL) 
  OR 
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND company_id = contacts.company_id
      AND is_active = true 
      AND revoked_at IS NULL
  )
);