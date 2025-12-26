-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Habits Table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  color text default '#4ade80', -- Tailwind green-400
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habit Logs (Tracking Completions)
create table habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  completed_at date default current_date not null,
  status text default 'completed', -- completed, skipped
  unique(habit_id, completed_at) -- Prevent duplicate logs for same day
);

-- RLS Policies
alter table habits enable row level security;
alter table habit_logs enable row level security;

-- Habits Policies
create policy "Users can view their own habits" on habits
  for select using (auth.uid() = user_id);

create policy "Users can insert their own habits" on habits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own habits" on habits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own habits" on habits
  for delete using (auth.uid() = user_id);

-- Logs Policies (Implicitly owned via habit, but standard practice to link to user or rely on habit ownership)
-- Ideally logs should also have user_id for easier RLS, but we can check via habit
create policy "Users can view logs for their habits" on habit_logs
  for select using (
    exists (
      select 1 from habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can insert logs for their habits" on habit_logs
  for insert with check (
    exists (
      select 1 from habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can delete logs for their habits" on habit_logs
  for delete using (
    exists (
      select 1 from habits
      where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
    )
  );
