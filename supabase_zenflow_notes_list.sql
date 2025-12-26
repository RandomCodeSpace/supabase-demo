-- Create habit_notes table
create table habit_notes (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table habit_notes enable row level security;

-- Policies (same logical ownership as habit_logs)
create policy "Users can view notes for their habits" on habit_notes
  for select using (
    exists (
      select 1 from habits
      where habits.id = habit_notes.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can insert notes for their habits" on habit_notes
  for insert with check (
    exists (
      select 1 from habits
      where habits.id = habit_notes.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can delete notes for their habits" on habit_notes
  for delete using (
    exists (
      select 1 from habits
      where habits.id = habit_notes.habit_id
      and habits.user_id = auth.uid()
    )
  );

-- Optional: Migrate existing data from 'notes' column if any
insert into habit_notes (habit_id, content)
select id, notes from habits
where notes is not null and notes != '';
