
-- Add the n8n_integration_active column to the companies table
ALTER TABLE public.companies 
ADD COLUMN n8n_integration_active boolean DEFAULT false;

-- Update the trigger to handle the new column
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON public.companies 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
