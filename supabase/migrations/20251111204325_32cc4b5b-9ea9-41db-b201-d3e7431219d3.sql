-- Allow owners to classify unclassified contacts to any company
-- This solves the issue where owners can't assign contacts to companies they don't have direct access to

-- First, create a helper function to check if user is an owner of ANY company
CREATE OR REPLACE FUNCTION public.user_is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = _user_id 
      AND role = 'owner'
      AND is_active = true 
      AND revoked_at IS NULL
  );
END;
$$;

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;

-- Create new update policy that allows owners to classify unclassified contacts
CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
USING (
  -- Can update if:
  -- 1. Contact is unclassified (company_id is NULL) and user is an owner
  -- 2. Contact belongs to a company the user has access to
  (company_id IS NULL AND user_is_owner(auth.uid())) OR
  user_can_access_company(auth.uid(), company_id)
)
WITH CHECK (
  -- After update, verify:
  -- 1. If setting to a company, user must be an owner (for classification) or have access to that company
  -- 2. If setting to NULL, user must have access to the current company
  (company_id IS NOT NULL AND user_is_owner(auth.uid())) OR
  (company_id IS NULL) OR
  user_can_access_company(auth.uid(), company_id)
);