-- Adicionar campo de feedback para as empresas
ALTER TABLE companies ADD COLUMN IF NOT EXISTS feedback_ativo boolean DEFAULT true;