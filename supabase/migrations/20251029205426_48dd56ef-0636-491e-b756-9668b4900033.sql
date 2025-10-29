-- Adicionar políticas RLS para a tabela tasks
-- Permitir usuários visualizarem tasks de suas empresas
CREATE POLICY "Users can view tasks for their company"
ON tasks
FOR SELECT
USING (
  user_can_access_company(auth.uid(), company_id)
);

-- Permitir usuários criarem tasks para suas empresas
CREATE POLICY "Users can create tasks for their company"
ON tasks
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

-- Permitir usuários atualizarem tasks de suas empresas
CREATE POLICY "Users can update tasks for their company"
ON tasks
FOR UPDATE
USING (
  user_can_access_company(auth.uid(), company_id)
);

-- Permitir usuários deletarem tasks de suas empresas
CREATE POLICY "Users can delete tasks for their company"
ON tasks
FOR DELETE
USING (
  user_can_access_company(auth.uid(), company_id)
);

-- Adicionar políticas RLS para bank_accounts (também sem políticas)
CREATE POLICY "Users can view bank accounts for their company"
ON bank_accounts
FOR SELECT
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create bank accounts for their company"
ON bank_accounts
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update bank accounts for their company"
ON bank_accounts
FOR UPDATE
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can delete bank accounts for their company"
ON bank_accounts
FOR DELETE
USING (
  user_can_access_company(auth.uid(), company_id)
);

-- Adicionar políticas RLS para bank_transactions (também sem políticas)
CREATE POLICY "Users can view bank transactions for their company"
ON bank_transactions
FOR SELECT
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create bank transactions for their company"
ON bank_transactions
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update bank transactions for their company"
ON bank_transactions
FOR UPDATE
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can delete bank transactions for their company"
ON bank_transactions
FOR DELETE
USING (
  user_can_access_company(auth.uid(), company_id)
);

-- Adicionar políticas RLS para reconciliation_logs (também sem políticas)
CREATE POLICY "Users can view reconciliation logs for their company"
ON reconciliation_logs
FOR SELECT
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create reconciliation logs for their company"
ON reconciliation_logs
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

-- Adicionar políticas RLS para formularios_onboarding (também sem políticas)
CREATE POLICY "Users can view their onboarding forms"
ON formularios_onboarding
FOR SELECT
USING (
  user_id = auth.uid() 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create their onboarding forms"
ON formularios_onboarding
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update their onboarding forms"
ON formularios_onboarding
FOR UPDATE
USING (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

-- Adicionar políticas RLS para documents (também sem políticas)
CREATE POLICY "Users can view documents for their company"
ON documents
FOR SELECT
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create documents"
ON documents
FOR INSERT
WITH CHECK (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update documents for their company"
ON documents
FOR UPDATE
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can delete documents for their company"
ON documents
FOR DELETE
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

-- Adicionar política RLS para ai_classification_rules (também sem políticas)
CREATE POLICY "Users can view classification rules for their company"
ON ai_classification_rules
FOR SELECT
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create classification rules for their company"
ON ai_classification_rules
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update classification rules for their company"
ON ai_classification_rules
FOR UPDATE
USING (
  user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can delete classification rules for their company"
ON ai_classification_rules
FOR DELETE
USING (
  user_can_access_company(auth.uid(), company_id)
);