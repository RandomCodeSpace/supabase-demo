# APPLICATION_SPEC.md — OSSFlow Functional Specification

## 1. System Overview

### Core Purpose

OSSFlow is an **offline-first personal productivity application** that helps users manage two types of items: **Todos** (habits with daily tracking) and **Ideas** (projects with features). The system provides a mobile-optimized, gesture-driven interface with cloud synchronization to Supabase. Users can track daily habit completion progress, add notes to habits, brainstorm project ideas with feature lists, and export projects as markdown. The application works offline by storing data locally in IndexedDB, then synchronizing changes to the cloud when connectivity is available. It supports voice input for hands-free data entry and includes theme switching (light/dark/system).

### User Roles

| Role | Description | Auth Method |
|------|-------------|-------------|
| **Authenticated User** | Single user role. All data is user-scoped. Users can only access their own data. | OAuth via Google or GitHub |

---

## 2. Data Model (Schema Abstraction)

### 2.1 Habit

Represents a recurring task or habit to track daily.

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | Primary key, auto-generated | `uuid_generate_v4()` |
| user_id | UUID | Required, foreign key to User | Current authenticated user |
| title | Text | Required | — |
| description | Text | Optional | `null` |
| color | Text | Optional | `#4ade80` (green) |
| icon | Text | Optional | `null` |
| created_at | Timestamp (UTC) | Required | Current timestamp |
| sync_status | Enum | Local only: `synced`, `pending`, `deleted` | `pending` |

**Validation Rules:**
- `title` cannot be empty or whitespace-only

---

### 2.2 HabitLog

Tracks completion status of a habit for a specific date.

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | Primary key, auto-generated | `uuid_generate_v4()` |
| habit_id | UUID | Required, foreign key to Habit (cascade delete) | — |
| completed_at | Date | Required, format `YYYY-MM-DD` | Current date |
| status | Enum | `completed` or `skipped` | `completed` |
| sync_status | Enum | Local only: `synced`, `pending`, `deleted` | `pending` |

**Validation Rules:**
- Unique constraint on `(habit_id, completed_at)` — only one log per habit per day

---

### 2.3 HabitNote

Notes attached to a specific habit for journaling/tracking context.

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | Primary key, auto-generated | `uuid_generate_v4()` |
| habit_id | UUID | Required, foreign key to Habit (cascade delete) | — |
| content | Text | Required | — |
| created_at | Timestamp (UTC) | Required | Current timestamp |
| sync_status | Enum | Local only: `synced`, `pending`, `deleted` | `pending` |

**Validation Rules:**
- `content` cannot be empty

---

### 2.4 Project

Represents an idea or project with associated features.

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | Primary key, auto-generated | `gen_random_uuid()` |
| user_id | UUID | Required, foreign key to User | Current authenticated user |
| name | Text | Required | — |
| description | Text | Optional | `null` |
| status | Enum | `active`, `completed`, `archived` | `active` |
| created_at | Timestamp (UTC) | Required | Current timestamp |
| sync_status | Enum | Local only: `synced`, `pending`, `deleted` | `pending` |

**Validation Rules:**
- `name` cannot be empty or whitespace-only

---

### 2.5 ProjectFeature

Individual features or items within a project.

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | Primary key, auto-generated | `gen_random_uuid()` |
| project_id | UUID | Required, foreign key to Project (cascade delete) | — |
| title | Text | Required | — |
| description | Text | Optional | `null` |
| priority | Enum | `low`, `medium`, `high` | `medium` (server) |
| status | Enum | `pending`, `completed` | `pending` (server) |
| completed | Boolean | Local schema | `false` |
| created_at | Timestamp (UTC) | Required | Current timestamp |
| sync_status | Enum | Local only: `synced`, `pending`, `deleted` | `pending` |

**Validation Rules:**
- `title` cannot be empty

---

### 2.6 Todo (Legacy)

Simple todo item (less featured than Habit).

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | Primary key | `crypto.randomUUID()` |
| user_id | UUID | Required | Current authenticated user |
| text | Text | Required | — |
| completed | Boolean | Required | `false` |
| created_at | Timestamp (UTC) | Required | Current timestamp |
| sync_status | Enum | `synced`, `pending`, `deleted` | `pending` |

**Note:** This entity appears to be a simpler alternative or legacy component; the main "Todos" view uses the Habit entity.

---

## 3. Feature Catalog

### 3.1 Authentication

#### 3.1.1 OAuth Login

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps "Sign in with Google" or "Sign in with GitHub" button |
| **Process Flow** | 1. Set loading state to true<br>2. Call OAuth provider with redirect URL set to current origin<br>3. If error, display error toast<br>4. Provider handles redirect and callback<br>5. On successful callback, session is stored and sync begins |
| **Validation Rules** | None — delegated to OAuth provider |
| **Outcome** | User session is established; user is redirected to main app |

**Business Rules:**
- Redirect URL is always `window.location.origin`
- Buttons are disabled while loading

#### 3.1.2 Sign Out

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps "Sign Out" in Profile modal |
| **Process Flow** | 1. Clear session from state<br>2. Call signOut on auth service<br>3. Delete stored tokens (`sb-access-token`, `sb-refresh-token`) from IndexedDB<br>4. Show success toast and close modal<br>5. On error, still clear session and close modal (supports offline signout) |
| **Outcome** | User is returned to login screen |

#### 3.1.3 Clear Data & Logout (Destructive)

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps "Clear Data & Logout" in Profile modal and confirms |
| **Process Flow** | 1. Display blocking confirmation modal<br>2. On confirm: soft-delete all habits (mark as `deleted`)<br>3. Sign out<br>4. Show success toast |
| **Outcome** | All local habits marked for deletion; user signed out |

**Warning:** Synced data remains on server; only local data is cleared.

#### 3.1.4 Emergency Database Reset

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps "Emergency Database Reset" in Profile modal and confirms |
| **Process Flow** | 1. Display blocking confirmation modal<br>2. On confirm: clear all IndexedDB (idb-keyval)<br>3. Delete the Dexie database entirely<br>4. Clear localStorage<br>5. Force page reload |
| **Outcome** | Complete local state reset; synced data preserved on server |

---

### 3.2 Synchronization System

**Architecture:** Offline-first with eventual consistency

#### 3.2.1 Push Changes (Local → Server)

| Aspect | Details |
|--------|---------|
| **Trigger** | Any data mutation (create/update/delete) OR coming online OR visibility change to hidden |
| **Process Flow** | 1. Mark `needsSync = true`<br>2. Clear any existing push timer<br>3. Set new timer for **2000 milliseconds** (debounce)<br>4. When timer fires, if online:<br>&nbsp;&nbsp;a. For each table, find records with `sync_status = 'pending'`<br>&nbsp;&nbsp;b. Upsert to server (excluding sync_status field)<br>&nbsp;&nbsp;c. On success, mark as `synced`<br>&nbsp;&nbsp;d. For `sync_status = 'deleted'` records, delete from server<br>&nbsp;&nbsp;e. On success, hard-delete locally<br>5. If more changes occurred during sync, queue another push |
| **Validation Rules** | Must be online; must not be already syncing |
| **Outcome** | Local changes reflected on server |

**Business Constants:**
- `PUSH_DEBOUNCE_MS = 2000` (2 seconds)
- Tables synced: `habits`, `habit_logs`, `habit_notes`, `projects`, `project_features`

#### 3.2.2 Push Immediately

| Aspect | Details |
|--------|---------|
| **Trigger** | App goes to background (visibility changes to "hidden") |
| **Process Flow** | Same as Push Changes but bypasses debounce timer |
| **Outcome** | Ensures data is saved before app may be terminated |

#### 3.2.3 Pull Changes (Server → Local)

| Aspect | Details |
|--------|---------|
| **Trigger** | On app load, on auth state change (sign in), on window focus, on coming online, on visibility change to visible |
| **Process Flow** | 1. Verify online and authenticated<br>2. For each table, fetch all records from server<br>3. For each record:<br>&nbsp;&nbsp;a. If local record doesn't exist OR local `sync_status = 'synced'`: overwrite with server data<br>&nbsp;&nbsp;b. If local `sync_status = 'pending'` or `'deleted'`: keep local (local changes take precedence)<br>4. Store `last_pulled_at` timestamp<br>5. Refresh UI stores |
| **Outcome** | Local database reflects server state (respecting local pending changes) |

**Merge Rule:** Local pending changes always win over server data.

---

### 3.3 Habit (Todo) Management

#### 3.3.1 View Habits

| Aspect | Details |
|--------|---------|
| **Trigger** | Navigate to Todos tab OR app loads with Todos as active tab |
| **Process Flow** | 1. Fetch all habits with `sync_status != 'deleted'`<br>2. Sort by `created_at` descending (newest first)<br>3. Fetch today's logs with `sync_status != 'deleted'`<br>4. Calculate progress: `(unique completed habit IDs / total habits) × 100` |
| **Outcome** | Display list of habits with progress ring showing percentage complete |

**Progress Calculation Logic:**
1. Filter logs to only include those with `status = 'completed'`
2. Filter to only include logs for habits that still exist
3. Count unique habit IDs from filtered logs
4. Divide by total habit count, multiply by 100

#### 3.3.2 Create Habit

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps FAB (+) button OR swipes up (velocity > 0.5, movement < -50px) |
| **Process Flow** | 1. Open Add Habit modal (drawer)<br>2. User enters title (required) and description (optional)<br>3. User can use voice input for fields<br>4. On submit, if title is empty, block submission<br>5. Generate UUID locally<br>6. Create habit with default color `#4ade80` and icon `circle`<br>7. Set `sync_status = 'pending'`<br>8. Add to local database<br>9. Trigger push sync<br>10. Add to UI state immediately<br>11. Show success toast |
| **Validation Rules** | Title must not be empty after trimming whitespace |
| **Outcome** | New habit appears at top of list |

**Default Values:**
- Color: `#4ade80`
- Icon: `circle`

#### 3.3.3 Toggle Habit Completion

| Aspect | Details |
|--------|---------|
| **Trigger** | User swipes habit right (offset > 100px) |
| **Process Flow** | 1. Check for existing log for today<br>2. **If log exists with status != 'deleted':**<br>&nbsp;&nbsp;a. If `sync_status = 'pending'`: hard delete (never synced)<br>&nbsp;&nbsp;b. Else: soft delete (`sync_status = 'deleted'`), trigger sync<br>3. **If log exists with status = 'deleted':**<br>&nbsp;&nbsp;a. Restore: set `sync_status = 'pending'`, `status = 'completed'`<br>4. **If no log exists:**<br>&nbsp;&nbsp;a. Create new log with `status = 'completed'`, `sync_status = 'pending'`<br>5. Recalculate progress<br>6. Show status toast |
| **Outcome** | Habit marked as complete/incomplete for today; progress updates |

**Smart Prune Rule:** If a record was never synced (`sync_status = 'pending'`), it can be hard-deleted rather than soft-deleted.

#### 3.3.4 Delete Habit

| Aspect | Details |
|--------|---------|
| **Trigger** | User swipes habit left (offset < -100px) |
| **Process Flow** | 1. Show confirmation modal<br>2. On confirm:<br>&nbsp;&nbsp;a. If `sync_status = 'pending'`: hard delete<br>&nbsp;&nbsp;b. Else: soft delete, trigger sync<br>3. Remove from UI<br>4. Recalculate progress<br>5. Show success toast |
| **Outcome** | Habit removed from list |

**Warning Message:** "This action cannot be undone. All notes and history for this todo will be lost."

#### 3.3.5 View Habit Details

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps on a habit item |
| **Process Flow** | 1. Open detail modal<br>2. Fetch notes for this habit (`sync_status != 'deleted'`)<br>3. Sort notes by `created_at` ascending (oldest first)<br>4. Auto-scroll to bottom when notes change |
| **Outcome** | Modal displays habit title and list of notes |

#### 3.3.6 Add Habit Note

| Aspect | Details |
|--------|---------|
| **Trigger** | User types in note input and presses Send OR presses Enter (without Shift) |
| **Process Flow** | 1. Validate content not empty<br>2. Create note with UUID<br>3. Set `sync_status = 'pending'`<br>4. Add to local database<br>5. Trigger push sync<br>6. Append to notes list<br>7. Clear input<br>8. Auto-scroll to new note |
| **Validation Rules** | Content must not be empty after trimming |
| **Outcome** | Note appears in habit detail view |

#### 3.3.7 Delete Habit Note

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps trash icon on a note and confirms browser confirm dialog |
| **Process Flow** | 1. If `sync_status = 'pending'`: hard delete<br>2. Else: soft delete, trigger sync<br>3. Remove from UI |
| **Outcome** | Note removed from list |

---

### 3.4 Project (Idea) Management

#### 3.4.1 View Projects

| Aspect | Details |
|--------|---------|
| **Trigger** | Navigate to Ideas tab OR app loads with Ideas as active tab |
| **Process Flow** | 1. Fetch all projects with `sync_status != 'deleted'`<br>2. Sort by `created_at` descending<br>3. For each project, count features with `sync_status != 'deleted'`<br>4. Display in bento grid layout |
| **Outcome** | Grid of project cards showing name, description, and feature count |

**Visual Enhancement:** First (newest) project displays animated border beam effect.

#### 3.4.2 Create Project

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps FAB (+) button OR swipes up |
| **Process Flow** | 1. Open Add Project modal (drawer)<br>2. User enters name (required) and description (optional)<br>3. On submit, validate name not empty<br>4. Create project with default status `active`<br>5. Add to local database, trigger sync<br>6. Add to UI state<br>7. Show success toast: "New idea conceptualized!" |
| **Validation Rules** | Name must not be empty |
| **Outcome** | New project appears at top of grid |

#### 3.4.3 Delete Project

| Aspect | Details |
|--------|---------|
| **Trigger** | User swipes project card left and confirms |
| **Process Flow** | 1. Show confirmation toast<br>2. On confirm:<br>&nbsp;&nbsp;a. If `sync_status = 'pending'`: hard delete project AND all its features<br>&nbsp;&nbsp;b. Else: soft delete project, trigger sync (cascade handles features on server)<br>3. Remove from UI<br>4. Show success toast |
| **Outcome** | Project removed from grid |

#### 3.4.4 View Project Details

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps on a project card |
| **Process Flow** | 1. Open detail modal (80% viewport height)<br>2. Fetch features for this project (`sync_status != 'deleted'`)<br>3. Sort by `created_at` ascending<br>4. Auto-scroll to bottom when features change |
| **Outcome** | Modal displays project name, feature count, and numbered feature list |

#### 3.4.5 Add Feature

| Aspect | Details |
|--------|---------|
| **Trigger** | User types in feature input and presses Send OR presses Enter (without Shift) |
| **Process Flow** | 1. Validate title not empty<br>2. Create feature with `completed = false`<br>3. Add to local database, trigger sync<br>4. Append to features list<br>5. Notify parent to refresh (updates feature count) |
| **Outcome** | Feature appears in list with sequential number |

#### 3.4.6 Delete Feature

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps trash icon on a feature |
| **Process Flow** | 1. If `sync_status = 'pending'`: hard delete<br>2. Else: soft delete, trigger sync<br>3. Remove from UI<br>4. Notify parent to refresh |
| **Outcome** | Feature removed; numbers re-sequence |

#### 3.4.7 Export Project as Markdown

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps copy icon in project detail header |
| **Process Flow** | 1. Generate markdown with format:<br>```<br># Project: {name}<br><br>{description}<br><br>## Features<br>1. **{feature.title}**<br>   {feature.description}<br>...<br><br>---<br>* Generated by OSSFlow *<br>```<br>2. Copy to clipboard<br>3. Show success toast: "Markdown copied to clipboard!" |
| **Outcome** | Project exported as markdown in clipboard |

---

### 3.5 Navigation & Gestures

#### 3.5.1 Tab Navigation

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps tab button OR swipes horizontally |
| **Process Flow** | 1. Validate swipe: velocity >= 0.2, distance >= 100px, diagonal movement < 50px<br>2. Check no modal is open<br>3. Check target is not a swipeable item (`.swipe-prevention` class)<br>4. Left swipe on Ideas → switch to Todos<br>5. Right swipe on Todos → switch to Ideas<br>6. Persist active tab to IndexedDB |
| **Outcome** | Tab view changes; selection persisted |

**Swipe Thresholds:**
- Minimum velocity: `0.2`
- Minimum horizontal distance: `100px`
- Maximum vertical distance (diagonal threshold): `50px`

#### 3.5.2 Swipe-to-Add

| Aspect | Details |
|--------|---------|
| **Trigger** | User swipes up within Todos or Ideas view |
| **Process Flow** | 1. Check no modal is open<br>2. Validate: velocity > 0.5, direction upward, movement < -50px<br>3. Open Add modal |
| **Outcome** | Add modal appears |

**Swipe-to-Add Thresholds:**
- Minimum velocity: `0.5`
- Minimum upward movement: `50px`

#### 3.5.3 Tab Persistence

| Aspect | Details |
|--------|---------|
| **Trigger** | App loads |
| **Process Flow** | 1. Read `activeTab` from IndexedDB (idb-keyval)<br>2. If value is `todos` or `ideas`, set as active<br>3. Otherwise, default to `ideas` |
| **Outcome** | User returns to last viewed tab |

---

### 3.6 Theme Management

#### 3.6.1 Theme Selection

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps theme option in Profile modal |
| **Process Flow** | 1. Set theme to selected value<br>2. Theme provider handles CSS application |
| **Outcome** | UI updates to selected theme |

**Available Themes:** `light`, `dark`, `system`

---

### 3.7 Voice Input

#### 3.7.1 Speech-to-Text Dictation

| Aspect | Details |
|--------|---------|
| **Trigger** | User taps microphone icon in supported input fields |
| **Process Flow** | 1. Check browser support for Web Speech API<br>2. If supported, show mic button<br>3. On tap, start speech recognition<br>4. Capture text before listening started (for append mode)<br>5. As user speaks, update input with: `{previousText} {transcript}`<br>6. On tap again or speech ends, stop recognition<br>7. Final text remains in input |
| **Validation Rules** | Web Speech API must be available |
| **Outcome** | User's speech converted to text in input field |

**Speech Recognition Configuration:**
- `continuous = false` (single burst mode, more stable on iOS)
- `interimResults = true` (show text as user speaks)
- `lang = 'en-US'`

---

### 3.8 Orientation Guard

| Aspect | Details |
|--------|---------|
| **Trigger** | Device orientation or window size changes |
| **Process Flow** | 1. Check if orientation is landscape<br>2. Check if screen width <= 1024px OR height <= 500px<br>3. If both conditions met, show full-screen overlay<br>4. Display message: "Please Rotate Your Device" |
| **Outcome** | Overlay blocks app usage until device is in portrait mode |

**Device Detection Thresholds:**
- Max width for mobile detection: `1024px` (covers iPad Mini)
- Max height for mobile detection: `500px` (landscape phone detection)

---

## 4. API & Integration Contract

### 4.1 Supabase Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `auth.signInWithOAuth` | OAuth Flow | Initiate Google/GitHub login |
| `auth.signOut` | POST | End user session |
| `auth.getSession` | GET | Retrieve current session |
| `auth.getUser` | GET | Get authenticated user details |
| `auth.onAuthStateChange` | Subscription | Listen for auth state changes |

### 4.2 Database Operations (via Supabase Client)

All tables use Row Level Security (RLS). Users can only access their own data.

| Table | Operations | RLS Policy |
|-------|------------|------------|
| `habits` | SELECT, INSERT, UPDATE, DELETE | `auth.uid() = user_id` |
| `habit_logs` | SELECT, INSERT, DELETE | Via parent habit ownership |
| `habit_notes` | SELECT, INSERT, DELETE | Via parent habit ownership |
| `projects` | SELECT, INSERT, UPDATE, DELETE | `auth.uid() = user_id` |
| `project_features` | SELECT, INSERT, UPDATE, DELETE | Via parent project ownership |

### 4.3 Local Storage (IndexedDB)

| Store | Library | Purpose |
|-------|---------|---------|
| `OSSFlowDB` | Dexie.js | Main application database |
| idb-keyval | idb-keyval | Key-value storage for settings |

**idb-keyval Keys:**
- `activeTab`: Current tab selection (`ideas` or `todos`)
- `last_pulled_at`: Timestamp of last server pull
- `sb-access-token`: Supabase access token (deleted on logout)
- `sb-refresh-token`: Supabase refresh token (deleted on logout)

---

## 5. UI/UX Behaviors (Non-Technical)

### 5.1 Modal Behaviors

| Behavior | Description |
|----------|-------------|
| **Backdrop dismissal** | Drawer modals can be dismissed by clicking outside or swiping down |
| **Confirmation blocking** | Destructive action confirmation modals block all other UI interaction |
| **Auto-scroll** | Note and feature lists auto-scroll to bottom when new items are added |
| **Loading overlay** | Semi-transparent overlay with message shown during async operations |

### 5.2 Form Behaviors

| Behavior | Description |
|----------|-------------|
| **Enter to submit** | In title fields, Enter key submits the form |
| **Shift+Enter for newline** | In note/feature inputs, Shift+Enter adds newline; Enter alone submits |
| **Disabled state** | Submit buttons disabled when required fields are empty or loading |
| **Button loading text** | Buttons show "Creating...", "Connecting...", etc. during operations |

### 5.3 Visual Feedback

| Behavior | Description |
|----------|-------------|
| **Swipe color feedback** | Swipe right reveals green (complete); swipe left reveals red (delete) |
| **Completed habit overlay** | Completed habits show semi-transparent overlay with checkmark |
| **Progress ring** | Circular progress indicator shows percentage of habits completed today |
| **Border beam** | Newest project card has animated cyan-to-purple border effect |
| **Blur fade animation** | List items animate in with staggered blur fade (0.04s delay per item) |

### 5.4 Responsive Behaviors

| Behavior | Description |
|----------|-------------|
| **FAB positioning** | Mobile: bottom 96px, right 24px; Desktop: bottom 32px, right 32px |
| **Orientation lock** | Mobile landscape displays rotation prompt overlay |
| **Bento grid** | 1 column on mobile; 2 columns on medium screens; 3 columns on large |

### 5.5 Toast Notifications

| Type | Purpose | Visual |
|------|---------|--------|
| `success` | Confirm successful actions | Green styling |
| `error` | Report failures | Red styling |
| `confirmation` | Request user confirmation | Includes confirm button |

---

## 6. "Danger Zone" & Edge Cases

### 6.1 Sync Conflict Resolution

**Rule:** Local pending changes always win.

| Scenario | Behavior |
|----------|----------|
| Local record is `pending`, server has newer data | Keep local data |
| Local record is `deleted`, server has data | Keep local deletion |
| Local is `synced`, server has newer data | Overwrite with server data |

**Risk:** If user makes changes on two devices offline simultaneously, the last device to sync wins (last-write-wins strategy). No merge is attempted.

### 6.2 Smart Prune (Never-Synced Optimization)

**Critical Implementation Detail:** If a record has `sync_status = 'pending'` and is deleted, it can be hard-deleted immediately without going through the soft-delete → sync → purge cycle. This prevents accumulation of ghost records for items created and deleted while offline.

### 6.3 Visibility Change Sync

**PWA Critical Path:** When the app goes to background (`visibilityState = 'hidden'`), an immediate (non-debounced) sync is triggered. This is essential for mobile PWAs where the app may be terminated shortly after backgrounding.

**Return from background:** When visibility returns, both pull and store refresh are triggered to ensure UI shows latest data.

### 6.4 Progress Calculation Gotchas

**Edge Case:** If a habit is deleted but its logs still exist in state, those logs must NOT count toward progress.

**Implementation:** Progress calculation filters logs to only count those whose `habit_id` exists in the current habits array.

### 6.5 Cascade Delete Behavior

| Level | Behavior |
|-------|----------|
| **Server** | Foreign key with `ON DELETE CASCADE` handles automatic cleanup |
| **Local (pending parent)** | Must manually delete child records when hard-deleting parent |

### 6.6 Speech Recognition Platform Quirks

**iOS Stability:** `recognition.continuous = false` is intentionally set to improve stability on iOS Safari. iOS handles continuous speech recognition poorly due to resource allocation issues.

**Browser Support:** Mic button only appears if `SpeechRecognition` or `webkitSpeechRecognition` is available.

### 6.7 Unique Constraint Handling

**HabitLog Uniqueness:** The combination of `(habit_id, completed_at)` must be unique. The toggle operation must check for existing logs before inserting.

**Restoration Path:** If a log was soft-deleted and the user toggles again on the same day, the existing record is restored rather than creating a new one.

### 6.8 Auth Token Cleanup

**On Sign Out:** Both `sb-access-token` and `sb-refresh-token` must be deleted from idb-keyval to prevent stale sessions.

### 6.9 Theme Persistence

Theme selection is managed by `next-themes` library and persisted to localStorage automatically.

### 6.10 Feature Count Freshness

**Parent Notification:** When features are added or deleted, the parent view must be notified to refresh project data so feature counts remain accurate.

---

## Appendix: Business Constants Reference

| Constant | Value | Location |
|----------|-------|----------|
| Default habit color | `#4ade80` | AddHabitModal |
| Default habit icon | `circle` | AddHabitModal |
| Sync debounce delay | `2000ms` | SyncService |
| Swipe complete threshold | `100px` | SwipeableHabit |
| Swipe delete threshold | `-100px` | SwipeableHabit |
| Tab swipe velocity threshold | `0.2` | App |
| Tab swipe distance threshold | `100px` | App |
| Tab swipe diagonal rejection | `50px` | App |
| Add gesture velocity threshold | `0.5` | TodosView/IdeasView |
| Add gesture distance threshold | `50px` | TodosView/IdeasView |
| Orientation guard max width | `1024px` | OrientationGuard |
| Orientation guard max height | `500px` | OrientationGuard |
| Blur fade stagger delay | `0.04s` | TodosView/IdeasView |
| Speech recognition language | `en-US` | useSpeechRecognition |
| Database name | `OSSFlowDB` | db.ts |
| Project default status | `active` | ProjectService |
| Feature default completed | `false` | ProjectService |

---

*Document generated from codebase analysis — OSSFlow v1.0*
