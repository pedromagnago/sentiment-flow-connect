-- Make nome column NOT NULL (required for unique constraint)
-- First, update any null values
UPDATE public.settings SET nome = 'unknown_' || id::text WHERE nome IS NULL;

-- Set NOT NULL constraint
ALTER TABLE public.settings 
ALTER COLUMN nome SET NOT NULL;

-- Add UNIQUE constraint to nome column (needed for upsert)
ALTER TABLE public.settings 
ADD CONSTRAINT settings_nome_key UNIQUE (nome);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_settings_nome ON public.settings(nome);