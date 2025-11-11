-- Corrigir função user_is_owner com search_path correto
CREATE OR REPLACE FUNCTION public.user_is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public, auth'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id 
      AND role = 'owner'
      AND is_active = true 
      AND revoked_at IS NULL
  );
END;
$$;

-- Drop política atual que está com problema
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;

-- Criar política DEFINITIVA com subquery inline (sem dependência de função)
CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
USING (
  -- Pode atualizar se contato não tem empresa OU tem acesso à empresa atual
  (company_id IS NULL) OR user_can_access_company(auth.uid(), company_id)
)
WITH CHECK (
  -- Pode definir company_id SE:
  -- 1. É owner (subquery inline direto na tabela user_roles)
  (
    EXISTS (
      SELECT 1 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
        AND role = 'owner'
        AND is_active = true 
        AND revoked_at IS NULL
    )
  )
  OR 
  -- 2. OU tem acesso específico à empresa de destino
  user_can_access_company(auth.uid(), company_id)
);