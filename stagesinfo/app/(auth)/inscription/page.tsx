"use client"
import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
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


const SignupPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"student" | "company">("student");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
            await inscription(email, password, firstName, lastName, role);
            // Rediriger l'utilisateur après une inscription réussie
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    }
  return (
    <>
      <Navbar />
      <div className="container mx-auto sm:px-10 px-5 py-8 flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>
              Créez votre compte StagesInfo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    Prénom
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
                    Nom
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
                  Email
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
                  <option value="">Sélectionnez un type</option>
                  <option value="student">Étudiant</option>
                  <option value="company">Entreprise</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
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
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue hover:bg-blue-600">
                S'inscrire
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
    </>
  );
};

export default SignupPage;
