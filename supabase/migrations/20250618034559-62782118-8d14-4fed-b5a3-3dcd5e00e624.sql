
-- Adicionar novos campos à tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS task_id text,
ADD COLUMN IF NOT EXISTS task_name text,
ADD COLUMN IF NOT EXISTS assignee text,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS priority text,
ADD COLUMN IF NOT EXISTS task_status text,
ADD COLUMN IF NOT EXISTS date_created date,
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS date_closed date,
ADD COLUMN IF NOT EXISTS linked_docs text,
ADD COLUMN IF NOT EXISTS valor_mensalidade numeric(10,2),
ADD COLUMN IF NOT EXISTS prazo_desconto integer,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS desconto_percentual numeric(5,2),
ADD COLUMN IF NOT EXISTS aceitar_politica_privacidade boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nome_contato text,
ADD COLUMN IF NOT EXISTS fonte_lead text,
ADD COLUMN IF NOT EXISTS cpf_representante text,
ADD COLUMN IF NOT EXISTS email_representante text,
ADD COLUMN IF NOT EXISTS email_testemunha text,
ADD COLUMN IF NOT EXISTS envelope_id text,
ADD COLUMN IF NOT EXISTS nome_representante text,
ADD COLUMN IF NOT EXISTS nome_testemunha text,
ADD COLUMN IF NOT EXISTS tipo_contrato text,
ADD COLUMN IF NOT EXISTS cargo text,
ADD COLUMN IF NOT EXISTS whatsapp_contato text,
ADD COLUMN IF NOT EXISTS email_contato text,
ADD COLUMN IF NOT EXISTS client_id text,
ADD COLUMN IF NOT EXISTS companies_id text,
ADD COLUMN IF NOT EXISTS atividade text;

-- Atualizar o campo segmento existente para ser um dropdown se necessário
-- (O campo segmento já existe, então não precisamos adicionar novamente)
