"use client"
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Application, Offer } from "@/lib/types";
import { getOfferById } from "@/lib/offers";
import { getApplicationsByOffer, updateApplicationStatus } from "@/lib/applications";
import BackButton from "@/components/ui/backButton";
import { X, Mail, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Maps each status value to a Tailwind color scheme for the badge
function statusBadgeClass(status: string) {
    switch (status) {
        case "pending": return "bg-orange-100 text-orange-700 border-orange-200";
        case "accepted": return "bg-green-100  text-green-700  border-green-200";
        case "rejected": return "bg-red-100    text-red-700    border-red-200";
        default: return "bg-gray-100   text-gray-700   border-gray-200";
    }
}

export default function ApplicationsPage() {
    const params = useParams();
    const id = params.id as string;
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offer, setOffer] = useState<Offer | null>(null);

    // Stores the motivation letter that is currently being viewed.
    // null = no letter open, a string = show the letter in the overlay.
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

    useEffect(() => {
        const fetchOffer = async () => {
            const offerData = await getOfferById(id);
            if (!offerData) {
                setError("Aucune offre trouvée");
                setLoading(false);
                return;
            }
            setOffer(offerData);
            setLoading(false);
        };
        const fetchApplications = async () => {
            try {
                const applicationsData = await getApplicationsByOffer(id)
                setApplications(applicationsData)
            } catch (err) {
                console.error('Error in fetchApplications:', err)
            }
        }
        fetchOffer();
        fetchApplications();
    }, []);

    // Called when the company changes an applicant's status via the dropdown
    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        const success = await updateApplicationStatus(applicationId, newStatus);
        if (success) {
            // Update the local state so the badge re-renders immediately
            setApplications((prev) =>
                prev.map((app) =>
                    app.id === applicationId ? { ...app, status: newStatus as any } : app
                )
            );
        }
    };

    return (
        <>
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
                        {offer?.title}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {applications.length} candidature{applications.length !== 1 ? "s" : ""}
                    </p>

                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3"
                            >
                                {/* Top row: name + badge */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar circle with initials */}
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                                            {(application as any).profile?.first_name?.[0]}
                                            {(application as any).profile?.last_name?.[0]}
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            {(application as any).profile?.first_name}{" "}
                                            {(application as any).profile?.last_name}
                                        </span>
                                    </div>

                                    <Badge className={statusBadgeClass(application.status) + " px-3 py-1"}>
                                        {application.status}
                                    </Badge>
                                </div>

                                {/* Bottom row: status dropdown + letter button */}
                                <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                                    {/* Status dropdown — lets the company accept or reject */}
                                    <select
                                        value={application.status}
                                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="pending">En attente</option>
                                        <option value="accepted">Accepter</option>
                                        <option value="rejected">Rejeter</option>
                                    </select>

                                    {/* Opens the motivation letter modal */}
                                    <button
                                        onClick={() => setSelectedLetter(application.motivation_letter)}
                                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        <Mail size={14} />
                                        Voir la lettre de motivation
                                    </button>

                                    {/* Hits /api/cv/[studentId] which validates access
                                        and redirects to a short-lived signed PDF URL */}
                                    <a
                                        href={`/api/cv/${application.student_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                                    >
                                        <FileText size={14} />
                                        Voir le CV
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Motivation letter overlay.
                Only shown when selectedLetter is not null (i.e. a button was clicked).
                Clicking the grey backdrop or the ✕ button closes it. */}
            {selectedLetter !== null && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedLetter(null)}
                >
                    {/* stopPropagation prevents the click from bubbling up to the backdrop */}
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-lg font-semibold">Lettre de motivation</h2>
                            <button
                                onClick={() => setSelectedLetter(null)}
                                className="text-gray-400 hover:text-gray-700 transition-colors rounded-md p-1 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* overflow-y-auto = adds a scrollbar if the letter is very long */}
                        <p className="p-6 overflow-y-auto whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                            {selectedLetter}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}