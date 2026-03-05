"use client"
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOfferById, deleteOffer } from "@/lib/offers";
import type { Offer, Profile, Skill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/ui/backButton";
import { submitApplicationWithCV, hasUserApplied, createApplication } from "@/lib/applications";
import { getCurrentUser } from "@/lib/auth";
import { getStudentCV } from "@/lib/students";
import { getOfferSkills } from "@/lib/skills";

export default function OfferDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [hasCv, setHasCv] = useState<boolean>(false);
    const [motivationLetter, setMotivationLetter] = useState<string>("");
    const [offerSkills, setOfferSkills] = useState<Skill[]>([]);
    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const id = params.id as string;
                const offerData = await getOfferById(id);
                setOffer(offerData);
            } catch (error) {
                console.error("Error fetching offer:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchOffer();
        }
    }, [params.id]);

    // Fetch current user and check if already applied
    useEffect(() => {
        const checkUserAndApplication = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);
                if (user.role === 'student') {
                    const cvPath = await getStudentCV(user.id);
                    if (cvPath) {
                        setHasCv(true);
                    }
                }
                if (user && offer) {
                    const applied = await hasUserApplied(offer.id, user.id);
                    setAlreadyApplied(applied);
                }

            } catch (error) {
                console.error("Error fetching user or checking application:", error);
            }
        };

        if (offer) {
            checkUserAndApplication();
        }
    }, [offer]);


    useEffect(() => {
        const idOffer = params.id as string;
        const fetchSkills = async () => {
            try {
                const skills = await getOfferSkills(idOffer);
                setOfferSkills(skills);
            } catch (error) {
                console.error("Error fetching skills:", error);
            }
        };

        if (offer) {
            fetchSkills();
        }
    }, [offer]);
    if (loading) {
        return (
            <>
                <div className="container mx-auto sm:px-10 px-5 py-8">
                    <p>Chargement...</p>
                </div>
            </>
        );
    }

    if (!offer) {
        return (
            <>
                <div className="container mx-auto sm:px-10 px-5 py-8">
                    <h1 className="text-3xl font-bold mb-6">Offre non trouvée</h1>
                    <p className="mb-4">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
                    <Link href="/">
                        <Button>Retour aux offres</Button>
                    </Link>
                </div>
            </>
        );
    }




    const handleDelete = async () => {
        if (confirm('Vous êtes sûr de vouloir supprimer cette offre ?')) {
            const result = await deleteOffer(offer.id);
            if (result) {
                router.push('/dashboard');
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // Both should always be set by the time the button is visible,
        // but TypeScript can't know that — guard here to narrow the types.
        if (!currentUser || !offer) return;
        try {
            setSubmitting(true);
            setSubmitError(null);   
            setSubmitSuccess(false);
            const result = await createApplication(currentUser.id, offer.id, motivationLetter);
            if (result) {
                setSubmitSuccess(true);
                setAlreadyApplied(true);
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            setSubmitError("Erreur lors de l'envoi de la candidature");
        } finally {
            setSubmitting(false);
        }


    }
    return (
        <>
            <div className="container mx-auto sm:px-10 px-5 py-8 max-w-4xl">
                <BackButton />

                {/* Main Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-8">
                    {/* Title and Status */}
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{offer.title}</h1>
                        <Badge className="bg-green-100 text-green-800 py-2 px-4 text-sm font-medium">
                            Disponible
                        </Badge>

                    </div>
                    <hr />
                    {/* Entreprise Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Entreprise</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Nom:</p>
                                <p className="text-base text-gray-900">{offer.company?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Contact:</p>
                                <p className="text-base text-gray-900">
                                    {offer.company?.profile
                                        ? `${offer.company.profile.first_name} ${offer.company.profile.last_name}`
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Secteur:</p>
                                <p className="text-base text-blue-600">{offer.sector}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Localisation:</p>
                                <p className="text-base text-gray-900">{offer.location}</p>
                            </div>
                        </div>
                    </div>
                    <hr />
                    {/* Description Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {offer.description}
                        </div>
                    </div>
                    <hr />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Compétences requises</h2>
                        <div className="flex flex-wrap gap-2">
                            {/* These would come from offer.skills when available */}
                            {offerSkills.length > 0 ? offerSkills.map(skill => {
                                return (
                                    <Badge key={skill.id} variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {skill.name}
                                    </Badge>
                                )
                            }) : (<span className="text-gray-500">Aucune compétence requise</span>)}
                        </div>
                    </div>
                    <hr />
                    {/* Détails du stage Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Détails du stage</h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <p className="text-sm font-medium text-gray-600 w-32">Durée:</p>
                                <p className="text-base text-gray-900 font-bold">{offer.duration}</p>
                            </div>
                            <div className="flex gap-2">
                                <p className="text-sm font-medium text-gray-600 w-32">Date début:</p>
                                <p className="text-base text-gray-900">
                                    {new Date(offer.start_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <p className="text-sm font-medium text-gray-600 w-32">Date fin:</p>
                                <p className="text-base text-gray-900">
                                    {new Date(offer.end_date).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Candidature Section */}
                    {currentUser?.role === 'student' && offer.status === 'available' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidature</h2>

                            {!currentUser ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800">
                                        Vous devez être connecté pour postuler. <Link href="/connexion" className="text-blue-600 underline">Se connecter</Link>
                                    </p>
                                </div>
                            ) : alreadyApplied ? (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800">Vous avez déjà postulé à cette offre.</p>
                                </div>
                            ) : submitSuccess ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-800 font-medium">✓ Votre candidature a été soumise avec succès!</p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setSubmitting(true);
                                        setSubmitError(null);

                                        const formData = new FormData(e.currentTarget);
                                        const cvFile = formData.get('cv') as File;
                                        const motivationLetter = formData.get('motivation') as string;

                                        // Validate file size (5MB max)
                                        if (cvFile.size > 5 * 1024 * 1024) {
                                            setSubmitError('Le fichier CV ne doit pas dépasser 5MB');
                                            setSubmitting(false);
                                            return;
                                        }

                                        try {
                                            const result = await submitApplicationWithCV(
                                                currentUser.id,
                                                offer.id,
                                                motivationLetter,
                                                cvFile
                                            );

                                            if (result.success) {
                                                setSubmitSuccess(true);
                                                setAlreadyApplied(true);
                                            } else {
                                                setSubmitError(result.error || 'Une erreur est survenue');
                                            }
                                        } catch (error) {
                                            setSubmitError('Une erreur inattendue est survenue');
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }}
                                    className="space-y-6"
                                >
                                    {submitError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-red-800">{submitError}</p>
                                        </div>
                                    )}



                                    {/* Motivation Letter */}
                                    <div>
                                        <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Lettre de motivation <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="motivation"
                                            name="motivation"
                                            rows={6}
                                            required
                                            disabled={submitting}
                                            placeholder="Expliquez pourquoi vous souhaitez rejoindre cette entreprise..."
                                            onChange={(e) => setMotivationLetter(e.target.value)}
                                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3 disabled:opacity-50"
                                        />
                                    </div>

                                    {hasCv ?
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            onClick={handleSubmit}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg w-full md:w-auto disabled:opacity-50"
                                        >
                                            {submitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
                                        </Button> :
                                        <p>Vous devez avoir un CV pour postuler. Veuillez le déposer sur votre <Link href="/profile" className="text-blue-600 underline">profil</Link>.</p>
                                    }
                                </form>
                            )}
                        </div>
                    )}
                    {currentUser?.role === 'company' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidatures</h2>
                            <div className="space-y-3 flex justify-center gap-3">
                                <Link href={`/offer/${offer.id}/applications`}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Voir les candidatures</Button>
                                </Link>
                                <Link href={`/offer/${offer.id}/edit`}>
                                    <Button className="bg-[#FFC107] hover:bg-[#FFA000] text-white">Modifier l'offre</Button>
                                </Link>
                                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Supprimer l'offre</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
