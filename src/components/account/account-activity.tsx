import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShoppingBag, Tag, CreditCard } from "lucide-react";

interface AccountActivityProps {
    stats: {
        listings: number;
        sales: number;
        purchases: number;
    };
}

export function AccountActivity({ stats }: AccountActivityProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Mon activité</h2>
                <p className="text-sm text-muted-foreground">
                    Accédez rapidement à vos annonces, ventes et achats.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <ActivityCard
                    href="/listings"
                    icon={<Tag className="h-5 w-5" />}
                    label="Mes annonces"
                    value={stats.listings}
                />

                <ActivityCard
                    href="/sales"
                    icon={<ShoppingBag className="h-5 w-5" />}
                    label="Mes ventes"
                    value={stats.sales}
                />

                <ActivityCard
                    href="/purchases"
                    icon={<CreditCard className="h-5 w-5" />}
                    label="Mes achats"
                    value={stats.purchases}
                />
            </div>
        </div>
    );
}

interface ActivityCardProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    value: number;
}

function ActivityCard({ href, icon, label, value }: ActivityCardProps) {
    return (
        <Link href={href} className="group block">
            <Card className="flex h-full flex-col justify-between rounded-2xl border p-4 transition group-hover:-translate-y-0.5 group-hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            {icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                                Voir le détail
                            </p>
                        </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>

                <p className="mt-4 text-2xl font-semibold">{value}</p>
            </Card>
        </Link>
    );
}