-- Fix RLS policies for contacts classification
-- Problem: Users can't update contacts from NULL to a company_id because RLS checks the NEW company_id

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;

-- Create new update policy with proper with_check clause
-- Users can update contacts if:
-- 1. Current company_id is NULL (unclassified), AND they have access to the NEW company
-- 2. Current company_id is NOT NULL, AND they have access to the current company
CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
USING (
  (company_id IS NULL) OR 
  user_can_access_company(auth.uid(), company_id)
)
WITH CHECK (
  -- Allow setting company_id if user has access to the NEW company
  (company_id IS NULL) OR 
  user_can_access_company(auth.uid(), company_id)
);