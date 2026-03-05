"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getApplicationsByStudent } from "@/lib/applications";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application, Offer, Profile } from "@/lib/types";
import { Building2, Calendar } from 'lucide-react';

// Helper to get the right badge style based on the status
function getStatusBadge(status: string) {
    switch (status) {
        case "accepted":
            return <Badge className="bg-green-100 text-green-700 border-green-200">Acceptée</Badge>;
        case "pending":
            return <Badge className="bg-orange-100 text-orange-700 border-orange-200">En attente</Badge>;
        case "rejected":
            return <Badge className="bg-red-100 text-red-700 border-red-200">Refusée</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
}

// Helper to format dates nicely
function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// Extend the Application type to include the joined offer data
interface ApplicationWithOffer extends Application {
    offer?: Offer;
}

export default function CandidaturePage() {
    const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Profile | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push("/connexion");
                    return;
                }
                setUser(currentUser);

                const data = await getApplicationsByStudent(currentUser.id);
                setApplications(data);
            } catch (error) {
                console.error("Erreur lors du chargement des candidatures:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Candidatures</h1>
                <p className="text-muted-foreground mb-6">
                    Suivez l'état de vos candidatures en temps réel.
                </p>

                <Card>
                    {/* Table header */}
                    <CardHeader>
                        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            <span>Poste & Entreprise</span>
                            <span>Date d&apos;envoi</span>
                            <span>Statut</span>
                            <span>Action</span>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col gap-0 divide-y">
                        {applications.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Aucune candidature pour le moment.
                            </p>
                        ) : (
                            applications.map((application) => (
                                <div
                                    key={application.id}
                                    className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center py-4"
                                >
                                    {/* Poste & Entreprise */}
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg text-blue-500 text-lg">
                                            <Building2 />

                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {application.offer?.title || "Poste inconnu"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {application.offer?.company?.name || "Entreprise inconnue"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date d'envoi */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar />
                                        <span>{formatDate(application.applied_at)}</span>
                                    </div>

                                    {/* Statut */}
                                    <div>
                                        {getStatusBadge(application.status)}
                                    </div>

                                    {/* Action */}
                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/offer/${application.offer_id}`)}>
                                        ›
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>

                    {/* Pagination footer */}
                    <CardFooter className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Affichage de {applications.length} candidature{applications.length > 1 ? "s" : ""}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>
                                Précédent
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                Suivant
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}