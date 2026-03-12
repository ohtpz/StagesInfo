"use client"
import type { Profile } from "@/lib/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentProfiles } from "@/app/actions/students";
import { deleteStudentAndUser } from "@/app/actions/deleteAccount";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const PAGE_SIZE = 10;

interface StudentRow {
    id: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string;
}

interface AdminDashboardProps {
    user: Profile;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
    const router = useRouter();
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<StudentRow | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getStudentProfiles()
            .then((data) => {
                setStudents(data as StudentRow[]);
                setPage(1);
            })
            .catch(() => setError("Impossible de charger les étudiants."))
            .finally(() => setLoading(false));
    }, []);

    const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
    const pageStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteStudentAndUser(deleteTarget.id);
            const updated = students.filter(s => s.id !== deleteTarget.id);
            setStudents(updated);
            const newTotal = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
            if (page > newTotal) setPage(newTotal);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Erreur lors de la suppression.");
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }

    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Dashboard Admin</h1>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Étudiants</h2>
                    <p className="text-sm text-gray-500">{students.length} compte{students.length !== 1 ? "s" : ""}</p>
                </div>

                {loading ? (
                    <div className="p-6 text-gray-500 text-sm">Chargement...</div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">Nom complet</TableHead>
                                    <TableHead className="px-6">Inscrit le</TableHead>
                                    <TableHead className="px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pageStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-6 text-center text-gray-400 py-8">
                                            Aucun étudiant.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pageStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="px-6 font-medium">
                                                {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell className="px-6 text-gray-500">
                                                {new Date(student.created_at).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell className="px-6 text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                                                >
                                                    Modifier
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeleteTarget(student)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                                Page {page} sur {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    ← Précédent
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Suivant →
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {error && (
                    <p className="px-6 pb-4 text-sm text-red-600">{error}</p>
                )}
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet étudiant ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le compte de{" "}
                            <span className="font-semibold">
                                {deleteTarget?.first_name} {deleteTarget?.last_name}
                            </span>{" "}
                            ainsi que toutes ses données (CV, candidatures, évaluations) seront définitivement supprimés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
