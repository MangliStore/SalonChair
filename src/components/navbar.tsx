
"use client";

import Link from "next/link";
import { Scissors, User, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Scissors className="h-6 w-6 text-primary" />
          </div>
          SalonVerse
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/owner/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Settings className="h-4 w-4" />
              Salon Dashboard
            </Button>
          </Link>
          <Link href="/scbadmin">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
}
