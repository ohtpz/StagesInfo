import { createClient } from './supabase/client'
import { Application, ApplicationWithOffer, Review } from './types'

// Get all applications for a student
export async function getApplicationsByStudent(studentId: string): Promise<ApplicationWithOffer[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      offer:offers(
        *,
        company:companies!company_id(*)
      ),
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

export async function getReviewedApplicationFromStudent(studentId: string): Promise<(ApplicationWithOffer & { review: Review | null })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      offer:offers(
        *,
        company:companies!company_id(*)
      ),
      review:reviews(*)
    `)
    .eq('student_id', studentId)
    .eq('status', 'accepted')
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw error
  }

  // Supabase returns review as an array (one-to-many), so we take the first item
  return (data || []).map(app => ({
    ...app,
    review: Array.isArray(app.review) ? (app.review[0] ?? null) : app.review,
  }))
}

// Get all applications for an offer, with the applicant's name attached.
// We can't join profiles directly (no FK in the schema), so we:
//   1. Fetch all applications for this offer
//   2. Fetch the profiles for all those student_ids in one extra query
//   3. Manually attach each profile to its application
export async function getApplicationsByOffer(offerId: string): Promise<Application[]> {
  const supabase = createClient()

  // Step 1: get the applications (with the offer data joined)
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*, offer:offers(*)')
    .eq('offer_id', offerId)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    throw error
  }

  if (!applications || applications.length === 0) {
    return []
  }

  // Step 2: collect all unique student IDs, then fetch their profiles in one query
  const studentIds = applications.map((app) => app.student_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', studentIds)

  // Step 3: build a lookup map { profileId → profile } for fast access
  const profileMap: Record<string, { first_name: string; last_name: string }> = {}
  for (const profile of profiles || []) {
    profileMap[profile.id] = profile
  }

  // Step 4: attach the matching profile to each application
  const applicationsWithProfiles = applications.map((app) => ({
    ...app,
    profile: profileMap[app.student_id] || null,
  }))

  return applicationsWithProfiles
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
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()

  if (error || !data || data.length === 0) {
    console.error('Error updating application status or no rows affected:', error)
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

export async function deleteApplication(applicationId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .select();

  if (error || !data || data.length === 0) {
    console.error('Error deleting application or no rows affected:', error);
    return false;
  }

  return true;
}