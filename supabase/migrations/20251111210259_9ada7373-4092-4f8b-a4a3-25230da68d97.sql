-- Drop política atual problemática
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;

-- Criar política SIMPLIFICADA para classificação
CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
USING (
  -- Pode atualizar se:
  -- 1. Contato não tem empresa (permite classificação por qualquer usuário autenticado)
  -- 2. OU tem acesso à empresa atual do contato
  (company_id IS NULL) OR user_can_access_company(auth.uid(), company_id)
)
WITH CHECK (
  -- Após update, permite definir company_id SE:
  -- 1. Usuário é owner (pode classificar para qualquer empresa)
  -- 2. OU tem acesso à empresa de destino
  user_is_owner(auth.uid()) OR 
  (company_id IS NOT NULL AND user_can_access_company(auth.uid(), company_id))
);