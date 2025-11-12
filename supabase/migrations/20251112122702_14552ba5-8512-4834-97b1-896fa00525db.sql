
-- Adicionar pedromagnago0@gmail.com como owner de todas as empresas
INSERT INTO public.user_roles (user_id, company_id, role, granted_by, is_active)
SELECT 
  'ee52a793-6cce-4d06-ac4b-adb6c5c2b8d2'::uuid as user_id,
  c.id as company_id,
  'owner'::app_role as role,
  'ee52a793-6cce-4d06-ac4b-adb6c5c2b8d2'::uuid as granted_by,
  true as is_active
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = 'ee52a793-6cce-4d06-ac4b-adb6c5c2b8d2'::uuid
    AND ur.company_id = c.id
    AND ur.is_active = true
    AND ur.revoked_at IS NULL
);
