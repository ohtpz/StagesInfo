"use client"
import { useRouter } from "next/navigation";

export default function BackButton () {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium cursor-pointer"
        >
            ← Retour
        </button>
    );
};