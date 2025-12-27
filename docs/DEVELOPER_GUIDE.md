# OSSFlow: Master Developer Guide

This document contains everything needed to **recreate** the OSSFlow application from scratch. It details the architecture, database schema, security policies, and offline sync logic.

---

## 🛠 1. Tech Stack & Dependencies

### Core
-   **Framework**: React 18 + Vite 5 + TypeScript
-   **State Management**: Zustand
-   **Routing**: Standard React State (Single Page View)

### Backend & Data
-   **Remote DB**: Supabase (PostgreSQL)
-   **Local DB**: Dexie.js (IndexedDB wrapper)
-   **Auth Persistence**: idb-keyval
-   **Sync Engine**: Custom "Smart Sync" (Debounced Last-Write-Wins)

### UI/UX
-   **Styling**: TailwindCSS
-   **Icons**: Lucide React
-   **Animations**: Framer Motion
-   **Components**: MagicUI (Shiny Button, etc.)

---

## 🏛 2. Architecture: Separation of Concerns

The project follows a strict division between UI and Logic:

*   `src/backbone/` 🛡️ **(THE CORE)**: Contains all business logic, data persistence, and synchronization code.
    *   `lib/`: Core utilities (`db.ts`, `supabase.ts`).
    *   `services/`: Service layer (`habitService.ts`, `syncService.ts`).
    *   `hooks/`: Logic-only hooks.
*   `src/components/` 🎨 **(THE VIEW)**: UI components only.
    *   `layout/`: Responsive layout engine (`AppLayout`, `Sidebar`).
    *   `ui/`: Reusable UI atoms.

> **RULE**: UI components must NEVER contain direct Supabase or IndexedDB calls. They must import from `src/backbone/services`.

---

## 🗄 3. Supabase Setup (SQL Schema)

To recreate the backend, run these SQL commands in your Supabase SQL Editor:

### A. Tables
```sql
-- Habits Table
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  color text default '#4F46E5',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habit Logs (Completions)
create table habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  completed_at date not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
-- Index for fast lookup
create unique index idx_habit_logs_unique on habit_logs(habit_id, completed_at);

-- Habit Notes
create table habit_notes (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Project Features
create table project_features (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### B. Row Level Security (RLS)
Enable RLS on ALL tables and add these policies:

```sql
-- Generic Policy for all tables (replace 'table_name' with actual table)
create policy "Users can CRUD their own data"
  on table_name for all
  using (auth.uid() = user_id);
```

---

## 💾 4. Offline-First Architecture (The Core)

The application uses **IndexedDB** as the primary data source. Supabase is treated as a backup/sync target.

### A. Local Schema (`src/backbone/lib/db.ts`)
We use `Dexie.js`. All local types mirror Supabase types but add `sync_status`.

```typescript
type SyncStatus = 'synced' | 'pending' | 'deleted';
```

### B. Sync Logic (`src/backbone/services/syncService.ts`)
The sync engine operates on two rules:
1.  **Push**:
    -   Triggered by any WRITE operation in Services.
    -   **Debounced (2s)**: Waits for user to stop typing.
    -   **Smart Prune**: If an item is created (Pending) and deleted before sync, it is physically removed (0 API calls).
2.  **Pull**:
    -   Triggered by `App.tsx` on `focus` and `online`.
    -   Merges remote data but prioritizes local `pending` changes.

---

## 📱 5. Responsive UI System

The app uses a hybrid navigation model via `src/components/layout/AppLayout.tsx`:
*   **Mobile (<768px)**: Floating Glassmorphic Pill Navigation (Bottom).
*   **Desktop (>=768px)**: Glassmorphic Sidebar (Left).

**Tabs**:
1.  **Ideas** (Default): The Project/Idea Manager view.
2.  **Todos**: The primary Habit Tracker view.

### B. Polish & Interactions
-   **Gestures**: Global horizontal swipe switches tabs. Conflict prevention is implemented for `SwipeableHabit` components (using `.swipe-prevention` class).
-   **Modals**: All modals use `z-[100]` to overlay the bottom navigation bar. Inputs use `bg-transparent` for full glassmorphism integration.

