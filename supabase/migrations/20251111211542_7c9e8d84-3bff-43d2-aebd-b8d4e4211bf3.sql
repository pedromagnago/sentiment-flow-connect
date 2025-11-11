-- Corrigir política RLS para permitir owners classificarem contatos para qualquer empresa
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;

-- Criar política CORRIGIDA - sem condição restritiva para owners
CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
USING (
  -- Pode atualizar se:
  -- 1. Contato não tem empresa (qualquer usuário pode classificar)
  -- 2. OU tem acesso à empresa atual do contato
  (company_id IS NULL) OR user_can_access_company(auth.uid(), company_id)
)
WITH CHECK (
  -- Permite definir company_id SE:
  -- 1. Usuário é owner (pode classificar para QUALQUER empresa) - SEM restrições
  -- 2. OU tem acesso específico à empresa de destino
  user_is_owner(auth.uid()) OR user_can_access_company(auth.uid(), company_id)
);