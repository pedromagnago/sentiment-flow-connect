-- Migration: Update remaining policies that reference profile.company_id
-- Date: 2025-01-29
-- Description: Fix audit_logs and conversation_assignments policies before removing profile.company_id

-- Step 1: Update AUDIT_LOGS policies (remove profile.company_id dependency)
DROP POLICY IF EXISTS "Admins can view audit logs for their company" ON audit_logs;

CREATE POLICY "Admins can view all audit logs"
ON audit_logs FOR SELECT
USING (user_is_admin(auth.uid()));

-- Step 2: Update CONVERSATION_ASSIGNMENTS policies (remove profile.company_id dependency)
DROP POLICY IF EXISTS "Users can view assignments for their company" ON conversation_assignments;
DROP POLICY IF EXISTS "Users can create assignments" ON conversation_assignments;
DROP POLICY IF EXISTS "Users can update assignments" ON conversation_assignments;

CREATE POLICY "Users can view their assignments"
ON conversation_assignments FOR SELECT
USING (
  user_id = auth.uid() 
  OR user_is_admin(auth.uid())
);

CREATE POLICY "Users can create assignments"
ON conversation_assignments FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR user_is_admin(auth.uid())
);

CREATE POLICY "Users can update assignments"
ON conversation_assignments FOR UPDATE
USING (
  user_id = auth.uid() 
  OR user_is_admin(auth.uid())
);

-- Step 3: Now we can safely remove profile.company_id and profile.role
ALTER TABLE profiles DROP COLUMN IF EXISTS company_id CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS role CASCADE;

-- Step 4: Drop old functions that are no longer needed
DROP FUNCTION IF EXISTS public.get_current_company_id() CASCADE;
DROP FUNCTION IF EXISTS public.has_company_access(uuid, uuid) CASCADE;