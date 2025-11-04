import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SellerCardProps {
    id?: string;
    name: string;
    listingsCount: number;
}

export function SellerCard({ id, name, listingsCount }: SellerCardProps) {
    const initials = name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const content = (
        <div className="flex items-center gap-3 transition hover:opacity-80">
            <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs text-muted-foreground">
                    {listingsCount} listings
                </p>
            </div>
        </div>
    );

    return id ? (
        <Link href={`/profile/${id}`} className="block cursor-pointer">
            {content}
        </Link>
    ) : (
        content
    );
}