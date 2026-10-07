-- FoodVision AI — foundation schema. Every business row carries org_id; RLS enforces tenant isolation.
create extension if not exists pgcrypto;

create type public.member_role as enum ('owner','admin','quality_manager','food_safety','production_manager','inspector');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, created_at timestamptz not null default now()
);
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null, industry text, created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'inspector',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index on public.organization_members(user_id);

-- Helper functions (security definer so policies don't recurse)
create or replace function public.is_member(_org uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from organization_members where org_id=_org and user_id=auth.uid()) $$;
create or replace function public.has_role(_org uuid, _roles public.member_role[]) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from organization_members where org_id=_org and user_id=auth.uid() and role = any(_roles)) $$;

-- Operational data -----------------------------------------------------------
create table public.facilities (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, name text not null, location text, created_at timestamptz not null default now());
create table public.production_lines (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, facility_id uuid references facilities(id) on delete cascade, name text not null, created_at timestamptz not null default now());
create table public.suppliers (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, name text not null, contact text, notes text, created_at timestamptz not null default now());
create table public.products (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, name text not null, sku text, category text, supplier_id uuid references suppliers(id) on delete set null, created_at timestamptz not null default now());
create table public.batches (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, lot_code text not null, product_id uuid references products(id) on delete set null, supplier_id uuid references suppliers(id) on delete set null, facility_id uuid references facilities(id) on delete set null, line_id uuid references production_lines(id) on delete set null, produced_on date, quality_status text not null default 'unreviewed', created_at timestamptz not null default now());
create table public.quality_standards (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, name text not null, description text not null, created_at timestamptz not null default now());

create table public.inspections (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade,
  title text not null, facility_id uuid references facilities(id) on delete set null, line_id uuid references production_lines(id) on delete set null,
  product_id uuid references products(id) on delete set null, batch_id uuid references batches(id) on delete set null, supplier_id uuid references suppliers(id) on delete set null,
  inspection_type text not null default 'product', status text not null default 'pending' check (status in ('pending','processing','review_required','confirmed','rejected','closed')),
  classification text, summary text, reviewer_id uuid references auth.users(id), review_notes text,
  created_by uuid references auth.users(id), created_at timestamptz not null default now(), reviewed_at timestamptz
);
create index on public.inspections(org_id, created_at desc);
create table public.inspection_images (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, inspection_id uuid not null references inspections(id) on delete cascade, storage_path text not null, mime_type text, created_at timestamptz not null default now());
create table public.visual_findings (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, inspection_id uuid not null references inspections(id) on delete cascade,
  finding text not null, category text not null, severity text not null check (severity in ('low','medium','high','critical')),
  confidence numeric not null check (confidence between 0 and 1), observed_evidence text not null, interpretation text, recommended_action text, limitations text,
  review_status text not null default 'pending' check (review_status in ('pending','confirmed','rejected','false_positive')), review_notes text,
  created_at timestamptz not null default now()
);
create index on public.visual_findings(org_id, created_at desc);

create table public.incidents (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, title text not null, description text, status text not null default 'open' check (status in ('open','investigating','resolved','closed')), severity text not null default 'medium', product_id uuid references products(id) on delete set null, batch_id uuid references batches(id) on delete set null, supplier_id uuid references suppliers(id) on delete set null, facility_id uuid references facilities(id) on delete set null, owner_id uuid references auth.users(id), outcome text, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table public.corrective_actions (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, title text not null, definition_of_done text, priority text not null default 'medium' check (priority in ('low','medium','high','critical')), status text not null default 'open' check (status in ('open','in_progress','done','cancelled')), owner_id uuid references auth.users(id), due_date date, incident_id uuid references incidents(id) on delete set null, finding_id uuid references visual_findings(id) on delete set null, batch_id uuid references batches(id) on delete set null, notes text, outcome text, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table public.recall_cases (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, title text not null, status text not null default 'scoping' check (status in ('scoping','under_review','decision_pending','closed')), scope_summary text, decision_by uuid references auth.users(id), created_at timestamptz not null default now());
create table public.recall_items (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, recall_id uuid not null references recall_cases(id) on delete cascade, batch_id uuid references batches(id) on delete cascade, rationale text);
create table public.haccp_records (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, hazard text not null, ccp text, monitoring text, deviation text, corrective_action text, recorded_on date default current_date, created_at timestamptz not null default now());
create table public.quality_records (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, batch_id uuid references batches(id) on delete set null, metric text not null, value numeric, unit text, recorded_at timestamptz not null default now());
create table public.environmental_records (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, facility_id uuid references facilities(id) on delete set null, line_id uuid references production_lines(id) on delete set null, metric text not null, value numeric not null, unit text, recorded_at timestamptz not null default now());

-- AI layer ---------------------------------------------------------------
create table public.ai_insights (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, kind text not null, title text not null, body jsonb not null, confidence numeric, source_run_id uuid, feedback text check (feedback in ('useful','not_useful')), feedback_note text, created_at timestamptz not null default now());
create table public.anomalies (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, metric text not null, what_changed text not null, window_start timestamptz, window_end timestamptz, magnitude numeric, baseline numeric, observed numeric, scope jsonb, confidence numeric, status text not null default 'open', created_at timestamptz not null default now());
create table public.ai_agent_runs (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, agent text not null, trigger text, input jsonb, output jsonb, status text not null default 'running', credits_used int not null default 0, created_by uuid references auth.users(id), created_at timestamptz not null default now(), finished_at timestamptz);
create table public.reports (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, title text not null, kind text not null, data_section jsonb, interpretation jsonb, recommendations jsonb, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table public.activity_logs (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, actor_id uuid, action text not null, entity text, entity_id uuid, created_at timestamptz not null default now());

-- Credits (writes only via service role / security-definer function) ----------
create table public.credit_balances (org_id uuid primary key references organizations(id) on delete cascade, plan text not null default 'trial', allocated int not null default 0, used int not null default 0, period_start timestamptz not null default now(), period_end timestamptz);
create table public.credit_transactions (id uuid primary key default gen_random_uuid(), org_id uuid not null references organizations(id) on delete cascade, user_id uuid, operation text not null, credits int not null, model text, input_tokens int, output_tokens int, created_at timestamptz not null default now());

create or replace function public.consume_credits(_org uuid, _user uuid, _op text, _credits int, _model text, _in int, _out int)
returns boolean language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  update credit_balances set used = used + _credits where org_id=_org and allocated - used >= _credits returning true into ok;
  if ok then insert into credit_transactions(org_id,user_id,operation,credits,model,input_tokens,output_tokens) values (_org,_user,_op,_credits,_model,_in,_out); end if;
  return coalesce(ok,false);
end $$;
revoke all on function public.consume_credits from public, anon, authenticated;
grant execute on function public.consume_credits to service_role;

-- Onboarding: create org + owner membership atomically
create or replace function public.create_organization(_name text, _industry text) returns uuid language plpgsql security definer set search_path = public as $$
declare oid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into organizations(name, industry, created_by) values (_name,_industry,auth.uid()) returning id into oid;
  insert into organization_members(org_id,user_id,role) values (oid,auth.uid(),'owner');
  insert into credit_balances(org_id, plan, allocated) values (oid,'trial',0);
  return oid;
end $$;
grant execute on function public.create_organization to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles(id, full_name) values (new.id, new.raw_user_meta_data->>'full_name') on conflict do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS ------------------------------------------------------------------------
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
alter table public.organizations enable row level security;
create policy "members read org" on public.organizations for select using (public.is_member(id));
create policy "admins update org" on public.organizations for update using (public.has_role(id, array['owner','admin']::member_role[]));
alter table public.organization_members enable row level security;
create policy "members read members" on public.organization_members for select using (public.is_member(org_id));
create policy "admins manage members" on public.organization_members for all using (public.has_role(org_id, array['owner','admin']::member_role[])) with check (public.has_role(org_id, array['owner','admin']::member_role[]));

do $$
declare t text;
begin
  foreach t in array array['facilities','production_lines','suppliers','products','batches','quality_standards','inspections','inspection_images','visual_findings','incidents','corrective_actions','recall_cases','recall_items','haccp_records','quality_records','environmental_records','ai_insights','anomalies','ai_agent_runs','reports','activity_logs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "member read" on public.%I for select using (public.is_member(org_id))', t);
    execute format('create policy "writer insert" on public.%I for insert with check (public.has_role(org_id, array[''owner'',''admin'',''quality_manager'',''food_safety'',''production_manager'',''inspector'']::member_role[]))', t);
    execute format('create policy "writer update" on public.%I for update using (public.has_role(org_id, array[''owner'',''admin'',''quality_manager'',''food_safety'',''production_manager'',''inspector'']::member_role[]))', t);
    execute format('create policy "manager delete" on public.%I for delete using (public.has_role(org_id, array[''owner'',''admin'',''quality_manager'']::member_role[]))', t);
  end loop;
end $$;
-- Configuration tables: only managers write
drop policy "writer insert" on public.quality_standards;
drop policy "writer update" on public.quality_standards;
create policy "manager insert" on public.quality_standards for insert with check (public.has_role(org_id, array['owner','admin','quality_manager']::member_role[]));
create policy "manager update" on public.quality_standards for update using (public.has_role(org_id, array['owner','admin','quality_manager']::member_role[]));
-- Credits: members can read; no client writes
alter table public.credit_balances enable row level security;
create policy "member read" on public.credit_balances for select using (public.is_member(org_id));
alter table public.credit_transactions enable row level security;
create policy "member read" on public.credit_transactions for select using (public.is_member(org_id));

-- Storage: private bucket, object path = <org_id>/<inspection_id>/<file>
insert into storage.buckets (id, name, public) values ('inspection-images','inspection-images', false) on conflict do nothing;
create policy "org read images" on storage.objects for select using (bucket_id='inspection-images' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "org upload images" on storage.objects for insert with check (bucket_id='inspection-images' and public.is_member(((storage.foldername(name))[1])::uuid));

-- Members can read the names of people in their own organization
create policy "peers read profiles" on public.profiles for select using (
  exists (select 1 from organization_members a join organization_members b on a.org_id=b.org_id where a.user_id=auth.uid() and b.user_id=profiles.id));
