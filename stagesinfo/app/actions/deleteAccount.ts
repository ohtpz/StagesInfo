'use server'

import { createClient } from '@supabase/supabase-js'

/**
 * Server Action to completely delete a company and all associated data
 * This runs on the server with admin privileges to bypass RLS
 */
export async function deleteCompanyAndUser(companyId: string) {
    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    console.log('🗑️ Starting server-side deletion for company:', companyId)

    // 1. Check for active offers
    const { data: offers, error: offersError } = await supabaseAdmin
        .from('offers')
        .select('id, status')
        .eq('company_id', companyId)

    if (offersError) {
        throw new Error('Impossible de vérifier les offres')
    }

    if (offers && offers.length > 0) {
        const activeOffers = offers.filter(offer => offer.status === 'available')

        if (activeOffers.length > 0) {
            throw new Error(`Impossible de supprimer l'entreprise. Vous avez ${activeOffers.length} offre(s) active(s). Veuillez d'abord les expirer ou les marquer comme pourvues.`)
        }

        // 2. Check for applications on offers
        const offerIds = offers.map(offer => offer.id)
        const { data: applications, error: appsError } = await supabaseAdmin
            .from('applications')
            .select('id')
            .in('offer_id', offerIds)

        if (appsError) {
            throw new Error('Impossible de vérifier les candidatures')
        }

        if (applications && applications.length > 0) {
            throw new Error(`Impossible de supprimer l'entreprise. Il existe ${applications.length} candidature(s) associée(s) à vos offres.`)
        }

        // 3. Delete offers (all expired/filled with no applications)
        const { error: deleteOffersError } = await supabaseAdmin
            .from('offers')
            .delete()
            .eq('company_id', companyId)

        if (deleteOffersError) {
            throw new Error('Erreur lors de la suppression des offres')
        }
        console.log('✅ Offers deleted')
    }

    // 4. Get company owner_id
    const { data: company, error: fetchError } = await supabaseAdmin
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .single()

    if (fetchError || !company) {
        throw new Error('Entreprise introuvable')
    }

    const ownerId = company.owner_id

    // 5. Delete the company
    const { error: companyError } = await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', companyId)

    if (companyError) {
        throw new Error('Erreur lors de la suppression de l\'entreprise')
    }
    console.log('✅ Company deleted')

    // 6. Delete the profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', ownerId)

    if (profileError) {
        throw new Error('Erreur lors de la suppression du profil')
    }
    console.log('✅ Profile deleted')

    // 7. Try to delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(ownerId)

    if (authError) {
        console.error('⚠️ Could not delete auth user:', authError.message)
    } else {
        console.log('✅ Auth user deleted')
    }
}

