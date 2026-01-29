"use client"
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOffersFiltered } from "@/lib/offers";
import type { Offer } from "@/lib/types";

export function OffersList() {
    const OFFERS_PER_PAGE = 10;
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filter states
    const [sector, setSector] = useState("all");
    const [location, setLocation] = useState("");
    const [search, setSearch] = useState("");

    // Debounced filter states
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [debouncedLocation, setDebouncedLocation] = useState("");

    // Debounce search and location inputs (500ms delay)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedLocation(location);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [location]);

    // Fetch offers - memoized with useCallback to avoid stale closures
    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const { data, count } = await getOffersFiltered({
                title: debouncedSearch,
                location: debouncedLocation,
                sector: sector,
                page: currentPage,
                limit: OFFERS_PER_PAGE,
            });
            setOffers(data);
            setTotalCount(count);
            // Calculate total pages based on server count
            const pages = Math.ceil(count / OFFERS_PER_PAGE);
            setTotalPages(pages || 1);
        } catch (error) {
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, debouncedLocation, sector, currentPage]);

    // Fetch offers when filters or page change
    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    // Reset to page 1 when filters change (not page)
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, debouncedLocation, sector]);

    return (
        <div className="container mx-auto sm:px-10 px-5 py-8">
            <h1 className="text-3xl font-bold mb-6">Stages Disponible</h1>

            {/* Filters Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Filtres</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Input */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium mb-1">
                            Recherche
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Titre"
                            className="w-full px-3 py-2 border rounded-md"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Sector Filter */}
                    <div>
                        <label htmlFor="sector" className="block text-sm font-medium mb-1">
                            Secteur
                        </label>
                        <select
                            id="sector"
                            className="w-full px-3 py-2 border rounded-md"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                        >
                            <option value="all">Tous les secteurs</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Data / IA">Data</option>
                            <option value="Support">Support</option>
                            <option value="Design">Design</option>
                        </select>
                    </div>

                    {/* Location Filter */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-1">
                            Lieu
                        </label>
                        <input
                            id="location"
                            type="text"
                            placeholder="Ville..."
                            className="w-full px-3 py-2 border rounded-md"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Offers Grid */}
            {loading ? (
                // Loading skeleton
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index} className="relative">
                            {/* Badge Skeleton */}
                            <div className="absolute top-4 right-4 h-6 w-24 bg-gray-200 rounded-full animate-pulse" />

                            <CardHeader>
                                {/* Title Skeleton */}
                                <div className="h-7 w-3/4 bg-gray-200 rounded-md mb-2 animate-pulse" />
                                {/* Description Skeleton */}
                                <div className="h-5 w-1/2 bg-gray-200 rounded-md animate-pulse" />
                            </CardHeader>

                            <CardContent>
                                {/* Description lines */}
                                <div className="space-y-2 mb-4">
                                    <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
                                </div>

                                {/* Details */}
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-2/3 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
                                </div>
                            </CardContent>

                            <CardFooter>
                                {/* Button Skeleton */}
                                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                            </CardFooter>
                        </Card>
                    ))}
                </main>
            ) : (
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {offers.length === 0 ? (
                        <p>Aucun stage disponible pour le moment.</p>
                    ) : (
                        offers.map((offer) => {
                            // Determine badge styling and text based on the offer status
                            const getBadgeConfig = () => {
                                switch (offer.status) {
                                    case 'available':
                                        return {
                                            className: 'bg-green-100 text-green-800',
                                            text: 'Disponible'
                                        };
                                    case 'expired':
                                        return {
                                            className: 'bg-orange-100 text-orange-800',
                                            text: 'Expiré'
                                        };
                                    case 'filled':
                                        return {
                                            className: 'bg-gray-100 text-gray-800',
                                            text: 'Complet'
                                        };
                                    default:
                                        return {
                                            className: 'bg-red-100 text-red-800',
                                            text: 'Non disponible'
                                        };
                                }
                            };

                            const badgeConfig = getBadgeConfig();

                            return (
                                <Card key={offer.id} className="relative">
                                    <Badge className={`absolute top-4 right-4 ${badgeConfig.className}`}>
                                        {badgeConfig.text}
                                    </Badge>
                                    <CardHeader>
                                        <CardTitle>{offer.title}</CardTitle>
                                        <CardDescription>{offer.company?.name || 'Entreprise inconnue'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="line-clamp-3">{offer.description}</p>
                                        <div className="mt-4 space-y-1 text-sm text-gray-600">
                                            <p>📍 Lieu : {offer.location}</p>
                                            <p>🏢 Secteur : {offer.sector}</p>
                                            <p>⏱️ Durée : {offer.duration}</p>
                                            <p>📅 Dates : {new Date(offer.start_date).toLocaleDateString('fr-FR')} au {new Date(offer.end_date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Link href={`/offer/${offer.id}`} className="w-full">
                                            <Button className="bg-blue hover:bg-blue-600 w-full text-md">
                                                Voir les détails
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            );
                        })
                    )}
                </main>
            )}

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                >
                    Précédent
                </Button>

                <span className="px-4 py-2">
                    Page {currentPage} sur {totalPages}
                </span>

                <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                >
                    Suivant
                </Button>
            </div>
        </div>
    );
}
