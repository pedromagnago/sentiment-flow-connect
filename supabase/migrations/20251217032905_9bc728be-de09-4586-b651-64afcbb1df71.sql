-- Criar bucket para anexos de transações
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- RLS para o bucket attachments
CREATE POLICY "Users can view attachments for their company"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments' 
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM user_roles 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND revoked_at IS NULL
  )
);

CREATE POLICY "Users can upload attachments for their company"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM user_roles 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND revoked_at IS NULL
  )
);

CREATE POLICY "Users can update attachments for their company"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM user_roles 
    WHERE user_id = auth.uid() 
      AND is_active = true 
      AND revoked_at IS NULL
  )
);

CREATE POLICY "Admins can delete attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'attachments'
  AND user_is_admin(auth.uid())
);