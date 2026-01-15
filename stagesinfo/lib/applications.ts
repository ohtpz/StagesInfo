import { supabase } from './supabase'
import { Application } from './types'

// Get all applications for a student
export async function getApplicationsByStudent(studentId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      offer:offers(*),
      student:students(*)
    `)
    .eq('student_id', studentId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw error
  }

  return data || []
}

// Get all applications for an offer
export async function getApplicationsByOffer(offerId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      offer:offers(*),
      student:students(*)
    `)
    .eq('offer_id', offerId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw error
  }

  return data || []
}

// Create a new application
export async function createApplication(
  studentId: string,
  offerId: string,
  motivationLetter: string
): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .insert([
      {
        student_id: studentId,
        offer_id: offerId,
        motivation_letter: motivationLetter,
        status: 'pending', // Adjust based on your enum values
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating application:', error)
    return null
  }

  return data
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string,
  status: string
): Promise<boolean> {
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) {
    console.error('Error updating application status:', error)
    return false
  }

  return true
}
