"use client"
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
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

const Home = () => {
  const OFFERS_PER_PAGE = 10;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [sector, setSector] = useState("all");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");

  // Fetch offers - memoized with useCallback to avoid stale closures
  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getOffersFiltered({
        title: search,
        location: location,
        sector: sector,
      });
      setOffers(result);
      // Calculate total pages
      const pages = Math.ceil(result.length / OFFERS_PER_PAGE); // Number of pages / 10
      setTotalPages(pages || 1);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  }, [search, location, sector]);

  // Reset to page 1 and fetch offers when filters change 
  useEffect(() => {
    setCurrentPage(1);
    fetchOffers();
  }, [fetchOffers]);

  // Calculate the offers to display for the current page
  const startIndex = (currentPage - 1) * OFFERS_PER_PAGE;
  const endIndex = startIndex + OFFERS_PER_PAGE;
  const paginatedOffers = offers.slice(startIndex, endIndex);
  return (
    <>
      <Navbar />
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
          <p>Chargement...</p>
        ) : (
          <>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
              {paginatedOffers.length === 0 ? (
                <p>Aucun stage disponible pour le moment.</p>
              ) : (
                paginatedOffers.map((offer) => {
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
                        <Link href={`/offers/${offer.id}`} className="w-full">
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
          </>
        )}
      </div>
    </>
  );
};

export default Home;
