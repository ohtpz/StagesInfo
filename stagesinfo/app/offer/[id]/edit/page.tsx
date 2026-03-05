"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Company } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { getCompanyByOwner } from "@/lib/companies";
import BackButton from "@/components/ui/backButton";
import { updateOffer, getOfferById } from "@/lib/offers";
import { useParams } from "next/navigation";
import { editOfferSkill, getAllSkills, getOfferSkills } from "@/lib/skills";
import { Skill } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function UpdateOfferPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offerSkills, setOfferSkills] = useState<Skill[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [numSkills, setNumSkills] = useState(0);
    const [selectedSkillId, setSelectedSkillId] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: "",
        dateDebut: "",
        dateFin: "",
        location: "",
        sector: "",
        status: ""
    });

    const params = useParams();
    const idParam = params.id as string;
    useEffect(() => {
        const fetchUserAndCompany = async () => {
            const userData = await getCurrentUser();
            if (!userData) {
                setError("Utilisateur non trouvé");
                setLoading(false);
                router.push('/connexion')
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
            setLoading(false);
        };

        const fetchOffer = async () => {
            const offerData = await getOfferById(idParam);
            if (!offerData) {
                setError("Aucune offre trouvée");
                setLoading(false);
                return;
            }
            setFormData({
                title: offerData.title,
                description: offerData.description,
                duration: offerData.duration,
                dateDebut: offerData.start_date,
                dateFin: offerData.end_date,
                location: offerData.location,
                sector: offerData.sector,
                status: offerData.status
            });
            setLoading(false);
        };

        const fetchSkillsFromOffer = async () => {
            setOfferSkills(await getOfferSkills(idParam));
            setAllSkills(await getAllSkills());
            setNumSkills(offerSkills.length);

        }
        fetchOffer();
        fetchUserAndCompany();
        fetchSkillsFromOffer();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate user and company data
        if (!profile || !company) {
            setError("Données utilisateur manquantes");
            setLoading(false);
            return;
        }

        // Validate dates
        if (formData.dateDebut > formData.dateFin) {
            setError("La date de début doit être antérieure à la date de fin");
            setLoading(false);
            return;
        }
        // Create the offer
        const result = await updateOffer(idParam, {
            company_id: company.id,
            title: formData.title,
            description: formData.description,
            duration: formData.duration,
            start_date: formData.dateDebut,
            end_date: formData.dateFin,
            location: formData.location,
            sector: formData.sector,
            status: formData.status
        });

        const resultSkills = await editOfferSkill(idParam, offerSkills.map(skill => skill.id));
        console.log(resultSkills);
        if (!result || !resultSkills) {
            setError("Erreur lors de la création de l'offre");
            setLoading(false);
            return;
        }

        setLoading(false);
        router.push(`/dashboard`);
    }

    const handleAddSkill = async () => {
       if(numSkills >= 5) {
            setError("Vous avez atteint le nombre maximum de compétences");
            return;
        }
        if(selectedSkillId === "") {
            setError("Veuillez sélectionner une compétence");
            return;
        }
        const skillToAdd = allSkills.find(s => s.id === parseInt(selectedSkillId)); // parse the id into an integer
        if (!skillToAdd) return;
        setOfferSkills([...offerSkills, skillToAdd]);
        setNumSkills(numSkills + 1);
        setSelectedSkillId("");
    }
    const handleRemoveSkill = async (skillId: number) => {
        setOfferSkills(offerSkills.filter((skill) => skill.id !== skillId));
        setNumSkills(numSkills - 1);
        setSelectedSkillId("");

    }    
    
    return (
        <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <BackButton />
                <div className="bg-white shadow-lg rounded-lg p-8 mt-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Modifier le stage</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Titre
                            </label>
                            <input
                                type="text"
                                id="title"
                                placeholder="Titre du stage"
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })} /*...formData, keeps the other values and only updates the title */
                                value={formData.title}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                placeholder="Description détaillée du stage"
                                rows={4}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                value={formData.description}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                Durée
                            </label>
                            <input
                                type="text"
                                id="duration"
                                placeholder="Ex: 3 mois"
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                value={formData.duration}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    id="dateDebut"
                                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                    value={formData.dateDebut}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    id="dateFin"
                                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                    value={formData.dateFin}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                Lieu
                            </label>
                            <input
                                type="text"
                                id="location"
                                placeholder="Ville, Code postal"
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                value={formData.location}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                                Secteur
                            </label>
                            <input
                                type="text"
                                id="sector"
                                placeholder="Ex: Informatique, Marketing"
                                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                value={formData.sector}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
                            <select
                                name="status"
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            >
                                <option value="available">Disponible</option>
                                <option value="filled">Pourvue</option>
                                <option value="expired">Expiré</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Skills (Max 5)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                    {offerSkills.length > 0 ? (
                                        offerSkills.map(skill => (
                                            <span key={skill.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {skill.name}
                                                <button
                                                    onClick={() => handleRemoveSkill(skill.id)}
                                                    className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                                                    >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Aucune compétence ajoutée</p>
                                    )}
                                </div>
                            </div>
                             <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedSkillId}
                                onChange={(e) => setSelectedSkillId(e.target.value)}
                            >
                                {/* Add skills here */}
                                <option value="">Sélectionner une compétence...</option>
                                {(() => {
                                const availableSkills = allSkills.filter((skill) => {
                                    const alreadyAdded = offerSkills.find((offerSkill) => offerSkill.id === skill.id)
                                    return !alreadyAdded
                                })

                                return availableSkills.map((skill) => (
                                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                                ))
                                 })()}
                            </select>
                            <Button type="button" onClick={handleAddSkill} disabled={!selectedSkillId} className="mt-2 bg-blue-600 hover:bg-blue-700">
                                Ajouter
                            </Button>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Modifier le stage
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}   