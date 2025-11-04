"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { SellSuccessDialog } from "./sell-success-dialog";

export function SellForm() {
    const [openDialog, setOpenDialog] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOpenDialog(true);
    };

    return (
        <>
            <Card className="rounded-2xl border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Titre */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Titre de l’annonce</Label>
                            <Input id="title" placeholder="Ex : Poutre d’équilibre 2m" required />
                        </div>

                        {/* Prix */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Prix (€)</Label>
                            <Input id="price" type="number" placeholder="Ex : 150" min="0" required />
                        </div>

                        {/* Catégorie */}
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisissez une catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="appareil">Appareil</SelectItem>
                                    <SelectItem value="tenue">Tenue</SelectItem>
                                    <SelectItem value="accessoire">Accessoire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* État */}
                        <div className="space-y-2">
                            <Label>État</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisissez un état" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="neuf">Neuf</SelectItem>
                                    <SelectItem value="tres_bon">Très bon état</SelectItem>
                                    <SelectItem value="bon">Bon état</SelectItem>
                                    <SelectItem value="usage">Usagé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Décrivez votre article..." rows={5} />
                    </div>

                    {/* Upload d’images */}
                    <div className="space-y-2">
                        <Label>Photos</Label>
                        <ImageUpload />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Publier l’annonce</Button>
                    </div>
                </form>
            </Card>

            <SellSuccessDialog open={openDialog} onOpenChange={setOpenDialog} />
        </>
    );
}