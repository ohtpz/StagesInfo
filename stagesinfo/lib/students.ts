import { createClient } from './supabase/client'
import { Profile, Skill } from './types'

// Get student profile combined with user profile data
export async function getStudentProfile(userId: string) {
    const supabase = createClient()

    // Get the user's basic info (name, role, etc.) from the profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError) {
        console.error('Error fetching profile:', profileError)
        return null
    }

    // Get the student's CV file path from the students table.
    // We only fetch cv_path (not a URL) because viewing the CV is handled
    // server-side by the /api/cv/[studentId] route, which does all the
    // security checks and generates a short-lived download link.
    const { data: student } = await supabase
        .from('students')
        .select('cv_path')
        .eq('user_id', userId)
        .single()

    return {
        ...profile,         // spread: copies all profile fields (id, first_name, etc.)
        cv_path: student?.cv_path || null, // null means the student has no CV yet
        // Note: we do NOT return cv_url here because the browser should never
        // hold a signed storage URL directly. Use /api/cv/<userId> to view a CV.
    }
}


export async function getAllStudent() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('students')
        .select('*')

    if (error) {
        console.error('Error fetching students:', error)
        return null
    }
    return data || null
}

export async function getStudentCV(userId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('students')
        .select('cv_path')
        .eq('user_id', userId)
        .single()

    if (error) {
        console.error('Error fetching student CV:', error)
        return null
    }

    return data?.cv_path || null
}
// Update student profile (names)
export async function updateStudentProfile(userId: string, data: Partial<Profile>) {
    const supabase = createClient()

    const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)

    if (error) {
        throw error
    }
    return true
}

// Update student CV path
export async function updateStudentCV(userId: string, cvPath: string | null) {
    const supabase = createClient()

    const { error } = await supabase
        .from('students')
        .upsert({ user_id: userId, cv_path: cvPath }, { onConflict: 'user_id' })

    if (error) {
        throw error
    }
    return true
}



