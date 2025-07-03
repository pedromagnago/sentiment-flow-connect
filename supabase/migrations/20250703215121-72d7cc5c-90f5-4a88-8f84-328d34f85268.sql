-- Adicionar campos de endereço faltantes à tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS telefone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS responsavel text,
ADD COLUMN IF NOT EXISTS cargo_responsavel text;