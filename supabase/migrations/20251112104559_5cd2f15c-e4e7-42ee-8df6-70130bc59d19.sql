-- Função para classificar contatos com auth.uid() capturado
CREATE OR REPLACE FUNCTION public.classify_contact(
  p_contact_id text,
  p_company_id uuid,
  p_new_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_is_owner boolean;
  v_has_access boolean;
  v_result json;
BEGIN
  -- Capturar auth.uid() no início
  v_user_id := auth.uid();
  
  -- Log para debug
  RAISE LOG 'classify_contact called: user=%, contact=%, company=%', 
    v_user_id, p_contact_id, p_company_id;
  
  -- Verificar se usuário está autenticado
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se é owner
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_user_id
      AND role = 'owner'
      AND is_active = true
      AND revoked_at IS NULL
  ) INTO v_is_owner;
  
  -- Verificar se tem acesso à empresa de destino
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = v_user_id
      AND company_id = p_company_id
      AND is_active = true
      AND revoked_at IS NULL
  ) INTO v_has_access;
  
  -- Log das permissões
  RAISE LOG 'Permissions: is_owner=%, has_access=%', v_is_owner, v_has_access;
  
  -- Verificar permissões
  IF NOT v_is_owner AND NOT v_has_access THEN
    RAISE EXCEPTION 'Sem permissão para classificar para esta empresa';
  END IF;
  
  -- Executar UPDATE
  UPDATE public.contacts
  SET 
    company_id = p_company_id,
    nome = COALESCE(p_new_name, nome),
    updated_at = NOW()
  WHERE id_contact = p_contact_id
  RETURNING json_build_object(
    'id_contact', id_contact,
    'nome', nome,
    'company_id', company_id,
    'updated_at', updated_at
  ) INTO v_result;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Contato não encontrado: %', p_contact_id;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant para usuários autenticados
GRANT EXECUTE ON FUNCTION public.classify_contact TO authenticated;