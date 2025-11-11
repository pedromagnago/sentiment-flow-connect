-- Criar contatos faltantes baseado nas mensagens existentes
INSERT INTO public.contacts (
  id_contact,
  nome,
  is_group,
  status,
  feedback,
  data_criacao,
  company_id,
  created_at,
  updated_at
)
SELECT DISTINCT
  m.contact_id as id_contact,
  COALESCE(m.nome_grupo, m.nome_membro, 'Sem nome') as nome,
  CASE 
    WHEN m.contact_id LIKE '%-group' THEN true
    WHEN m.contact_id LIKE '%@newsletter' THEN false
    ELSE false
  END as is_group,
  true as status,
  true as feedback,
  MIN(m.data_hora) as data_criacao,
  NULL::uuid as company_id, -- Sem empresa = precisa classificação
  MIN(m.created_at) as created_at,
  NOW() as updated_at
FROM messages m
LEFT JOIN contacts c ON m.contact_id = c.id_contact
WHERE c.id_contact IS NULL
  AND m.contact_id IS NOT NULL
GROUP BY m.contact_id, m.nome_grupo, m.nome_membro
ON CONFLICT (id_contact) DO NOTHING;

-- Criar função RPC para sincronização futura
CREATE OR REPLACE FUNCTION sync_missing_contacts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  INSERT INTO public.contacts (
    id_contact, 
    nome, 
    is_group, 
    status, 
    feedback, 
    data_criacao, 
    company_id, 
    created_at, 
    updated_at
  )
  SELECT DISTINCT
    m.contact_id,
    COALESCE(m.nome_grupo, m.nome_membro, 'Sem nome'),
    CASE 
      WHEN m.contact_id LIKE '%-group' THEN true
      WHEN m.contact_id LIKE '%@newsletter' THEN false
      ELSE false
    END,
    true, 
    true,
    MIN(m.data_hora),
    NULL::uuid,
    MIN(m.created_at),
    NOW()
  FROM messages m
  LEFT JOIN contacts c ON m.contact_id = c.id_contact
  WHERE c.id_contact IS NULL 
    AND m.contact_id IS NOT NULL
  GROUP BY m.contact_id, m.nome_grupo, m.nome_membro
  ON CONFLICT (id_contact) DO NOTHING;
  
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;