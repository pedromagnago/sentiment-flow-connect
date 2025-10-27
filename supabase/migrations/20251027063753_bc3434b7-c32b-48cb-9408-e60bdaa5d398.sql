-- Rename empresa_id to company_id in contacts table
ALTER TABLE public.contacts 
  RENAME COLUMN empresa_id TO company_id;

-- Add Foreign Key constraint
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_company_id_fkey 
  FOREIGN KEY (company_id) 
  REFERENCES public.companies(id) 
  ON DELETE SET NULL;

-- Update RLS policies to use company_id instead of empresa_id
DROP POLICY IF EXISTS "Users can create contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts for their company" ON public.contacts;
DROP POLICY IF EXISTS "Users can view contacts for their company" ON public.contacts;

CREATE POLICY "Users can create contacts for their company" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  (company_id = get_current_company_id()) OR (company_id IS NULL)
);

CREATE POLICY "Users can delete contacts for their company" 
ON public.contacts 
FOR DELETE 
USING (
  (company_id = get_current_company_id()) OR (company_id IS NULL)
);

CREATE POLICY "Users can update contacts for their company" 
ON public.contacts 
FOR UPDATE 
USING (
  (company_id = get_current_company_id()) OR (company_id IS NULL)
);

CREATE POLICY "Users can view contacts for their company" 
ON public.contacts 
FOR SELECT 
USING (
  (company_id = get_current_company_id()) OR (company_id IS NULL)
);

-- Rename empresa_id to company_id in documents table (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' 
    AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE public.documents 
      RENAME COLUMN empresa_id TO company_id;
    
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_company_id_fkey 
      FOREIGN KEY (company_id) 
      REFERENCES public.companies(id) 
      ON DELETE SET NULL;
  END IF;
END $$;