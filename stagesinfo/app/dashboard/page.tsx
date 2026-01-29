"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import type { Profile } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                router.push('/');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    if (loading) {
        return <p>Chargement...</p>;
    }
    
    if (!user) {
        return null;
    }

    const renderDashboard = () => {
        switch (user.role) {
            case 'admin':
                return <AdminDashboard user={user} />;
            case 'company':
                return <CompanyDashboard user={user} />;
            case 'student':
                return <StudentDashboard user={user} />;
            default:
                return <p>Rôle non reconnu</p>;
        }
    };

    return (
        <>
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {renderDashboard()}
                </div>
            </div>
        </>
    );
}