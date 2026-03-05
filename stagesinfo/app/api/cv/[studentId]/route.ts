import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// This API route handles viewing a student's CV.
// URL: GET /api/cv/[studentId]
//
// How it works:
//   1. Check that the visitor is logged in
//   2. Look up their role (student, company, or admin)
//   3. Decide if they are allowed to see this CV
//   4. If yes, generate a short-lived download link (10 seconds)
//   5. Redirect the browser to that link so the PDF opens

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
    // Get the student ID from the URL, e.g. /api/cv/abc-123 → studentId = "abc-123"
    const { studentId } = await params

    // Step 1: Who is making this request?
    // createClient() reads the user's session from their browser cookie.
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // If no session found, they are not logged in → send 401
    if (authError || !user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Step 2: What is this user's role?
    // We store roles in the "profiles" table alongside the user's name.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 })
    }

    const role = profile.role // "student", "company", or "admin"

    // Step 3: Is this person allowed to see the CV?
    let authorized = false

    if (role === 'admin') {
        // Admins can see any CV
        authorized = true

    } else if (role === 'student') {
        // A student can only see their OWN CV.
        // We check that the student ID in the URL matches their own user ID.
        authorized = user.id === studentId

    } else if (role === 'company') {
        // A company can only see a student's CV if that student has applied
        // to one of the company's offers.
        //
        // We call a pre-written SQL function that checks this relationship:
        //   applications → offers → companies → owner_id = current user
        //
        // It returns true if the link exists, false otherwise.
        const { data: hasAccess, error: rpcError } = await supabase.rpc( // RPC = remote procedure call, a sql function that executes on the server
            'check_company_cv_access',
            {
                p_student_id: studentId,
                p_company_owner_id: user.id,
            }
        )

        if (rpcError) {
            console.error('[CV View] Error checking company access:', rpcError)
            return NextResponse.json({ error: "Erreur de vérification d'accès" }, { status: 500 })
        }

        authorized = hasAccess === true
    }

    // If none of the above rules matched → deny access
    if (!authorized) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Step 4: Find the file path stored in the database for this student.
    // We initialise serviceClient here so it is available for both:
    //   - reading the students table (blocked by RLS for company users)
    //   - generating the signed URL below
    const serviceClient = createServiceClient()
    const { data: student, error: studentError } = await serviceClient
        .from('students')
        .select('cv_path')
        .eq('user_id', studentId)
        .single()

    // If there is no cv_path in the database, the student has no CV yet
    if (studentError || !student?.cv_path) {
        return NextResponse.json({ error: 'Aucun CV trouvé' }, { status: 404 })
    }

    // Step 5: Generate a short-lived download link (10 seconds)
    //
    // WHY use the service client here?
    // The regular client only lets you generate links for YOUR OWN files.
    // When a company or admin accesses a student's file, we need the service
    // client (the "super admin") to generate the link, because it has no
    // restriction on which files it can access.
    //
    // 10 seconds is enough time to open the PDF in a new tab.
    // After that, the link stops working, so it cannot be shared or bookmarked.
    const { data: signed, error: signedError } = await serviceClient
        .storage
        .from('cvs')
        .createSignedUrl(student.cv_path, 10) // expires in 10 seconds

    if (signedError || !signed?.signedUrl) {
        console.error('[CV View] Failed to generate signed URL:', signedError)
        return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 })
    }

    // Step 6: Redirect the browser to the PDF
    // The user's browser follows the redirect and opens the PDF directly.
    return NextResponse.redirect(signed.signedUrl)
}
