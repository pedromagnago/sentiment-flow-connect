-- Corrigir nomes dos contatos de grupos baseado nas mensagens
-- Atualiza o nome do contato com o nome do grupo (nome_grupo) das mensagens
UPDATE public.contacts c
SET 
  nome = m.nome_grupo,
  updated_at = NOW()
FROM (
  SELECT DISTINCT ON (contact_id) 
    contact_id,
    nome_grupo
  FROM public.messages
  WHERE nome_grupo IS NOT NULL
  ORDER BY contact_id, data_hora DESC
) m
WHERE c.id_contact = m.contact_id
  AND c.is_group = true
  AND c.nome != m.nome_grupo;