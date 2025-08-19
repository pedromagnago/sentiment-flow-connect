-- Phase 1: Add RLS policies for companies table (most critical)
CREATE POLICY "Users can view their own company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id = public.get_current_company_id()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'owner')
    AND p.company_id = companies.id
  )
);

CREATE POLICY "Admins can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can update their own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id = public.get_current_company_id()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'owner')
    AND p.company_id = companies.id
  )
);

CREATE POLICY "Admins can delete companies"
ON public.companies
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'owner')
    AND p.company_id = companies.id
  )
);

-- Phase 2: Add RLS policies for contacts table
CREATE POLICY "Users can view contacts for their company"
ON public.contacts
FOR SELECT
TO authenticated
USING (
  empresa_id = public.get_current_company_id()
  OR empresa_id IS NULL
);

CREATE POLICY "Users can create contacts for their company"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.get_current_company_id()
  OR empresa_id IS NULL
);

CREATE POLICY "Users can update contacts for their company"
ON public.contacts
FOR UPDATE
TO authenticated
USING (
  empresa_id = public.get_current_company_id()
  OR empresa_id IS NULL
);

CREATE POLICY "Users can delete contacts for their company"
ON public.contacts
FOR DELETE
TO authenticated
USING (
  empresa_id = public.get_current_company_id()
  OR empresa_id IS NULL
);

-- Phase 3: Add RLS policies for messages table
CREATE POLICY "Users can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete messages"
ON public.messages
FOR DELETE
TO authenticated
USING (true);

-- Phase 4: Add RLS policies for groups_message table
CREATE POLICY "Users can view group messages"
ON public.groups_message
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create group messages"
ON public.groups_message
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update group messages"
ON public.groups_message
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete group messages"
ON public.groups_message
FOR DELETE
TO authenticated
USING (true);

-- Phase 5: Add RLS policies for taskgroups table
CREATE POLICY "Users can view task groups"
ON public.taskgroups
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create task groups"
ON public.taskgroups
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update task groups"
ON public.taskgroups
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete task groups"
ON public.taskgroups
FOR DELETE
TO authenticated
USING (true);

-- Phase 6: Add RLS policies for taskgrouprevisions table
CREATE POLICY "Users can view task group revisions"
ON public.taskgrouprevisions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create task group revisions"
ON public.taskgrouprevisions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update task group revisions"
ON public.taskgrouprevisions
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Users can delete task group revisions"
ON public.taskgrouprevisions
FOR DELETE
TO authenticated
USING (true);

-- Phase 7: Add RLS policies for sentiment analysis tables
CREATE POLICY "Users can view daily sentiment analysis"
ON public.analise_sentimento_diario
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create daily sentiment analysis"
ON public.analise_sentimento_diario
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view weekly sentiment analysis"
ON public.analise_sentimento_semanal
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create weekly sentiment analysis"
ON public.analise_sentimento_semanal
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Phase 8: Add RLS policies for other tables
CREATE POLICY "Users can view evaluation groups"
ON public.grupos_avaliacao_ia
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create evaluation groups"
ON public.grupos_avaliacao_ia
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view active revision groups"
ON public.grupos_ia_revisao_ativa
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create active revision groups"
ON public.grupos_ia_revisao_ativa
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Users can view fullbpo contacts"
ON public.contacts_fullbpo
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create fullbpo contacts"
ON public.contacts_fullbpo
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view n8n chat histories"
ON public.n8n_chat_histories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create n8n chat histories"
ON public.n8n_chat_histories
FOR INSERT
TO authenticated
WITH CHECK (true);