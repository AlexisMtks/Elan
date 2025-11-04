"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface OrderEvent {
    id: string;
    label: string;
    date: string;
    action?: "track" | "contact";
}

interface OrderTimelineProps {
    events: OrderEvent[];
}

/**
 * Historique de la commande (liste des étapes avec dates et actions).
 */
export function OrderTimeline({ events }: OrderTimelineProps) {
    const router = useRouter();

    const handleTrack = () => {
        alert("Simulation : suivi de la livraison.");
    };

    const handleContact = () => {
        // Redirection vers la messagerie
        router.push("/messages");
    };

    // return (
    //     <section className="space-y-4">
    //         <h2 className="text-lg font-semibold">Historique de commande</h2>
    //
    //         <div className="space-y-3 text-sm">
    //             {events.map((event) => (
    //                 <div
    //                     key={event.id}
    //                     className="flex items-center justify-between gap-4"
    //                 >
    //                     <div className="flex items-center gap-3">
    //                         <span className="h-3 w-3 rounded-full border border-muted-foreground" />
    //                         <div className="space-y-0.5">
    //                             <p className="font-medium">{event.label}</p>
    //                             <p className="text-xs text-muted-foreground">
    //                                 {event.date}
    //                             </p>
    //                         </div>
    //                     </div>
    //
    //                     {event.action && (
    //                         <Button
    //                             size="sm"
    //                             variant={event.action === "track" ? "default" : "outline"}
    //                             onClick={
    //                                 event.action === "track" ? handleTrack : handleContact
    //                             }
    //                         >
    //                             {event.action === "track"
    //                                 ? "Suivre la livraison"
    //                                 : "Contacter le vendeur"}
    //                         </Button>
    //                     )}
    //                 </div>
    //             ))}
    //         </div>
    //     </section>
    // );
}
