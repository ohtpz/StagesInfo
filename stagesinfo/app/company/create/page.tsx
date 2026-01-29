"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createCompany } from "@/lib/companies"
import { useState } from "react"
import { getCurrentUser } from "@/lib/auth"

export default function CreateCompany() {

    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [sector, setSector] = useState("")
    const [contact, setContact] = useState("")
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [user, setUser] = useState(null)



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = await getCurrentUser()
        const company = {
            name: name,
            address: address,
            sector: sector,
            contact_email: email,
            contact_person: user.first_name + " " + user.last_name,
            owner_user_id: user.id
        }
        try {
            const companyCreated = await createCompany(company)
            if (companyCreated) {
                console.log("Company created successfully:", companyCreated)
            } else {
                console.error("Failed to create company")
            }
        } catch (error) {
            console.error("Error creating company:", error)
        }
        // await createCompany(company)

        // console.log(company)
    }

    return (
        <div className="container mx-auto sm:px-10 px-5 py-8 flex justify-center items-center min-h-[80vh]">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Créer une entreprise</CardTitle>
                    <CardDescription>
                        Remplissez les informations de votre entreprise
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Nom de l'entreprise
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Nom de l'entreprise"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="address" className="text-sm font-medium">
                                Adresse
                            </label>
                            <Input
                                id="address"
                                type="text"
                                placeholder="Adresse complète"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="sector" className="text-sm font-medium">
                                Secteur
                            </label>
                            <Input
                                id="sector"
                                type="text"
                                placeholder="Secteur d'activité"
                                required
                                value={sector}
                                onChange={(e) => setSector(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="contact" className="text-sm font-medium">
                                Contact
                            </label>
                            <Input
                                id="contact"
                                type="text"
                                placeholder="Numéro de téléphone"
                                required
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@entreprise.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue hover:bg-blue-600"
                        >
                            Créer l'entreprise
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}