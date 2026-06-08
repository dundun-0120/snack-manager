-- 用户 profile
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 家庭
create table public.families (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  password text not null,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- 家庭成员
create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('parent', 'child')),
  daily_quota integer default 4,
  weekly_quota integer default 20,
  created_at timestamptz default now() not null,
  unique(family_id, user_id)
);

-- 零食
create table public.snacks (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
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

-- 领取申请
create table public.claims (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  snack_id uuid references public.snacks(id) on delete cascade not null,
  member_id uuid references public.family_members(id) on delete cascade not null,
  quantity integer default 1,
  quota_cost integer default 2,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz default now() not null,
  processed_at timestamptz,
  processed_by uuid references public.profiles(id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.snacks enable row level security;
alter table public.claims enable row level security;

create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Family members can view" on public.snacks for select using (exists (select 1 from public.family_members where family_id = snacks.family_id and user_id = auth.uid()));
create policy "Parents can modify" on public.snacks for all using (exists (select 1 from public.family_members where family_id = snacks.family_id and user_id = auth.uid() and role = 'parent'));
create policy "Members can view claims" on public.claims for select using (exists (select 1 from public.family_members where family_id = claims.family_id and user_id = auth.uid()));
create policy "Members can create claims" on public.claims for insert with check (exists (select 1 from public.family_members where family_id = claims.family_id and user_id = auth.uid()));
create policy "Parents can process claims" on public.claims for update using (exists (select 1 from public.family_members where family_id = claims.family_id and user_id = auth.uid() and role = 'parent'));
