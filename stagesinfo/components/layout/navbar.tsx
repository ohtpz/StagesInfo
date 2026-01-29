"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, deconnexion } from "../../lib/auth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();

    // Listen for auth state changes (login/logout)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { // Listener for auth state changes
      fetchUser(); // fetchUser() already handles all cases
    });

    return () => subscription?.unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await deconnexion();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header>
      <nav>
        <Link href="/" className="italic">
          <p className="text-3xl font-bold">StagesInfo</p>
        </Link>
        <ul>
          <Link href="/" className="nav-link">
            Offres
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="nav-link text-red-400 hover:text-red-600 hover:decoration-red-500"
              >
                Se deconnecter
              </button>
            </>
          ) : (
            <Link href="/connexion" className="nav-link text-blue">
              Connexion
            </Link>
          )}
        </ul>
      </nav>
    </header>
  );
}
