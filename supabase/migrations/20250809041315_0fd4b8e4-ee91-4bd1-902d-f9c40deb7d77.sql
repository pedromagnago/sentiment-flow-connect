-- Retry migration with idempotent drops for policies/triggers
-- 1) Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  display_name text,
  role text default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Policies: drop then recreate for idempotence
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- Trigger for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

-- 2) Helper function to check company access
create or replace function public.has_company_access(_user_id uuid, _company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = _user_id
      and p.company_id = _company_id
  );
$$;

-- 3) Onboarding forms table
create table if not exists public.formularios_onboarding (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text default 'draft',
  answers jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_form_onboarding_company on public.formularios_onboarding(company_id);
create index if not exists idx_form_onboarding_user on public.formularios_onboarding(user_id);

alter table public.formularios_onboarding enable row level security;

drop policy if exists "Users can view onboarding forms for their company or own" on public.formularios_onboarding;
create policy "Users can view onboarding forms for their company or own"
  on public.formularios_onboarding
  for select
  to authenticated
  using (
    auth.uid() = user_id OR public.has_company_access(auth.uid(), company_id)
  );

drop policy if exists "Users can create onboarding forms for their company" on public.formularios_onboarding;
create policy "Users can create onboarding forms for their company"
  on public.formularios_onboarding
  for insert
  to authenticated
  with check (
    auth.uid() = user_id AND public.has_company_access(auth.uid(), company_id)
  );

drop policy if exists "Users can update onboarding forms they can view" on public.formularios_onboarding;
create policy "Users can update onboarding forms they can view"
  on public.formularios_onboarding
  for update
  to authenticated
  using (
    auth.uid() = user_id OR public.has_company_access(auth.uid(), company_id)
  );

drop policy if exists "Users can delete onboarding forms they can view" on public.formularios_onboarding;
create policy "Users can delete onboarding forms they can view"
  on public.formularios_onboarding
  for delete
  to authenticated
  using (
    auth.uid() = user_id OR public.has_company_access(auth.uid(), company_id)
  );

drop trigger if exists update_formularios_onboarding_updated_at on public.formularios_onboarding;
create trigger update_formularios_onboarding_updated_at
before update on public.formularios_onboarding
for each row
execute function public.update_updated_at_column();

-- 4) Documents table for onboarding uploads
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  file_name text,
  mime_type text,
  size bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_documentos_company on public.documentos(company_id);
create index if not exists idx_documentos_user on public.documentos(user_id);
create index if not exists idx_documentos_path on public.documentos(file_path);

alter table public.documentos enable row level security;

drop policy if exists "Users can view documents for their company or own" on public.documentos;
create policy "Users can view documents for their company or own"
  on public.documentos
  for select
  to authenticated
  using (
    auth.uid() = user_id OR public.has_company_access(auth.uid(), company_id)
  );

drop policy if exists "Users can insert documents for their company" on public.documentos;
create policy "Users can insert documents for their company"
  on public.documentos
  for insert
  to authenticated
  with check (
    auth.uid() = user_id AND public.has_company_access(auth.uid(), company_id)
  );

drop policy if exists "Users can update documents they can view" on public.documentos;
create policy "Users can update documents they can view"
  on public.documentos
  for update
  to authenticated
  using (
    auth.uid() = user_id OR public.has_company_access(auth.uid(), company_id)
  );

drop policy if exists "Users can delete documents they can view" on public.documentos;
create policy "Users can delete documents they can view"
  on public.documentos
  for delete
  to authenticated
  using (
    auth.uid() = user_id OR public.has_company_access(auth.uid(), company_id)
  );

drop trigger if exists update_documentos_updated_at on public.documentos;
create trigger update_documentos_updated_at
before update on public.documentos
for each row
execute function public.update_updated_at_column();

-- 5) Storage bucket for onboarding documents
insert into storage.buckets (id, name, public)
values ('onboarding', 'onboarding', false)
on conflict (id) do nothing;

-- Storage policies for private per-user folders: onboarding/<user_id>/<files>
drop policy if exists "Onboarding: users can read own files" on storage.objects;
create policy "Onboarding: users can read own files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'onboarding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Onboarding: users can upload to own folder" on storage.objects;
create policy "Onboarding: users can upload to own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'onboarding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Onboarding: users can update own files" on storage.objects;
create policy "Onboarding: users can update own files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'onboarding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Onboarding: users can delete own files" on storage.objects;
create policy "Onboarding: users can delete own files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'onboarding'
    and (storage.foldername(name))[1] = auth.uid()::text
  );