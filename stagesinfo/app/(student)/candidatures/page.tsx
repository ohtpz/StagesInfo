"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getApplicationsByStudent, deleteApplication } from "@/lib/applications";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Profile, ApplicationWithOffer } from "@/lib/types";
import { Building2, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";



export default function CandidaturePage() {
    const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [acceptedCount, setAcceptedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);
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
                if (data.length > 0) {
                    setPendingCount(data.filter((application) => application.status === "pending").length);
                    setAcceptedCount(data.filter((application) => application.status === "accepted").length);
                    setRejectedCount(data.filter((application) => application.status === "rejected").length);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des candidatures:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    async function handleRetirerApplication(applicationId: string) {
        console.log("Retrait de la candidature:", applicationId);
        try {
            const success = await deleteApplication(applicationId);
            console.log(success)
            if (success) {
                setApplications(prev => prev.filter(app => app.id !== applicationId));
                setPendingCount(prev => Math.max(0, prev - 1));
            } else {
                console.error("Erreur lors de la suppression de la candidature.");
            }
        } catch (error) {
            console.error("Erreur inattendue:", error);
        }
    }
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="flex flex-col items-center justify-center p-6 shadow-sm">
                        <CardContent className="p-0 text-center space-y-1">
                            <p className="text-3xl font-bold">{pendingCount}</p>
                            <p className="text-sm ">Attente</p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 shadow-sm">
                        <CardContent className="p-0 text-center space-y-1">
                            <p className="text-3xl text-green-600 font-bold">{acceptedCount}</p>
                            <p className="text-sm ">Accepté</p>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 shadow-sm">
                        <CardContent className="p-0 text-center space-y-1">
                            <p className="text-3xl text-red-600 font-bold">{rejectedCount}</p>
                            <p className="text-sm ">Refusé</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    {/* Table header */}
                    <CardHeader>
                        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            <span>Poste & Entreprise</span>
                            <span>Date d'envoi</span>
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
                                        <StatusBadge status={application.status} />
                                    </div>

                                    {/* Action */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                className="bg-red-500 hover:bg-red-600 px-2.5"
                                                disabled={application.status !== "pending"}
                                            >
                                                Retirer
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Retirer la candidature ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. Votre candidature sera définitivement supprimée et l'entreprise n'y aura plus accès.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleRetirerApplication(application.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                >
                                                    Confirmer
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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