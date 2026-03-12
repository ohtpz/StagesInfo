"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ChangeEvent, useEffect, useState } from "react";
import { getStudentProfile, updateStudentProfile } from "@/lib/students";
import { getAllSkills, getStudentSkills, addStudentSkill, removeStudentSkill } from "@/lib/skills";
import { Profile, Skill } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FileText, X } from "lucide-react";

type StudentProfile = Profile & { cv_path: string | null };

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Identity State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // CV State
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvError, setCvError] = useState<string | null>(null);

    // Skills State
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [mySkills, setMySkills] = useState<Skill[]>([]);
    const [selectedSkillId, setSelectedSkillId] = useState<string>("");
    const [skillCount, setSkillCount] = useState<number>(0);
    const SKILL_LIMIT = 5;
    const supabase = createClient();

    useEffect(() => {
        const loadData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/connexion');
                return;
            }

            setEmail(authUser.email || "");

            const profileData = await getStudentProfile(authUser.id);
            if (profileData) {
                setUser(profileData as StudentProfile);
                setFirstName(profileData.first_name || "");
                setLastName(profileData.last_name || "");
            }

            const skills = await getAllSkills();
            setAllSkills(skills);

            const studentSkills = await getStudentSkills(authUser.id);
            setMySkills(studentSkills);
            setSkillCount(studentSkills.length);
            setLoading(false);
        };

        loadData();
    }, [router, supabase]);

    // --- Identity Handlers ---
    const handleUpdateIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        if (!user) return;

        try {
            await updateStudentProfile(user.id, {
                first_name: firstName,
                last_name: lastName
            });

            if (password) {
                if (password !== confirmPassword) {
                    alert("Les mots de passe ne correspondent pas");
                    setUpdating(false);
                    return;
                }
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                setPassword("");
                setConfirmPassword("");
                alert("Profil et mot de passe mis à jour !");
            } else {
                alert("Profil mis à jour !");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setUpdating(false);
        }
    };

    // --- CV Handlers ---

    // This runs every time the user picks a file.
    // We validate client-side first for instant feedback, but the server
    // also validates (so there is no way to bypass these checks).
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setCvError(null); // clear any previous error

        if (!file) return;

        // Reject if the file is bigger than 5MB
        if (file.size > 5 * 1024 * 1024) {
            setCvError('Le fichier ne doit pas dépasser 5MB.');
            setCvFile(null);
            e.target.value = ''; // reset the file input so user can try again
            return;
        }

        // Reject if the file is not a PDF
        const header = await file.slice(0, 4).text();
        if (header !== '%PDF') {
            setCvError('Le fichier sélectionné n\'est pas un vrai PDF.');
            setCvFile(null);
            e.target.value = '';
            return;
        }

        // All good — store the file in state so the upload button can use it
        setCvFile(file);
    };

    // This runs when the user clicks "Envoyer" or "Remplacer".
    // Instead of uploading directly to storage (which would be a security risk),
    // we send the file to our own server route: POST /api/cv/upload
    // That route verifies the user is a student, validates the file again,
    // then uploads it safely.
    const handleUploadCV = async () => {
        if (!cvFile || !user) return;
        setUpdating(true);
        setCvError(null);

        try {
            // FormData is how you send a file in an HTTP request
            const formData = new FormData();
            formData.append('file', cvFile);

            // Send the file to our server API route
            const res = await fetch('/api/cv/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                // Try to read the error message from the server.
                // We wrap this in try/catch because if the server crashes badly,
                // it might return an HTML page instead of JSON, which would
                // cause res.json() to throw its own error.
                let errorMessage = 'Upload échoué';
                try {
                    const json = await res.json();
                    errorMessage = json.error || errorMessage;
                } catch {
                    errorMessage = `Erreur serveur (${res.status})`;
                }
                throw new Error(errorMessage);
            }

            // Upload worked! Update the page to show the new CV exists.
            // We know the path is always <userId>/cv.pdf (stable path).
            setUser({ ...user, cv_path: `${user.id}/cv.pdf` });
            setCvFile(null);
            alert("CV téléchargé avec succès !");
        } catch (error) {
            console.error(error);
            setCvError(error instanceof Error ? error.message : "Erreur lors du téléchargement");
        } finally {
            setUpdating(false); // always re-enable buttons when done
        }
    };

    // --- Skills Handlers ---
    const handleAddSkill = async () => {
        if (!selectedSkillId || !user) return;
        if(skillCount >= SKILL_LIMIT) return;
        const skillIdNum = parseInt(selectedSkillId);
        const skillToAdd = allSkills.find(s => s.id === skillIdNum);
        if (!skillToAdd) return;

        // Check if the skill is already in my list
        const existingSkill = mySkills.find(skill => skill.id === skillIdNum);
        if (existingSkill) {
            return; // Stop if we already have it
        }

        try {
            await addStudentSkill(user.id, skillIdNum);
            setSkillCount(skillCount + 1);
            setMySkills([...mySkills, skillToAdd]);
            setSelectedSkillId("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveSkill = async (skillId: number) => {
        if (!user) return;
        try {
            await removeStudentSkill(user.id, skillId);
            setSkillCount(skillCount - 1);
            setMySkills(mySkills.filter(s => s.id !== skillId));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    const hasCV = !!user?.cv_path; // checks if the user has a CV path, !! meaning if the variable is allocated it returns true, if there was only 1 ! it would return false

    console.log(skillCount)

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

            {/* Identity Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Identité & Connexion</CardTitle>
                    <CardDescription>Gérez vos informations personnelles et votre mot de passe</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateIdentity} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prénom</label>
                                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={updating} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom</label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={updating} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input value={email} disabled className="bg-gray-100" />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-medium mb-3">Changer le mot de passe (laisser vide pour ne pas changer)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} disabled={updating} />
                                <Input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={updating} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={updating}>
                                {updating ? 'Enregistrement...' : 'Mettre à jour'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* CV Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Mon CV</CardTitle>
                    <CardDescription>Votre CV est accessible uniquement aux entreprises ayant reçu votre candidature</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {hasCV ? (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-900">CV enregistré</p>
                                    {/*
                                      * This link points to our server route, NOT directly to storage.
                                      * When clicked, the server:
                                      *   1. Checks who is logged in and their role
                                      *   2. Verifies they are allowed to see this CV
                                      *   3. Generates a 10-second download link
                                      *   4. Redirects the browser to that link
                                      * This means the real storage URL is never exposed to the browser.
                                      */}
                                    <a
                                        href={`/api/cv/${user!.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-green-700 hover:underline"
                                    >
                                        Voir mon CV
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 border-2 border-dashed rounded-lg text-gray-500">
                            Aucun CV téléchargé pour le moment
                        </div>
                    )}

                    {/* Upload / Replace */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {hasCV ? 'Remplacer le CV (PDF uniquement)' : 'Télécharger un CV (PDF uniquement)'}
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                disabled={updating}
                                className="cursor-pointer"
                            />
                            <Button onClick={handleUploadCV} disabled={!cvFile || updating}>
                                {updating ? '...' : (hasCV ? 'Remplacer' : 'Envoyer')}
                            </Button>
                        </div>
                        {cvError && <p className="text-sm text-red-500">{cvError}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Mes Compétences (Max 5)</CardTitle>
                    <CardDescription>Ajoutez les technologies que vous maîtrisez</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {mySkills.length > 0 ? (
                            mySkills.map(skill => (
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

                    <div className="flex gap-2 max-w-md">
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedSkillId}
                            onChange={(e) => setSelectedSkillId(e.target.value)}
                        >
                            <option value="">Sélectionner une compétence...</option>
                            {(() => {
                                const availableSkills = allSkills.filter((skill) => {
                                    const alreadyAdded = mySkills.find((mySkill) => mySkill.id === skill.id)
                                    return !alreadyAdded
                                })

                                return availableSkills.map((skill) => (
                                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                                ))
                            })()} {/* () calls the function above immediately */}

                        </select>
                        <Button onClick={handleAddSkill} disabled={(!selectedSkillId || skillCount >= SKILL_LIMIT)}>
                            Ajouter
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}