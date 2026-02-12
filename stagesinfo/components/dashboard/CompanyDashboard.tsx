"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Company, Offer } from "@/lib/types";
import { getCompanyByOwner } from "@/lib/companies";
import { deleteCompanyAndUser } from "@/app/actions/deleteAccount";
import { getOffersByCompany } from "@/lib/offers";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Building2, MapPin, Briefcase, User, Mail } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
interface CompanyDashboardProps {
    user: Profile;
}

export function CompanyDashboard({ user }: CompanyDashboardProps) {
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [userEmail, setUserEmail] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch company
                const companyData = await getCompanyByOwner(user.id);
                setCompany(companyData);

                // Fetch offers for this company
                if (companyData) {
                    const offersData = await getOffersByCompany(companyData.id);
                    setOffers(offersData || []);
                }

                // Fetch user email from Supabase auth
                const supabase = createClient();
                const { data: { user: authUser } } = await supabase.auth.getUser();
                setUserEmail(authUser?.email ?? "");
            } catch (error) {
                console.error("Error fetching data:", error);
                setCompany(null);
                setOffers([]);
                setUserEmail("");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    const handleDeleteConfirmed = async () => {
        if (!company) return;

        try {
            setLoading(true);
            setError(null);

            // Call server action which uses admin client (bypasses RLS)
            await deleteCompanyAndUser(company.id);

            // Success - redirect to login page
            console.log("Company deleted successfully");
            router.push('/connexion');
            setLoading(false);

        } catch (error) {
            // Display error message to user
            const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
            setError(errorMessage);
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-lg">Chargement...</p>
            </div>
        );
    }

    if (!company) { // juste pour éviter les erreurs de typescript
        return;
    }


    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Dashboard Entreprise</h1>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Company Information Card */}
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Building2 className="h-6 w-6" />
                            {company.name}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Link href={`/company/${company.id}/edit`}>
                                <Button className="bg-blue-600 hover:bg-blue-700 ">
                                    Modifier
                                </Button>
                            </Link>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="bg-red-600 hover:bg-red-700">
                                        Supprimer
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible. Cela supprimera définitivement votre entreprise et toutes les offres associées.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 hover:bg-red-700">
                                            Supprimer
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Info */}
                        <div>
                            <p className="font-semibold text-lg mb-3">Informations Entreprise</p>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Adresse:</span> {company.address}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Secteur:</span> {company.sector}
                                </p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <p className="font-semibold text-lg mb-3">Contact</p>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Personne Contact:</span> {user.first_name} {user.last_name}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Email:</span> {userEmail || "Non disponible"}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Offers Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Mes offres</h2>
                <Link href={`/offer/create`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Créer une offre
                    </Button>
                </Link>
            </div>

            {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer) => (
                        <Card key={offer.id}>
                            <CardHeader>
                                <CardTitle>{offer.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-2">📍 {offer.location}</p>
                                <p className="text-sm text-gray-600 mb-2">🏢 {offer.sector}</p>
                                <p className="text-sm text-gray-600 mb-2">📅 {offer.duration}</p>
                                <p className="text-sm">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${offer.status === 'available' ? 'bg-green-100 text-green-800' :
                                        offer.status === 'filled' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {offer.status === 'available' ? 'Disponible' :
                                            offer.status === 'filled' ? 'Pourvue' :
                                                'Expirée'}
                                    </span>
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/offer/${offer.id}`} className="w-full">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                                        Voir les détails
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-lg text-gray-600 mb-4">Vous n'avez pas encore créé d'offres</p>
                        <p className="text-sm text-gray-500">Cliquez sur le bouton "Créer une Offre" pour commencer</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
