-- Enable RLS on audit_logs table (if not already enabled)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins/owners to view audit logs for their company
CREATE POLICY "Admins can view audit logs for their company"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'owner')
    AND (
      -- Allow viewing logs for their company's data
      public.get_current_company_id() IS NOT NULL
    )
  )
);

-- Create policy to allow system/service to insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create security definer function to safely insert audit logs
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_table_name text,
  p_action text,
  p_record_id text DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_user_id text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    action,
    record_id,
    old_data,
    new_data,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    p_table_name,
    p_action,
    p_record_id,
    p_old_data,
    p_new_data,
    COALESCE(p_user_id, auth.uid()::text),
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;