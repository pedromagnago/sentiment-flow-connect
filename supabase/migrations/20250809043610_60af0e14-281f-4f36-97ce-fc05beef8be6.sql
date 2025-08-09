-- Safe, idempotent migration for OFX reconciliation tables and policies
-- 1) Tables

-- transaction_imports
CREATE TABLE IF NOT EXISTS public.transaction_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  source text NOT NULL DEFAULT 'ofx',
  status text NOT NULL DEFAULT 'completed',
  file_name text,
  total_transactions integer NOT NULL DEFAULT 0,
  imported_transactions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- bank_transactions
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  import_id uuid,
  date date NOT NULL,
  amount numeric NOT NULL,
  memo text,
  description text,
  type text,
  fitid text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- reconciliation_logs
CREATE TABLE IF NOT EXISTS public.reconciliation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  transaction_id uuid,
  status text,
  action text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) RLS enable
ALTER TABLE public.transaction_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_logs ENABLE ROW LEVEL SECURITY;

-- 3) Policies (drop-if-exists then create to be idempotent)
-- transaction_imports
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transaction_imports' AND policyname = 'Users can insert imports for their company'
  ) THEN
    DROP POLICY "Users can insert imports for their company" ON public.transaction_imports;
  END IF;
END $$;
CREATE POLICY "Users can insert imports for their company"
ON public.transaction_imports FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transaction_imports' AND policyname = 'Users can view their own company imports'
  ) THEN
    DROP POLICY "Users can view their own company imports" ON public.transaction_imports;
  END IF;
END $$;
CREATE POLICY "Users can view their own company imports"
ON public.transaction_imports FOR SELECT
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transaction_imports' AND policyname = 'Users can update their own company imports'
  ) THEN
    DROP POLICY "Users can update their own company imports" ON public.transaction_imports;
  END IF;
END $$;
CREATE POLICY "Users can update their own company imports"
ON public.transaction_imports FOR UPDATE
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transaction_imports' AND policyname = 'Users can delete their own company imports'
  ) THEN
    DROP POLICY "Users can delete their own company imports" ON public.transaction_imports;
  END IF;
END $$;
CREATE POLICY "Users can delete their own company imports"
ON public.transaction_imports FOR DELETE
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

-- bank_transactions
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_transactions' AND policyname = 'Users can insert transactions for their company'
  ) THEN
    DROP POLICY "Users can insert transactions for their company" ON public.bank_transactions;
  END IF;
END $$;
CREATE POLICY "Users can insert transactions for their company"
ON public.bank_transactions FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_transactions' AND policyname = 'Users can view their company transactions'
  ) THEN
    DROP POLICY "Users can view their company transactions" ON public.bank_transactions;
  END IF;
END $$;
CREATE POLICY "Users can view their company transactions"
ON public.bank_transactions FOR SELECT
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_transactions' AND policyname = 'Users can update transactions for their company'
  ) THEN
    DROP POLICY "Users can update transactions for their company" ON public.bank_transactions;
  END IF;
END $$;
CREATE POLICY "Users can update transactions for their company"
ON public.bank_transactions FOR UPDATE
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_transactions' AND policyname = 'Users can delete transactions for their company'
  ) THEN
    DROP POLICY "Users can delete transactions for their company" ON public.bank_transactions;
  END IF;
END $$;
CREATE POLICY "Users can delete transactions for their company"
ON public.bank_transactions FOR DELETE
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

-- reconciliation_logs
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reconciliation_logs' AND policyname = 'Users can insert reconciliation logs for their company'
  ) THEN
    DROP POLICY "Users can insert reconciliation logs for their company" ON public.reconciliation_logs;
  END IF;
END $$;
CREATE POLICY "Users can insert reconciliation logs for their company"
ON public.reconciliation_logs FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reconciliation_logs' AND policyname = 'Users can view their company reconciliation logs'
  ) THEN
    DROP POLICY "Users can view their company reconciliation logs" ON public.reconciliation_logs;
  END IF;
END $$;
CREATE POLICY "Users can view their company reconciliation logs"
ON public.reconciliation_logs FOR SELECT
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

-- 4) updated_at triggers (function exists as public.update_updated_at_column)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_transaction_imports_updated_at'
  ) THEN
    CREATE TRIGGER update_transaction_imports_updated_at
    BEFORE UPDATE ON public.transaction_imports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_bank_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_bank_transactions_updated_at
    BEFORE UPDATE ON public.bank_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_reconciliation_logs_updated_at'
  ) THEN
    CREATE TRIGGER update_reconciliation_logs_updated_at
    BEFORE UPDATE ON public.reconciliation_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;