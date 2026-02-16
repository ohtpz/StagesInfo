"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { ChangeEvent, useState } from "react";

export default function ProfilePage() {
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError(null);
        
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Le fichier ne doit pas dépasser 5MB.');
                setCvFile(null);
                e.target.value = '';
                return;
            }

            // Validate actual file content by reading magic bytes
            // A real PDF always starts with "%PDF" (hex: 25 50 44 46)
            const header = await file.slice(0, 4).text();
            if (header !== '%PDF') {
                setError('Le fichier sélectionné n\'est pas un vrai PDF.');
                setCvFile(null);
                e.target.value = '';
                return;
            }
            
            setCvFile(file);
        }
    };
    // TODO : Fix policies, where only students can upload cv, students can retrieve, update and delete their cv
    // on the load of this page, the user should be able to see their cv if they have one
    // if the user has a cv, the upload button should be disabled
    const uploadCV = async (file: File): Promise<string | null> => {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error } = await supabase.storage.from('cvs').upload(filePath, file);
        if(error) { 
            console.error('Error uploading CV:', error);
            return null;
        }
        const {data} = await supabase.storage.from('cvs').getPublicUrl(filePath);
        return data.publicUrl;
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!cvFile) {
            setError('Veuillez sélectionner un fichier CV.');
            return;
        }
        
        let cvUrl: string | null = null;
        setSubmitting(true);
        
        try {
            cvUrl = await uploadCV(cvFile);
            if (cvUrl) {
                console.log('CV uploaded successfully:', cvUrl);
                // TODO: Save cvUrl to students.cv_path in database
            } else {
                setError('Échec du téléchargement du CV. Veuillez réessayer.');
            }
        } catch (err) {
            setError('Une erreur inattendue s\'est produite.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h1>Profile</h1>
            <form action="" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}
                <div>
                    <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-2">
                        CV (PDF, DOC, DOCX) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="file"
                        id="cv"
                        name="cv"
                        accept=".pdf"
                        required
                        disabled={submitting}
                        onChange={handleFileChange}
                        className="text-gray-900 border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Formats acceptés: PDF (max 5MB)</p>
                </div>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg w-full md:w-auto disabled:opacity-50">
                    Enregistrer
                </Button>
            </form>
        </div>
    );
}