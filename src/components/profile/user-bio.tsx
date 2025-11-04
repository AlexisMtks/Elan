import { Card } from "@/components/ui/card";

interface UserBioProps {
    bio: string;
}

export function UserBio({ bio }: UserBioProps) {
    return (
        <Card className="rounded-2xl border p-5 text-sm text-muted-foreground">
            {bio}
        </Card>
    );
}