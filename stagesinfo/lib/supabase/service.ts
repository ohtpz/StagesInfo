import { createClient } from '@supabase/supabase-js'

// This is a special "super admin" Supabase client.
// It uses the secret service key, which bypasses all security rules (RLS).
//
// WHY do we need it?
// When a company wants to view a student's CV, the normal client would be
// blocked by storage security rules because the file belongs to the student,
// not the company. The service client bypasses that check.
//
// ⚠️ IMPORTANT: Only use this in server-side code (API routes).
//    Never import this in a page or component — the secret key must never
//    reach the browser.
export function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SECRET_KEY

    if (!url || !serviceKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY env vars')
    }

    // persistSession: false means this client doesn't store any user session.
    // It acts as a neutral "admin" with no identity.
    return createClient(url, serviceKey, {
        auth: { persistSession: false }
    })
}
