import React from "react";
import { Navbar } from "@/components/layout/navbar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { getOffers } from "@/lib/offers";

const Home = async () => {
  const offers = await getOffers();

  return (
    <>
      <Navbar />
      <div className="container mx-auto sm:px-10 px-5 py-8">
        <h1 className="text-3xl font-bold mb-6">Stages Disponible</h1>
        
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.length === 0 ? (
            <p>Aucun stage disponible pour le moment.</p>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id}>
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
                  <Button className="bg-blue hover:bg-blue-600 w-full text-md ">
                    Voir les détails
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
