import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
// AI generated Code, server code

// This API route handles uploading (or replacing) a student's CV.
// URL: POST /api/cv/upload
//
// How it works:
//   1. Check that the visitor is logged in
//   2. Make sure they are a student (companies cannot upload CVs)
//   3. Validate the file (PDF only, max 5MB)
//   4. Upload the file to storage at a fixed path (overwrites the old one)
//   5. Save the file path in the student's database row

export async function POST(request: NextRequest) {
    // Step 1: Who is making this request?
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // If no session found, they are not logged in → send 401
    if (authError || !user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Step 2: Only students can upload a CV.
    // Read the user's role from the profiles table.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile || profile.role !== 'student') {
        return NextResponse.json({ error: 'Réservé aux étudiants' }, { status: 403 })
    }

    // Step 3a: Get the file from the form submission
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Step 3b: The file must be a PDF — check the MIME type
    // Note: file.type comes from the browser, which just looks at the file extension.
    // Someone could rename "document.txt" to "document.pdf" and this check alone would pass. That's why we also check the magic bytes below.
    if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 422 })
    }

    // Step 3c: Read the file into memory and check its magic bytes.
    // Every real PDF file starts with the 4 characters "%PDF" in its raw bytes.
    // This is called a "magic bytes" check — we look at the actual file content, not just the name or extension. It catches renamed fake PDFs.
    const fileBuffer = await file.arrayBuffer() // raw data file
    const firstFourBytes = new Uint8Array(fileBuffer).slice(0, 4)
    const magicString = String.fromCharCode(...firstFourBytes)

    if (magicString !== '%PDF') {
        return NextResponse.json({ error: 'Le fichier n\'est pas un vrai PDF' }, { status: 422 })
    }

    // Step 3d: The file must be under 5MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 5MB' }, { status: 422 })
    }

    
    // Step 4: Upload the file to Supabase Storage
    //
    // The path is always: cvs/<user-id>/cv.pdf
    // This is a "stable" path — it never changes for the same student.
    //
    // WHY stable? Because upsert: true overwrites the existing file.
    // This means:
    //   - No old files pile up in storage (zero "orphan" files)
    //   - The database path never needs to change either
    const cvPath = `${user.id}/cv.pdf`

    // We use the service client here because we want uploads to always work
    // from the server, regardless of storage security rules.
    const serviceClient = createServiceClient()
    const { error: uploadError } = await serviceClient
        .storage
        .from('cvs')
        .upload(cvPath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true, // replaces the old file if it already exists
        })

    if (uploadError) {
        console.error('[CV Upload] Storage error:', uploadError)
        return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 })
    }

    // Step 5: Save (or update) the file path in the student's database row.
    //
    // We use "upsert" instead of "update" so that if the student's row
    // doesn't exist yet, it gets created automatically.
    // onConflict: 'user_id' means: "if a row with this user_id already
    // exists, update it instead of inserting a duplicate".
    const { error: dbError } = await supabase
        .from('students')
        .upsert(
            { user_id: user.id, cv_path: cvPath },
            { onConflict: 'user_id' }
        )

    if (dbError) {
        console.error('[CV Upload] Database error:', dbError)
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 })
    }

    // All done! Tell the browser it worked.
    return NextResponse.json({ success: true, cv_path: cvPath })
}
