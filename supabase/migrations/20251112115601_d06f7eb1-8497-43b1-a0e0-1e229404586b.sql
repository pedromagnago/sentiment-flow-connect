-- ================================================
-- FASE 7: Correção de Segurança RLS Policies
-- ================================================

-- 1. Corrigir policy de INSERT na tabela contacts
-- A policy atual permite classificar contatos para qualquer empresa
-- Nova policy: só pode classificar para empresas onde o usuário tem acesso

DROP POLICY IF EXISTS "Users can create contacts for their company" ON contacts;

CREATE POLICY "Users can create contacts for their company"
ON contacts FOR INSERT
WITH CHECK (
  company_id IS NULL OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = contacts.company_id
      AND user_roles.is_active = true
      AND user_roles.revoked_at IS NULL
  )
);

-- 2. Corrigir policy de INSERT na tabela messages
-- Garantir que mensagens só podem ser associadas a contatos de empresas com acesso

DROP POLICY IF EXISTS "Users can create messages" ON messages;

CREATE POLICY "Users can create messages"
ON messages FOR INSERT
WITH CHECK (
  contact_id IS NULL OR EXISTS (
    SELECT 1 FROM contacts c
    JOIN user_roles ur ON c.company_id = ur.company_id
    WHERE c.id_contact = messages.contact_id
      AND ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
  )
);

-- 3. Adicionar policy de SELECT em messages considerando company_id do contato

DROP POLICY IF EXISTS "Users can view all messages" ON messages;

CREATE POLICY "Users can view messages for their companies"
ON messages FOR SELECT
USING (
  contact_id IS NULL OR EXISTS (
    SELECT 1 FROM contacts c
    JOIN user_roles ur ON c.company_id = ur.company_id
    WHERE c.id_contact = messages.contact_id
      AND ur.user_id = auth.uid()
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
  )
);

-- 4. Corrigir policy UPDATE de contacts para verificar permissão na nova empresa

DROP POLICY IF EXISTS "Users can update contacts for their company" ON contacts;

CREATE POLICY "Users can update contacts for their company"
ON contacts FOR UPDATE
USING (
  company_id IS NULL OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = contacts.company_id
      AND user_roles.is_active = true
      AND user_roles.revoked_at IS NULL
  )
)
WITH CHECK (
  -- Verificar se usuário é owner (pode reclassificar para qualquer empresa)
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'owner'
      AND user_roles.is_active = true
      AND user_roles.revoked_at IS NULL
  )
  OR
  -- OU se tem acesso à nova empresa de destino
  (company_id IS NULL OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = contacts.company_id
      AND user_roles.is_active = true
      AND user_roles.revoked_at IS NULL
  ))
);

-- 5. Adicionar índices para melhor performance nas queries de RLS

CREATE INDEX IF NOT EXISTS idx_user_roles_user_company 
ON user_roles(user_id, company_id) 
WHERE is_active = true AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_company 
ON contacts(company_id) 
WHERE company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_contact 
ON messages(contact_id) 
WHERE contact_id IS NOT NULL;