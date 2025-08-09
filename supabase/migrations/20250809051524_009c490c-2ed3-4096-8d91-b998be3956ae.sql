-- Create bank_accounts table for multi-account support
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  bank_id TEXT,
  branch_id TEXT,
  account_id TEXT NOT NULL,
  acct_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_bank_accounts_company
    FOREIGN KEY (company_id)
    REFERENCES public.companies (id)
    ON DELETE CASCADE
);

-- Indexes and uniqueness
CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON public.bank_accounts(company_id);
CREATE UNIQUE INDEX IF NOT EXISTS bank_accounts_company_acct_unique
  ON public.bank_accounts (company_id, account_id, bank_id, branch_id);

-- Enable RLS and policies for bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_accounts' AND policyname = 'Select own company bank accounts'
  ) THEN
    CREATE POLICY "Select own company bank accounts"
      ON public.bank_accounts
      FOR SELECT
      USING (public.has_company_access(auth.uid(), company_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_accounts' AND policyname = 'Insert bank accounts for own company'
  ) THEN
    CREATE POLICY "Insert bank accounts for own company"
      ON public.bank_accounts
      FOR INSERT
      WITH CHECK (public.has_company_access(auth.uid(), company_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_accounts' AND policyname = 'Update bank accounts for own company'
  ) THEN
    CREATE POLICY "Update bank accounts for own company"
      ON public.bank_accounts
      FOR UPDATE
      USING (public.has_company_access(auth.uid(), company_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bank_accounts' AND policyname = 'Delete bank accounts for own company'
  ) THEN
    CREATE POLICY "Delete bank accounts for own company"
      ON public.bank_accounts
      FOR DELETE
      USING (public.has_company_access(auth.uid(), company_id));
  END IF;
END $$;

-- Trigger to keep updated_at fresh
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bank_accounts_updated_at'
  ) THEN
    CREATE TRIGGER trg_bank_accounts_updated_at
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Add columns to bank_transactions for account linkage
ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS account_id UUID,
  ADD COLUMN IF NOT EXISTS bank_id TEXT,
  ADD COLUMN IF NOT EXISTS branch_id TEXT,
  ADD COLUMN IF NOT EXISTS acct_type TEXT;

-- Foreign key from transactions to accounts (nullable to allow gradual adoption)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transactions_account_id_fkey'
  ) THEN
    ALTER TABLE public.bank_transactions
      ADD CONSTRAINT bank_transactions_account_id_fkey
      FOREIGN KEY (account_id)
      REFERENCES public.bank_accounts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful index for queries by account
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_id ON public.bank_transactions(account_id);
