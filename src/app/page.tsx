"use client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
        <h1 className="mb-6 text-4xl font-bold">Élan – MVP</h1>
        <Button onClick={() => alert("Action simulée ✨")}>
          Bouton shadcn/ui
        </Button>
      </main>
  );
}