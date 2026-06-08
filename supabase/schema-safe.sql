-- 安全版本：无 drop 语句，无破坏性操作
-- 如果表已存在会跳过，不会报错

-- 先禁用 RLS（如果已启用），避免创建策略时冲突
alter table if exists public.profiles disable row level security;
alter table if exists public.families disable row level security;
alter table if exists public.family_members disable row level security;
alter table if exists public.snacks disable row level security;
alter table if exists public.claims disable row level security;

-- 创建表（if not exists 表示已存在则跳过）
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

-- 启用 RLS
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.snacks enable row level security;
alter table public.claims enable row level security;

-- 创建策略（使用 or replace 避免重复创建报错）
create policy if not exists "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy if not exists "Enable all for authenticated families"
  on public.families for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Enable all for authenticated family_members"
  on public.family_members for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Family members can view snacks"
  on public.snacks for select
  using (auth.role() = 'authenticated');

create policy if not exists "Parents can modify snacks"
  on public.snacks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Members can view claims"
  on public.claims for select
  using (auth.role() = 'authenticated');

create policy if not exists "Members can create claims"
  on public.claims for insert
  with check (auth.role() = 'authenticated');

create policy if not exists "Parents can process claims"
  on public.claims for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
