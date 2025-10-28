-- Create ai_classification_rules table for message classification rules
CREATE TABLE IF NOT EXISTS public.ai_classification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rule_name text NOT NULL,
  rule_type text NOT NULL DEFAULT 'classification',
  conditions jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '{}',
  priority integer NOT NULL DEFAULT 5,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_classification_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view classification rules for their company"
ON public.ai_classification_rules FOR SELECT
USING (public.has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can insert classification rules for their company"
ON public.ai_classification_rules FOR INSERT
WITH CHECK (public.has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can update classification rules for their company"
ON public.ai_classification_rules FOR UPDATE
USING (public.has_company_access(auth.uid(), company_id));

CREATE POLICY "Users can delete classification rules for their company"
ON public.ai_classification_rules FOR DELETE
USING (public.has_company_access(auth.uid(), company_id));

-- Create trigger for updated_at
CREATE TRIGGER update_ai_classification_rules_updated_at
BEFORE UPDATE ON public.ai_classification_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_ai_classification_rules_company ON public.ai_classification_rules (company_id);
CREATE INDEX idx_ai_classification_rules_active ON public.ai_classification_rules (company_id, active);
CREATE INDEX idx_ai_classification_rules_priority ON public.ai_classification_rules (company_id, priority DESC);

-- Add comments
COMMENT ON TABLE public.ai_classification_rules IS 'AI-powered message classification rules configured per company';
COMMENT ON COLUMN public.ai_classification_rules.conditions IS 'JSON conditions that trigger the rule (e.g., keywords, patterns)';
COMMENT ON COLUMN public.ai_classification_rules.actions IS 'JSON actions to take when rule matches (e.g., classification type, category)';
COMMENT ON COLUMN public.ai_classification_rules.priority IS 'Rule priority (1-10), higher priority rules are evaluated first';
