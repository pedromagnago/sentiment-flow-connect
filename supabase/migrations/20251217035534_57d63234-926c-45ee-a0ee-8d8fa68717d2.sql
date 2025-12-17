-- Add tipo_movimento enum type for transaction classification
DO $$ BEGIN
  CREATE TYPE movimento_tipo AS ENUM ('operacional', 'transferencia', 'tarifa_bancaria', 'rendimento', 'outro');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns to bank_transactions
ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS tipo_movimento movimento_tipo DEFAULT 'operacional',
ADD COLUMN IF NOT EXISTS ignorar_reconciliacao boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS motivo_ignorar text;

-- Add bank_transaction_id to contas_pagar for direct linking
ALTER TABLE public.contas_pagar 
ADD COLUMN IF NOT EXISTS bank_transaction_id uuid REFERENCES public.bank_transactions(id);

-- Add bank_transaction_id to contas_receber for direct linking
ALTER TABLE public.contas_receber 
ADD COLUMN IF NOT EXISTS bank_transaction_id uuid REFERENCES public.bank_transactions(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bank_transactions_tipo_movimento ON public.bank_transactions(tipo_movimento);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_ignorar_reconciliacao ON public.bank_transactions(ignorar_reconciliacao);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON public.bank_transactions(reconciled);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_bank_transaction_id ON public.contas_pagar(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_bank_transaction_id ON public.contas_receber(bank_transaction_id);

-- Add comment for documentation
COMMENT ON COLUMN public.bank_transactions.tipo_movimento IS 'Tipo de movimento: operacional (vinculável), transferencia, tarifa_bancaria, rendimento, outro';
COMMENT ON COLUMN public.bank_transactions.ignorar_reconciliacao IS 'Se true, transação não aparece na lista de órfãos pendentes';
COMMENT ON COLUMN public.bank_transactions.motivo_ignorar IS 'Justificativa para ignorar reconciliação';
COMMENT ON COLUMN public.contas_pagar.bank_transaction_id IS 'Transação bancária vinculada a esta conta a pagar';
COMMENT ON COLUMN public.contas_receber.bank_transaction_id IS 'Transação bancária vinculada a esta conta a receber';