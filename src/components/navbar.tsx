
"use client";

import Link from "next/link";
import { Scissors, User, Settings, LogOut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { doc } from "firebase/firestore";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const salonRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "salons", user.uid);
  }, [db, user?.uid]);

  const { data: salon } = useDoc(salonRef);

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
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden lg:block">
            <FeedbackDialog />
          </div>

          {user && (
            <>
              <Link href="/my-bookings">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                  <Calendar className="h-4 w-4" />
                  My Bookings
                </Button>
              </Link>
              
              <Link href={salon?.isPaid && salon?.isAuthorized ? "/owner/dashboard" : "/dashboard"}>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                  <Settings className="h-4 w-4" />
                  Salon Owner
                </Button>
              </Link>
            </>
          )}
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline max-w-[150px] truncate">
                {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline">Sign Out</span>
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
