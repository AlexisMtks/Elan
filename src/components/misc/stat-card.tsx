import { Card } from "@/components/ui/card";

interface StatCardProps {
    label: string;
    value: number | string;
    helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
    return (
        <Card className="space-y-2 rounded-2xl border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="text-2xl font-semibold">{value}</p>
            {helper && (
                <p className="text-xs text-muted-foreground">{helper}</p>
            )}
        </Card>
    );
}