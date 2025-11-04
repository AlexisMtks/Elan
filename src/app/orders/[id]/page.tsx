import { PageTitle } from "@/components/misc/page-title";

interface OrderDetailPageProps {
    params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    return (
        <div className="space-y-4">
            <PageTitle title="Order detail" />
            <p className="text-sm text-muted-foreground">
                TODO: implement order tracking UI for order #{params.id}
                (progress bar, delivery info, order recap, vendor info, order history).
            </p>
        </div>
    );
}