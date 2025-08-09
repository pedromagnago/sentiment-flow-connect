-- Add UUID link to bank_accounts without altering existing text account_id
ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS bank_account_uuid UUID;

-- Backfill bank_account_uuid by matching company/account/bank/branch
UPDATE public.bank_transactions t
SET bank_account_uuid = a.id
FROM public.bank_accounts a
WHERE t.bank_account_uuid IS NULL
  AND a.company_id = t.company_id
  AND a.account_id = t.account_id
  AND COALESCE(a.bank_id, '') = COALESCE(t.bank_id, '')
  AND COALESCE(a.branch_id, '') = COALESCE(t.branch_id, '');

-- Add FK constraint safely if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transactions_bank_account_uuid_fkey'
  ) THEN
    ALTER TABLE public.bank_transactions
      ADD CONSTRAINT bank_transactions_bank_account_uuid_fkey
      FOREIGN KEY (bank_account_uuid)
      REFERENCES public.bank_accounts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful index for queries by the new UUID link
CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_account_uuid ON public.bank_transactions(bank_account_uuid);

-- Optional: ensure uniqueness on accounts (won't fail if missing)
CREATE UNIQUE INDEX IF NOT EXISTS bank_accounts_company_acct_unique
  ON public.bank_accounts (company_id, account_id, bank_id, branch_id);
