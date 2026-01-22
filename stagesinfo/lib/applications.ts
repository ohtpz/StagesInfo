import { createClient } from './supabase/client'
import { Application } from './types'

// Get all applications for a student
export async function getApplicationsByStudent(studentId: string): Promise<Application[]> {
  const supabase = createClient()
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
  const supabase = createClient()
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
  const supabase = createClient()
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
  const supabase = createClient()
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

// Submit application with CV upload
export async function submitApplicationWithCV(
  studentId: string,
  offerId: string,
  motivationLetter: string,
  cvFile: File
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    // 1. Upload CV to Supabase Storage
    const fileExt = cvFile.name.split('.').pop();
    const fileName = `${studentId}_${Date.now()}.${fileExt}`;
    const filePath = `${studentId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, cvFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading CV:', uploadError);
      return { success: false, error: 'Erreur lors du téléchargement du CV' };
    }

    // 2. Create application record in database
    const { data: applicationData, error: applicationError } = await supabase
      .from('applications')
      .insert({
        student_id: studentId,
        offer_id: offerId,
        motivation_letter: motivationLetter,
        status: 'pending',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (applicationError) {
      // If application creation fails, delete the uploaded CV
      await supabase.storage.from('cvs').remove([filePath]);
      console.error('Error creating application:', applicationError);
      return { success: false, error: 'Erreur lors de la soumission de la candidature' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Une erreur inattendue s\'est produite' };
  }
}

// Check if user has already applied to this offer
export async function hasUserApplied(offerId: string, studentId: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('offer_id', offerId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Error checking application:', error);
    return false;
  }

  return !!data;
}
