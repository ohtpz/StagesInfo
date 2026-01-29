"use client"
import { useParams } from "next/navigation";
import BackButton from "@/components/ui/backButton";
export default function EditCompany() {
    const { id } = useParams();
    return (
        <div>
            <BackButton />
            <h1>Modifier une entreprise</h1>
        </div>
    );
}