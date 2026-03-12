'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStudentProfiles() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching student profiles:', error)
        throw error
    }

    return data || []
}
