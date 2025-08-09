-- Add category to transactions and rules table for auto-categorization

-- 1) Add category column to bank_transactions
ALTER TABLE public.bank_transactions
ADD COLUMN IF NOT EXISTS category text;

-- 2) Create transaction_rules table
CREATE TABLE IF NOT EXISTS public.transaction_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  pattern text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_rules ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies idempotently
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transaction_rules' AND policyname='Users can view their company rules'
  ) THEN
    DROP POLICY "Users can view their company rules" ON public.transaction_rules;
  END IF;
END $$;
CREATE POLICY "Users can view their company rules"
ON public.transaction_rules FOR SELECT
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transaction_rules' AND policyname='Users can insert rules for their company'
  ) THEN
    DROP POLICY "Users can insert rules for their company" ON public.transaction_rules;
  END IF;
END $$;
CREATE POLICY "Users can insert rules for their company"
ON public.transaction_rules FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transaction_rules' AND policyname='Users can update rules for their company'
  ) THEN
    DROP POLICY "Users can update rules for their company" ON public.transaction_rules;
  END IF;
END $$;
CREATE POLICY "Users can update rules for their company"
ON public.transaction_rules FOR UPDATE
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transaction_rules' AND policyname='Users can delete rules for their company'
  ) THEN
    DROP POLICY "Users can delete rules for their company" ON public.transaction_rules;
  END IF;
END $$;
CREATE POLICY "Users can delete rules for their company"
ON public.transaction_rules FOR DELETE
USING ((auth.uid() = user_id) OR public.has_company_access(auth.uid(), company_id));

-- 3) Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_transaction_rules_updated_at'
  ) THEN
    CREATE TRIGGER update_transaction_rules_updated_at
    BEFORE UPDATE ON public.transaction_rules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) Performance indexes
CREATE INDEX IF NOT EXISTS idx_transaction_rules_company ON public.transaction_rules (company_id);
CREATE INDEX IF NOT EXISTS idx_transaction_rules_company_pattern ON public.transaction_rules (company_id, pattern);
