"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";
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

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/connexion');
        } else if (user.role === 'student') {
            router.push('/');
        }
    }, [loading, user, router]);

    if (loading || !user || user.role === 'student') {
        return null;
    }
    
    const renderDashboard = () => {
        if (user.role == 'admin') {
            return <AdminDashboard user={user} />;
        }
        else if (user.role == 'company') {
            return <CompanyDashboard user={user} />;
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