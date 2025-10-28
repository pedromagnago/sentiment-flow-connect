
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage roles" ON public.user_roles;

-- Create new policies using security definer functions (no recursion)
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Admins and owners can view all roles in their company
CREATE POLICY "Admins can view company roles"
ON public.user_roles
FOR SELECT
USING (
  is_admin_or_owner(auth.uid(), company_id)
);

-- Only owners can insert new roles
CREATE POLICY "Owners can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role, company_id)
);

-- Only owners can update roles
CREATE POLICY "Owners can update roles"
ON public.user_roles
FOR UPDATE
USING (
  has_role(auth.uid(), 'owner'::app_role, company_id)
);

-- Only owners can delete/revoke roles
CREATE POLICY "Owners can delete roles"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'owner'::app_role, company_id)
);
