"use client";

import { Navbar } from "@/components/navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User, Mail, Check, X } from "lucide-react";
import { format } from "date-fns";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Query bookings where the current user is the owner
  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "bookings"), where("salonOwnerId", "==", user.uid));
  }, [db, user]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    if (!db) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (isUserLoading || isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Salon Owner Dashboard</h1>
        
        <div className="grid gap-6">
          {bookings?.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No bookings found for your salon yet.</CardContent></Card>
          ) : (
            bookings?.map((booking: any) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={booking.status === "Accepted" ? "default" : "secondary"}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Booked on: {booking.createdAt?.toDate ? format(booking.createdAt.toDate(), "PP") : "Just now"}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium"><User className="h-4 w-4 text-primary" /> {booking.userName}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> {booking.userEmail}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4 text-primary" /> {format(new Date(booking.requestedSlotDateTime), "PPP")}</div>
                        <div className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-primary" /> {format(new Date(booking.requestedSlotDateTime), "p")}</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">Service: {booking.serviceName}</div>
                  </div>

                  <div className="bg-muted/50 p-6 flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l">
                    {booking.status === "Pending" && (
                      <>
                        <Button onClick={() => updateStatus(booking.id, "Accepted")} className="bg-green-600 hover:bg-green-700 w-full">
                          <Check className="mr-2 h-4 w-4" /> Accept
                        </Button>
                        <Button onClick={() => updateStatus(booking.id, "Rejected")} variant="destructive" className="w-full">
                          <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    {booking.status !== "Pending" && <span className="text-sm font-medium text-center">Action Completed</span>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}