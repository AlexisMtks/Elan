"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface UserHeaderProps {
    name: string;
    location: string;
    listingsCount: number;
    rating: number;
    avatarUrl?: string | null;
}

export function UserHeader({
                               name,
                               location,
                               listingsCount,
                               rating,
                               avatarUrl,
                           }: UserHeaderProps) {
    const router = useRouter();

    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const handleContact = () => {
        router.push("/messages");
    };

    return (
        <div className="flex flex-col items-center gap-4 rounded-2xl border p-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={name} />
                    ) : (
                        <AvatarFallback>{initials}</AvatarFallback>
                    )}
                </Avatar>
                <div>
                    <h1 className="text-xl font-semibold">{name}</h1>
                    <p className="text-sm text-muted-foreground">{location}</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-end">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className="h-4 w-4"
                                    strokeWidth={1.5}
                                    fill={i < Math.round(rating) ? "currentColor" : "none"}
                                />
                            ))}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {rating.toFixed(1)} / 5
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-2xl font-bold">{listingsCount}</p>
                        <p className="text-xs text-muted-foreground">
                            {listingsCount} annonce{listingsCount > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <Button type="button" size="sm" onClick={handleContact}>
                    Contacter
                </Button>
            </div>
        </div>
    );
}