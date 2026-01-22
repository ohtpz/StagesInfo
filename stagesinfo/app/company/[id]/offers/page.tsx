"use client"
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import type { Offer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link  from "next/link"
import { getOffersByCompany } from "@/lib/offers";
import { Card, CardHeader, CardFooter, CardContent, CardTitle } from "@/components/ui/card";
export default function CompanyOffersPage() {
    const params = useParams();
    const companyId = params.id as string;
    const [offers, setOffers] = useState<Offer[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const offersData = await getOffersByCompany(companyId);
                setOffers(offersData || []);
            } catch (error) {
                console.error("Error fetching offers:", error);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, [companyId]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto sm:px-10 px-5 py-8">
                    <p>Chargement...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container mx-auto sm:px-10 px-5 py-8">
                <h1 className="text-3xl font-bold mb-6">Offres de l'entreprise</h1>
                {offers && offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {offers.map((offer) => (
                            <Card key={offer.id}>
                                <CardHeader>
                                    <CardTitle>{offer.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{offer.description}</p>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2">
                                    <Link href={`/offers/${offer.id}`} className="w-full">
                                        <Button className="">Voir les détails</Button>
                                    </Link>
                                    <Link href={`/offers/${offer.id}/edit`} className="w-full">
                                        <Button className="">Modifier l'offre</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>Aucune offre trouvée</p>
                )}
            </div>
        </>
    );
}