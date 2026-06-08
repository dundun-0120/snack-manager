-- 最终安全版本：兼容 Supabase SQL Editor
-- 如果报错，请刷新页面后重新执行

-- Step 1: 创建表（if not exists 避免重复报错）
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

-- Step 2: 启用 RLS
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.snacks enable row level security;
alter table public.claims enable row level security;
