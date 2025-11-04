"use client";

import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AccountForm() {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert("Simulation : les informations du compte ont été enregistrées.");
    };

    const handleChangeAvatar = () => {
        alert("Simulation : modification de la photo de profil.");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border p-6">
            {/* En-tête + avatar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Informations personnelles</h2>
                    <p className="text-sm text-muted-foreground">
                        Mettez à jour vos informations de profil.
                    </p>
                </div>

                {/* Avatar cliquable avec hover sombre */}
                <div className="flex flex-col items-center gap-2 md:items-end">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          </span>

                    <button
                        type="button"
                        onClick={handleChangeAvatar}
                        className="group relative h-16 w-16 rounded-full"
                        aria-label="Modifier la photo de profil"
                    >
                        <Avatar className="h-16 w-16">
                            <AvatarFallback>MD</AvatarFallback>
                        </Avatar>

                        {/* Overlay sombre au survol */}
                        <div className="pointer-events-none absolute inset-0 rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100" />
                    </button>

                    {/* Petit texte d’aide (facultatif) */}
                    <span className="text-xs text-muted-foreground">
          </span>
                </div>
            </div>

            {/* Champs du formulaire */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" name="firstName" defaultValue="Marie" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" name="lastName" defaultValue="Dupont" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue="marie.dupont@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" name="phone" defaultValue="+33 6 12 34 56 78" />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                        id="address"
                        name="address"
                        defaultValue="12 rue des Agrès, 75000 Paris"
                    />
                </div>

                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="gender">Genre</Label>
                    <Select defaultValue="female">
                        <SelectTrigger id="gender">
                            <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="female">Femme</SelectItem>
                            <SelectItem value="male">Homme</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                            <SelectItem value="na">Préférer ne pas répondre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button type="submit">Enregistrer les modifications</Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        alert("Simulation : changement de mot de passe.")
                    }
                >
                    Modifier le mot de passe
                </Button>
            </div>
        </form>
    );
}