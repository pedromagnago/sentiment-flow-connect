-- =========================================
-- RESET COMPLETO: Sistema de Classificação Manual
-- =========================================

-- 1. Resetar TODOS os contatos para não classificados
UPDATE public.contacts 
SET company_id = NULL,
    updated_at = NOW()
WHERE company_id IS NOT NULL;

-- 2. Log da operação de reset
INSERT INTO public.audit_logs (
  table_name,
  action,
  new_data,
  user_id,
  created_at
) VALUES (
  'contacts',
  'BULK_RESET_CLASSIFICATION',
  jsonb_build_object(
    'total_reset', (SELECT COUNT(*) FROM contacts WHERE company_id IS NULL),
    'reason', 'Reset para classificação 100% manual - Removida atribuição automática',
    'timestamp', NOW()
  ),
  NULL,
  NOW()
);