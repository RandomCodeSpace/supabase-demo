-- Create projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Create project_features table
create table public.project_features (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('pending', 'completed')) default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.project_features enable row level security;

-- Policies for projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Policies for project_features
-- We check permission based on the parent project's ownership
create policy "Users can view features of their projects"
  on public.project_features for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_features.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert features to their projects"
  on public.project_features for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_features.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update features of their projects"
  on public.project_features for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_features.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete features of their projects"
  on public.project_features for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_features.project_id
      and projects.user_id = auth.uid()
    )
  );
