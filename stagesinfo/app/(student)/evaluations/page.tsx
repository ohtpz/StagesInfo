"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getReviewedApplicationFromStudent } from "@/lib/applications";
import { getReviewForApplication } from "@/lib/reviews";
import type { Profile, ApplicationWithOffer, Review } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Building2, MessageSquare, Star } from "lucide-react";
import { formatDate } from '@/lib/format';

// Application with offer + review field
type ApplicationWithReview = ApplicationWithOffer & { review: Review | null };

export default function EvaluationPage() {
    const router = useRouter();
    const [evaluated, setEvaluated] = useState<ApplicationWithReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push("/connexion");
                    return;
                }
                setUser(currentUser);

                const data = await getReviewedApplicationFromStudent(currentUser.id);
                if (data) {
                    setEvaluated(data);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des évaluations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) return <p className="p-8">Chargement...</p>;

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Évaluations</h1>
                <p className="text-muted-foreground mb-6">Consultez les retours de vos entreprises d'accueil.</p>

                {evaluated.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">
                        Aucune évaluation disponible pour le moment.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {evaluated.map((app) => (
                            <Card key={app.id} className="shadow-sm">
                                <CardContent className="p-5 flex flex-col gap-3">

                                    {/* Top row: icon + title/company + date badge */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    {app.offer?.title || "Poste inconnu"}
                                                </p>
                                                <p className="text-md text-muted-foreground">
                                                    {app.offer?.company?.name || "Entreprise inconnue"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs shrink-0">
                                            {app.offer?.start_date ? `${formatDate(app.offer.start_date)} - ${formatDate(app.offer.end_date)}` : "—"}
                                        </Badge>
                                    </div>

                                    {app.review ? (
                                        <>
                                            {/* Star rating + score */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className="w-5 h-5"
                                                            fill={star <= app.review!.rating ? "#f59e0b" : "none"}
                                                            stroke={star <= app.review!.rating ? "#f59e0b" : "#d1d5db"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {app.review.rating}/5
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Commentaire de l'entreprise</p>
                                            </div>
                                            {/* Comment box */}
                                            <p className="text-md text-gray-600 leading-relaxed italic">
                                                {app.review.comment ? `"${app.review.comment}"` : "Aucun commentaire."}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            L'entreprise n'a pas encore soumis d'évaluation.
                                        </p>
                                    )}

                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}