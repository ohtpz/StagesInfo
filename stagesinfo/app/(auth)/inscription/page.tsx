"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inscription } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

const SignupPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "company">("student");

  // Company-specific fields
  const [companyName, setCompanyName] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      // Prepare company data if role is company
      const companyData = role === 'company' ? {
        name: companyName,
        sector: companySector,
        address: companyAddress,
      } : undefined;

      await inscription(email, password, firstName, lastName, role, companyData);
      // Rediriger l'utilisateur après une inscription réussie
      router.push("/");

    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
      setPassword(""); // Clear password
      setConfirmPassword(""); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="container mx-auto sm:px-10 px-5 py-8 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte StagesInfo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Type de compte
              </label>
              <select
                id="role"
                className="w-full px-3 py-2 border rounded-md"
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "company")}
                required
              >
                <option value="student">Étudiant</option>
                <option value="company">Entreprise</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Prénom {role === 'company' && '(Contact)'}
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  className="w-full px-3 py-2 border rounded-md"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Nom {role === 'company' && '(Contact)'}
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  className="w-full px-3 py-2 border rounded-md"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email {role === 'company' && '(Contact)'}
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="w-full px-3 py-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Company-specific fields */}
            {role === 'company' && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-3 text-gray-700">Informations Entreprise</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium">
                        Nom de l'entreprise
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        placeholder="Mon Entreprise"
                        className="w-full px-3 py-2 border rounded-md"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required={role === 'company'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="companySector" className="text-sm font-medium">
                        Secteur
                      </label>
                      <input
                        id="companySector"
                        type="text"
                        placeholder="Technologie, Finance, etc."
                        className="w-full px-3 py-2 border rounded-md"
                        value={companySector}
                        onChange={(e) => setCompanySector(e.target.value)}
                        required={role === 'company'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="companyAddress" className="text-sm font-medium">
                        Adresse
                      </label>
                      <input
                        id="companyAddress"
                        type="text"
                        placeholder="123 Rue Example, Paris"
                        className="w-full px-3 py-2 border rounded-md"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        required={role === 'company'}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Doit contenir : min 8 caractères, 1 chiffre, 1 majuscule, 1 caractère spécial</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue hover:bg-blue-600" disabled={loading}>
              {loading ? "En cours..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-blue hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;
