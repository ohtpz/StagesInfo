"use client"
import { useState, useEffect } from "react";
import type { Profile, Company } from "@/lib/types";
import { getCompaniesByOwner } from "@/lib/companies";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
interface CompanyDashboardProps {
    user: Profile;
}

export function CompanyDashboard({ user }: CompanyDashboardProps) {
    const [companies, setCompanies] = useState<Company[] | null>(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const companiesData = await getCompaniesByOwner(user.id);
                setCompanies(companiesData || []);
            } catch (error) {
                console.error("Error fetching companies:", error);
                setCompanies([]);
            }
        };
        fetchCompanies();
    }, [user.id]);

    return (
        <>
        <div className="flex justify-between">
            <h1 className="text-3xl font-bold mb-6">Dashboard Entreprise</h1>
            <Button className="bg-blue hover:bg-blue-600"> <Plus /></Button>
        </div>

            <div className="w-full">
                {companies && companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {companies.map((company) => (
                            <Card key={company.id}>
                                <CardHeader>
                                    <CardTitle>{company.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>📍 Adresse : {company.address}</p>
                                    <p>🏢 Secteur : {company.sector}</p>
                                    <p>📞 Contact : {company.contact_person}</p>
                                    <p>📧 Email : {company.contact_email}</p>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3">
                                    <Link href={`/company/${company.id}`} className="w-full">
                                        <Button className="bg-blue hover:bg-blue-600 w-full text-md">
                                            Modifier
                                        </Button>
                                    </Link>
                                    <Link href={`/company/${company.id}/offers`} className="w-full">
                                        <Button className="bg-blue hover:bg-blue-600 w-full text-md">
                                            Voir les offres
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>Aucune entreprise trouvée</p>
                )}
            </div>
        </>

    );
}

