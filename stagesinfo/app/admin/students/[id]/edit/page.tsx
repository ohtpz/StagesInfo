'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import BackButton from '@/components/ui/backButton'

interface EditStudentPageProps {
    params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
    const { id } = await params
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', id)
        .single()

    if (!profile) redirect('/dashboard')

    async function updateProfile(formData: FormData) {
        'use server'
        const supabaseAdmin = createServiceClient()
        const first_name = formData.get('first_name') as string
        const last_name = formData.get('last_name') as string

        await supabaseAdmin
            .from('profiles')
            .update({ first_name, last_name })
            .eq('id', id)

        redirect('/dashboard')
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-10">
            <BackButton />
            <h1 className="text-2xl font-bold mt-4 mb-6">Modifier l&apos;étudiant</h1>
            <form action={updateProfile} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                        name="first_name"
                        defaultValue={profile.first_name ?? ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                        name="last_name"
                        defaultValue={profile.last_name ?? ''}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
                >
                    Enregistrer
                </button>
            </form>
        </div>
    )
}
