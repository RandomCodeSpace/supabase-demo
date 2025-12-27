# Master Implementation Checklist

Use this checklist to track the reconstruction or validation of the OSSFlow application.

## 1. Project Initialization
- [x] **Vite Setup**: React + TypeScript + SWC.
- [x] **Tailwind Config**: Content paths, colors (Zen theme), animations.
- [x] **Supabase Project**: Created with Auth (Google/GitHub) and Postgres DB.

## 2. Infrastructure (The "Backbone" 🛡️)
- [x] **`src/backbone/lib/supabase.ts`**:
    -   [ ] Configure client.
    -   [ ] Implement `idbStorage` adapter (REQUIRED for PWA).
- [x] **`src/backbone/lib/db.ts`**:
    -   [ ] Define `AppDatabase` class extending Dexie.
    -   [ ] Define schemas: `habits`, `logs`, `notes`, `projects`, `features`.
    -   [ ] Add `sync_status` index to all tables.
- [x] **`src/backbone/services/syncService.ts`**:
    -   [ ] `pushChanges()`: Debounce 2s, Push Pending, Push Deleted.
    -   [ ] `pullChanges()`: Fetch all, Merge (Local Wins).
    -   [ ] `initialSync()`: Clean pull.

## 3. Core Services (Local-First)
- [x] **`HabitService`**:
    -   [ ] `createHabit`: Add to IDB (Pending).
    -   [ ] `toggleCompletion`: Logic for Insert vs Delete (Smart Prune).
    -   [ ] `fetchHabits`: Query IDB (exclude deleted).
- [x] **`ProjectService`**:
    -   [ ] `fetchProjects`: Manual feature counting via IDB.
    -   [ ] `deleteProject`: Cascade soft-delete.

## 4. UI Architecture (Responsive 📱/🖥️)
- [x] **`src/components/layout/AppLayout.tsx`**:
    -   [ ] Hybrid Layout Engine.
    -   [ ] **Mobile**: Floating Glass Pill Navigation (`fixed bottom-6`).
    -   [ ] **Desktop**: Glassmorphic Sidebar.
- [x] **`src/components/layout/Sidebar.tsx`**: Desktop navigation.
- [x] **`src/App.tsx`**:
    -   [ ] Routing (Todos / Ideas).
    -   [ ] Sync Listeners (`focus`, `online`).
    -   [ ] Orientation Guard.

## 5. UI Views (The "Glass")
- [x] **`Auth.tsx`**: Magic Link / OAuth Login.
- [x] **`TodosView.tsx`** (Habits):
    -   [ ] Swipe gestures (Delete).
    -   [ ] FAB for new habits.
    -   [ ] Progress Ring.
- [x] **`IdeasView.tsx`** (Projects):
    -   [ ] Project Grid.
    -   [ ] `ProjectDetailModal` (Feature list, Markdown export).
- [x] **`UserProfileModal.tsx`**:
    -   [ ] Theme Toggle.
    -   [ ] Data Reset (Aggressive deletion).
    -   [ ] Logout (Clear IDB tokens).

## 6. PWA & Deployment
- [x] **Manifest**: `manifest.webmanifest` created/generated.
- [x] **Service Worker**: Registered via `vite-plugin-pwa`.
- [x] **Assets**: Icons (192, 512, maskable) in `public/`.
- [x] **Build**: `npm run build` passes with no Type errors.

- [x] **Smart Prune**: Creating and deleting an item offline results in 0 API calls.
- [x] **Debounce**: Rapid clicks result in single batch upload.

## 8. Reliability & Polish (Post-Launch Checks)
- [x] **Sync Reliability**:
    - [x] `visibilitychange` listener for background sync (PWA).
    - [x] Static imports to prevent latency.
    - [x] Session checks in `pushImmediately`.
- [x] **UI Polish**:
    - [x] Glassmorphism fixes (transparent inputs in modals).
    - [x] Modal Z-Index layers (Profile > Nav).
    - [x] Consistent Auto-scroll in lists.
- [x] **Logic Fixes**:
    - [x] Todo Progress Calculation (Unique active habits only).
    - [x] Gesture Conflict (SwipeableHabit vs Global Tabs).

