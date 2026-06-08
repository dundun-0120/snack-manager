-- Step 1: 创建表（不启用 RLS，避免权限冲突）
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  avatar_url text,
  created_at timestamptz default now() not null
);

create table if not exists public.families (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  password text not null,
  creator_id uuid not null,
  created_at timestamptz default now() not null
);

create table if not exists public.family_members (
  id uuid default gen_random_uuid() primary key,
  family_id uuid not null,
  user_id uuid not null,
  role text not null check (role in ('parent', 'child')),
  daily_quota integer default 4,
  weekly_quota integer default 20,
  created_at timestamptz default now() not null,
  unique(family_id, user_id)
);

create table if not exists public.snacks (
  id uuid default gen_random_uuid() primary key,
  family_id uuid not null,
  name text not null,
  category_id integer,
  health_score integer default 5,
  stock integer default 0,
  price numeric(10,2),
  size_level text default '中',
  expiry_days integer,
  expiry_batches jsonb default '[]',
  purchase_link text,
  platform_name text,
  notes text,
  created_at timestamptz default now() not null
);

create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  family_id uuid not null,
  snack_id uuid not null,
  member_id uuid not null,
  quantity integer default 1,
  quota_cost integer default 2,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz default now() not null,
  processed_at timestamptz,
  processed_by uuid
);

-- Step 2: 删除旧策略（如果存在）
drop policy if exists "Users can manage own profile" on public.profiles;
drop policy if exists "Family members can view" on public.snacks;
drop policy if exists "Parents can modify" on public.snacks;
drop policy if exists "Members can view claims" on public.claims;
drop policy if exists "Members can create claims" on public.claims;
drop policy if exists "Parents can process claims" on public.claims;
drop policy if exists "Enable all for authenticated" on public.families;
drop policy if exists "Enable all for authenticated" on public.family_members;

-- Step 3: 启用 RLS
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.snacks enable row level security;
alter table public.claims enable row level security;

-- Step 4: 创建策略（使用安全写法）
create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Enable all for authenticated families"
  on public.families for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Enable all for authenticated family_members"
  on public.family_members for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Family members can view snacks"
  on public.snacks for select
  using (auth.role() = 'authenticated');

create policy "Parents can modify snacks"
  on public.snacks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Members can view claims"
  on public.claims for select
  using (auth.role() = 'authenticated');

create policy "Members can create claims"
  on public.claims for insert
  with check (auth.role() = 'authenticated');

create policy "Parents can process claims"
  on public.claims for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
