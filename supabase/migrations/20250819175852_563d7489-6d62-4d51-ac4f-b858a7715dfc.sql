-- Update password for specific user
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf')), 
    updated_at = now()
WHERE email = 'pedromagnago0@gmail.com';