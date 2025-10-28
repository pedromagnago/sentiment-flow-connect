-- Adicionar configuração para telefone do operador HITL (validação humana)
-- Nota: Atualizar este número para o telefone do operador responsável
INSERT INTO public.settings (nome, valor)
VALUES ('hitl_operator_phone', '5511999999999');

-- Adicionar configuração para auto-processar documentos
INSERT INTO public.settings (nome, valor)
VALUES ('auto_process_documents', 'true');

-- Adicionar índice na tabela messages para melhorar performance do agrupamento
CREATE INDEX IF NOT EXISTS idx_messages_pending_grouping 
ON public.messages (contact_id, status_processamento, data_hora)
WHERE status_processamento = 'pendente';

-- Adicionar índice para análise de sentimento
CREATE INDEX IF NOT EXISTS idx_messages_contact_date 
ON public.messages (contact_id, data_hora);

-- Comentário nas tabelas legadas
COMMENT ON TABLE public.grupos_avaliacao_ia IS 'LEGADO: Tabela do sistema N8N anterior. Manter por compatibilidade histórica.';
COMMENT ON TABLE public.grupos_ia_revisao_ativa IS 'LEGADO: Tabela do sistema N8N anterior. Manter por compatibilidade histórica.';
COMMENT ON TABLE public.n8n_chat_histories IS 'LEGADO: Tabela do sistema N8N anterior. Manter por compatibilidade histórica.';