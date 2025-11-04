import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface UserHeaderProps {
    name: string;
    location: string;
    listingsCount: number;
    rating: number;
}

export function UserHeader({ name, location, listingsCount, rating }: UserHeaderProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    return (
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-semibold">{name}</h1>
                    <p className="text-sm text-muted-foreground">{location}</p>
                </div>
            </div>

            <div className="mt-4 flex gap-6 sm:mt-0 sm:gap-8">
                <div className="text-center">
                    <p className="text-2xl font-bold">{rating.toFixed(1)}</p>
                    <div className="flex justify-center gap-0.5 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                fill={i < Math.round(rating) ? "currentColor" : "none"}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">rating</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">{listingsCount}</p>
                    <p className="text-xs text-muted-foreground">listings</p>
                </div>
            </div>
        </div>
    );
}