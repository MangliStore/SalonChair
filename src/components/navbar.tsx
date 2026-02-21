
"use client";

import Link from "next/link";
import { Scissors, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out.",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold text-primary">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Scissors className="h-6 w-6 text-primary" />
          </div>
          Salon Chair
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/owner/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Settings className="h-4 w-4" />
              Salon Dashboard
            </Button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
