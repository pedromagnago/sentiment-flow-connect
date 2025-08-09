-- Functions to enforce company and user linkage
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select company_id from public.profiles where id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.enforce_company_user_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cur_company uuid;
BEGIN
  cur_company := public.get_current_company_id();
  -- Auto-fill
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  IF NEW.company_id IS NULL THEN
    NEW.company_id := cur_company;
  END IF;
  -- Validate
  IF NEW.company_id IS DISTINCT FROM cur_company THEN
    RAISE EXCEPTION 'company_id mismatch with current user company';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_company_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    RAISE EXCEPTION 'company_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

-- Helper to create triggers if not exists
DO $$ BEGIN
  -- bank_transactions
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_bank_transactions') THEN
    CREATE TRIGGER enforce_company_user_insert_bank_transactions
    BEFORE INSERT ON public.bank_transactions
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_bank_transactions') THEN
    CREATE TRIGGER prevent_company_change_bank_transactions
    BEFORE UPDATE ON public.bank_transactions
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;

  -- transaction_imports
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_transaction_imports') THEN
    CREATE TRIGGER enforce_company_user_insert_transaction_imports
    BEFORE INSERT ON public.transaction_imports
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_transaction_imports') THEN
    CREATE TRIGGER prevent_company_change_transaction_imports
    BEFORE UPDATE ON public.transaction_imports
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;

  -- transaction_rules
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_transaction_rules') THEN
    CREATE TRIGGER enforce_company_user_insert_transaction_rules
    BEFORE INSERT ON public.transaction_rules
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_transaction_rules') THEN
    CREATE TRIGGER prevent_company_change_transaction_rules
    BEFORE UPDATE ON public.transaction_rules
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;

  -- reconciliation_logs
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_reconciliation_logs') THEN
    CREATE TRIGGER enforce_company_user_insert_reconciliation_logs
    BEFORE INSERT ON public.reconciliation_logs
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_reconciliation_logs') THEN
    CREATE TRIGGER prevent_company_change_reconciliation_logs
    BEFORE UPDATE ON public.reconciliation_logs
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;

  -- documentos
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_documentos') THEN
    CREATE TRIGGER enforce_company_user_insert_documentos
    BEFORE INSERT ON public.documentos
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_documentos') THEN
    CREATE TRIGGER prevent_company_change_documentos
    BEFORE UPDATE ON public.documentos
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;

  -- formularios_onboarding
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_formularios_onboarding') THEN
    CREATE TRIGGER enforce_company_user_insert_formularios_onboarding
    BEFORE INSERT ON public.formularios_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_formularios_onboarding') THEN
    CREATE TRIGGER prevent_company_change_formularios_onboarding
    BEFORE UPDATE ON public.formularios_onboarding
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;

  -- bank_accounts
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_company_user_insert_bank_accounts') THEN
    CREATE TRIGGER enforce_company_user_insert_bank_accounts
    BEFORE INSERT ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION public.enforce_company_user_insert();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_company_change_bank_accounts') THEN
    CREATE TRIGGER prevent_company_change_bank_accounts
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW EXECUTE FUNCTION public.prevent_company_change();
  END IF;
END $$;