-- Migration: Update RLS policies to use new company access functions (Part 1)
-- Date: 2025-01-29
-- Description: Replace get_current_company_id with user_can_access_company

-- Step 1: Create helper functions first
CREATE OR REPLACE FUNCTION public.user_can_access_company(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = _user_id 
      AND company_id = _company_id 
      AND is_active = true 
      AND revoked_at IS NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = _user_id 
      AND role IN ('admin', 'owner')
      AND is_active = true 
      AND revoked_at IS NULL
  );
END;
$$;

-- Step 2: Update CONTACTS RLS policies
DROP POLICY IF EXISTS "Users can view contacts for their company" ON contacts;
DROP POLICY IF EXISTS "Users can create contacts for their company" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts for their company" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts for their company" ON contacts;

CREATE POLICY "Users can view contacts for their company"
ON contacts FOR SELECT
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can create contacts for their company"
ON contacts FOR INSERT
WITH CHECK (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update contacts for their company"
ON contacts FOR UPDATE
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can delete contacts for their company"
ON contacts FOR DELETE
USING (
  company_id IS NULL 
  OR user_can_access_company(auth.uid(), company_id)
);

-- Step 3: Update CONTAS_PAGAR RLS policies
DROP POLICY IF EXISTS "Users can view payables for their company" ON contas_pagar;
DROP POLICY IF EXISTS "Users can insert payables for their company" ON contas_pagar;
DROP POLICY IF EXISTS "Users can update payables for their company" ON contas_pagar;
DROP POLICY IF EXISTS "Users can delete payables for their company" ON contas_pagar;

CREATE POLICY "Users can view payables for their company"
ON contas_pagar FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can insert payables for their company"
ON contas_pagar FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update payables for their company"
ON contas_pagar FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can delete payables for their company"
ON contas_pagar FOR DELETE
USING (user_can_access_company(auth.uid(), company_id));

-- Step 4: Update CONTAS_RECEBER RLS policies
DROP POLICY IF EXISTS "Users can view receivables for their company" ON contas_receber;
DROP POLICY IF EXISTS "Users can insert receivables for their company" ON contas_receber;
DROP POLICY IF EXISTS "Users can update receivables for their company" ON contas_receber;
DROP POLICY IF EXISTS "Admins can delete receivables for their company" ON contas_receber;

CREATE POLICY "Users can view receivables for their company"
ON contas_receber FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can insert receivables for their company"
ON contas_receber FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update receivables for their company"
ON contas_receber FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Admins can delete receivables for their company"
ON contas_receber FOR DELETE
USING (user_can_access_company(auth.uid(), company_id));

-- Step 5: Update FATURAS RLS policies
DROP POLICY IF EXISTS "Users can view invoices for their company" ON faturas;
DROP POLICY IF EXISTS "Users can insert invoices for their company" ON faturas;
DROP POLICY IF EXISTS "Users can update invoices for their company" ON faturas;
DROP POLICY IF EXISTS "Users can delete invoices for their company" ON faturas;

CREATE POLICY "Users can view invoices for their company"
ON faturas FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can insert invoices for their company"
ON faturas FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update invoices for their company"
ON faturas FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can delete invoices for their company"
ON faturas FOR DELETE
USING (user_can_access_company(auth.uid(), company_id));

-- Step 6: Update DOCUMENT_ANALYSIS RLS policies
DROP POLICY IF EXISTS "Users can view document analysis for their company" ON document_analysis;
DROP POLICY IF EXISTS "Users can insert document analysis for their company" ON document_analysis;
DROP POLICY IF EXISTS "Users can update document analysis for their company" ON document_analysis;
DROP POLICY IF EXISTS "Users can delete document analysis for their company" ON document_analysis;

CREATE POLICY "Users can view document analysis for their company"
ON document_analysis FOR SELECT
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can insert document analysis for their company"
ON document_analysis FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND user_can_access_company(auth.uid(), company_id)
);

CREATE POLICY "Users can update document analysis for their company"
ON document_analysis FOR UPDATE
USING (user_can_access_company(auth.uid(), company_id));

CREATE POLICY "Users can delete document analysis for their company"
ON document_analysis FOR DELETE
USING (user_can_access_company(auth.uid(), company_id));

-- Step 7: Update SUGGESTED_ACTIONS RLS policies
DROP POLICY IF EXISTS "Users can view suggested actions for their company" ON suggested_actions;
DROP POLICY IF EXISTS "Users can insert suggested actions" ON suggested_actions;
DROP POLICY IF EXISTS "Users can update suggested actions" ON suggested_actions;

CREATE POLICY "Users can view suggested actions for their company"
ON suggested_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM contacts c
    WHERE c.id_contact = suggested_actions.contact_id 
      AND (c.company_id IS NULL OR user_can_access_company(auth.uid(), c.company_id))
  )
);

CREATE POLICY "Users can insert suggested actions"
ON suggested_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM contacts c
    WHERE c.id_contact = suggested_actions.contact_id 
      AND (c.company_id IS NULL OR user_can_access_company(auth.uid(), c.company_id))
  )
);

CREATE POLICY "Users can update suggested actions"
ON suggested_actions FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM contacts c
    WHERE c.id_contact = suggested_actions.contact_id 
      AND (c.company_id IS NULL OR user_can_access_company(auth.uid(), c.company_id))
  )
);