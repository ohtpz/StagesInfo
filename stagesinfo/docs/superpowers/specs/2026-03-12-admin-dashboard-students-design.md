# Admin Dashboard — Student Management

**Date:** 2026-03-12

## Context

The admin dashboard (`/dashboard`) currently renders an empty `AdminDashboard` component. Admins need to view and manage student accounts: see who is registered, edit their name, or delete their account entirely.

## Goal

Add a student list table to `AdminDashboard` with Edit and Delete actions, client-side pagination, and a dedicated edit page.

---

## Design

### Route Protection

Create `app/admin/layout.tsx` as a server component that checks `profile.role === 'admin'` (using `createClient()` from `lib/supabase/server.ts`) and redirects to `/` otherwise. This protects all current and future `/admin/*` pages without repeating the check.

Note: `/dashboard` (where `AdminDashboard` is rendered) uses a client-side role check via `getCurrentUser()` in `useEffect`. This is a pre-existing gap — a non-admin may briefly see the component before the redirect fires. Fixing the dashboard guard is out of scope for this feature.

### Data Fetching

`AdminDashboard` is a client component (`"use client"`). On mount it calls a server action `getStudentProfiles()` (new, added to `lib/students.ts`) that uses the **server** Supabase client to query `profiles WHERE role = 'student'`. Using the server client ensures the `is_admin()` RLS function is evaluated in the correct session context so admin users can read all rows.

Fields used: `id`, `first_name`, `last_name`, `created_at`.

### Table

Rendered using shadcn `Table` components.

Columns:
| Full Name | Joined | Actions |
|-----------|--------|---------|
| First Last | Mar 12, 2026 | Edit · Delete |

- **Edit button** — navigates to `/admin/students/[id]/edit` via `useRouter().push()`
- **Delete button** — opens shadcn `AlertDialog` for confirmation

### Pagination

- 10 rows per page, client-side (slice the fetched array)
- Controls: `← Previous` / `Next →` + "Page X of Y"
- `page` resets to 1 on initial data load
- After a successful delete, recalculate `totalPages`; if `page > totalPages`, set `page = Math.max(1, totalPages)`

### Delete Flow

1. User clicks Delete → `AlertDialog` opens with warning
2. User confirms → calls `deleteStudentAndUser(userId)` server action
3. On success → remove student from local state (no refetch), adjust page if needed
4. On error → show inline error message below the table

`deleteStudentAndUser` is added to `app/actions/deleteAccount.ts`. It uses `createServiceClient()` from `lib/supabase/service.ts` (consistent with the rest of the codebase — do not inline a new `createClient` call). Deletes in this order:

1. Fetch `cv_path` from `students` WHERE `user_id = userId`
2. If `cv_path` is non-null → `supabaseAdmin.storage.from('cvs').remove([cv_path])`. If this call returns an error, log it and continue — a missing file must not block the account deletion.
3. Delete `student_skills` WHERE `student_id = userId`
4. Fetch all `application.id` values WHERE `student_id = userId`
5. Delete `reviews` WHERE `application_id IN (fetched ids)`
6. Delete `applications` WHERE `student_id = userId`
7. Delete `students` WHERE `user_id = userId`
8. Delete `profiles` WHERE `id = userId`
9. `supabaseAdmin.auth.admin.deleteUser(userId)`

### Edit Page

Route: `app/admin/students/[id]/edit/page.tsx`

- Server component — reads `id` from params, fetches profile using server Supabase client
- Renders a `"use client"` form with `first_name` and `last_name` inputs
- Submit calls a server action that uses the **service role client** to `UPDATE profiles SET first_name, last_name WHERE id = userId` (bypasses any RLS restriction on admin updating other users' rows)
- On success → redirect to `/dashboard`
- Includes `BackButton` at the top

Note: `updateStudentProfile` in `lib/students.ts` uses the browser client and relies on RLS. Rather than modifying it, the edit page will use its own inline server action with `createServiceClient()` to guarantee the write succeeds regardless of the profiles UPDATE policy.

---

## Files

| File | Change |
|------|--------|
| `app/admin/layout.tsx` | New — admin role guard (server component) |
| `components/dashboard/AdminDashboard.tsx` | Full implementation: table, pagination, delete AlertDialog |
| `lib/students.ts` | Add `getStudentProfiles()` server action |
| `app/actions/deleteAccount.ts` | Add `deleteStudentAndUser(userId)` |
| `app/admin/students/[id]/edit/page.tsx` | New edit page with inline server action |

---

## Verification

1. Log in as non-admin → `/admin/students/...` redirects to `/`
2. Log in as admin → `/dashboard` shows student table with name and joined date
3. Pagination: 10 rows per page; Prev/Next work; deleting last row on a page moves to previous page
4. Edit navigates to `/admin/students/[id]/edit`, form saves and redirects to `/dashboard`
5. Delete opens AlertDialog; confirm removes the row from DB and table without FK errors
6. After delete: CV file is gone from Supabase Storage `cvs` bucket
