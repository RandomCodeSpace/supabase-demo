-- Add notes column to habits table
alter table habits 
add column if not exists notes text;
