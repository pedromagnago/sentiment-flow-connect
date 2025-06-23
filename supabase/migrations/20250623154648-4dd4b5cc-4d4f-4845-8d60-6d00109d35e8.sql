
-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela audit_logs se não existir (necessária para o sistema de auditoria)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Padronizar tabela companies
-- Adicionar updated_at se não existir
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar created_at para ter timezone se necessário
ALTER TABLE public.companies 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN created_at SET DEFAULT now();

-- Atualizar updated_at para ter timezone
ALTER TABLE public.companies 
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at SET DEFAULT now();

-- Padronizar tabela contacts
-- Migrar data_criacao para created_at se data_criacao tiver dados
UPDATE public.contacts 
SET created_at = data_criacao 
WHERE data_criacao IS NOT NULL AND (created_at IS NULL OR created_at < data_criacao);

-- Garantir que created_at tenha timezone
ALTER TABLE public.contacts 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING 
  CASE 
    WHEN created_at IS NOT NULL THEN created_at AT TIME ZONE 'UTC'
    ELSE now()
  END,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN created_at SET NOT NULL;

-- Adicionar updated_at em contacts se não existir
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar updated_at para ter timezone se necessário
ALTER TABLE public.contacts 
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at SET DEFAULT now(),
ALTER COLUMN updated_at SET NOT NULL;

-- Padronizar tabela messages
-- Garantir que created_at tenha timezone
ALTER TABLE public.messages 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING 
  CASE 
    WHEN created_at IS NOT NULL THEN created_at AT TIME ZONE 'UTC'
    ELSE now()
  END,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN created_at SET NOT NULL;

-- Adicionar updated_at se não existir
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Garantir que updated_at tenha timezone e default
ALTER TABLE public.messages 
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING 
  CASE 
    WHEN updated_at IS NOT NULL THEN updated_at AT TIME ZONE 'UTC'
    ELSE now()
  END,
ALTER COLUMN updated_at SET DEFAULT now(),
ALTER COLUMN updated_at SET NOT NULL;

-- Criar triggers para atualização automática de updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON public.companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON public.contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audit_logs_updated_at ON public.audit_logs;
CREATE TRIGGER update_audit_logs_updated_at 
    BEFORE UPDATE ON public.audit_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar updated_at nas demais tabelas principais se não existirem
ALTER TABLE public.groups_message 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.taskgroups 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.taskgrouprevisions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar triggers para as demais tabelas
DROP TRIGGER IF EXISTS update_groups_message_updated_at ON public.groups_message;
CREATE TRIGGER update_groups_message_updated_at 
    BEFORE UPDATE ON public.groups_message 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_taskgroups_updated_at ON public.taskgroups;
CREATE TRIGGER update_taskgroups_updated_at 
    BEFORE UPDATE ON public.taskgroups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_taskgrouprevisions_updated_at ON public.taskgrouprevisions;
CREATE TRIGGER update_taskgrouprevisions_updated_at 
    BEFORE UPDATE ON public.taskgrouprevisions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
