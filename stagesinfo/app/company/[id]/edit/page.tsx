"use client"
import { useParams } from "next/navigation";
import BackButton from "@/components/ui/backButton";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByOwner } from "@/lib/companies";
import { updateCompany } from "@/lib/companies";
import type { Profile, Company } from "@/lib/types";
import { useRouter } from "next/navigation";
export default function EditCompany() {
    const params = useParams();
    const idParam = params.id as string;
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        sector: "",
    });
    useEffect(() => {
        const fetchUserAndCompany = async () => {
            const userData = await getCurrentUser();
            if (!userData) {
                setError("Utilisateur non trouvé");
                setLoading(false);
                return;
            }
            setProfile(userData);
            const companyData = await getCompanyByOwner(userData.id);
            if (!companyData) {
                setError("Aucune entreprise trouvée");
                setLoading(false);
                return;
            }
            setCompany(companyData);
            setFormData({
                name: companyData.name,
                address: companyData.address,
                sector: companyData.sector,
            });
            setLoading(false);
        };
        fetchUserAndCompany();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (!profile) {
            setError("Utilisateur non trouvé");
            setLoading(false);
            return;
        }

        
        const updatedCompany = await updateCompany(idParam, {
            owner_id: profile.id,
            name: formData.name,
            address: formData.address,
            sector: formData.sector,
        });
        setLoading(false);
        if (updatedCompany) {
            router.push(`/dashboard`);
        }
        else {
            setError("Erreur lors de la mise à jour de l'entreprise");
            setLoading(false);
            return;
        }
    }

    return (
        <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <BackButton />
                <div className="bg-white shadow-lg rounded-lg p-8 mt-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier l'entreprise</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nom de l'entreprise
                            </label>
                            <input
                                type="text"
                                id="name"
                                placeholder="Nom de l'entreprise"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} /*...formData, keeps the other values and only updates the name */
                                value={formData.name}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse
                            </label>
                            <input
                                id="address"
                                type="text"
                                placeholder="Adresse de l'entreprise"
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                value={formData.address}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                                Secteur
                            </label>
                            <input
                                type="text"
                                id="sector"
                                placeholder="Secteur de l'entreprise"
                                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                value={formData.sector}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>


                        <button type="submit"
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Modifier l'entreprise
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}