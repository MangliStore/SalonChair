
"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Calendar, Clock, MapPin, Scissors, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyBookings() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">Track your appointment requests and history.</p>
        </div>

        {isBookingsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking: any) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <h3 className="font-bold text-lg">{booking.salonName}</h3>
                        </div>
                        <Badge 
                          variant={
                            booking.status === "Accepted" ? "default" : 
                            booking.status === "Rejected" ? "destructive" : 
                            "secondary"
                          }
                          className={booking.status === "Accepted" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Scissors className="h-4 w-4" />
                          <span className="font-medium text-foreground">{booking.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            {format(parseISO(booking.requestedSlotDateTime), "PPP")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            {format(parseISO(booking.requestedSlotDateTime), "p")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {booking.status === "Accepted" && (
                      <div className="bg-green-50 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-green-100">
                        <div className="text-center">
                          <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Confirmed</p>
                          <p className="text-[10px] text-green-600 max-w-[120px]">Show this to the shop owner upon arrival.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-semibold">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">Find a salon and book your first appointment.</p>
                <Link href="/">
                  <Button className="gap-2">
                    Browse Salons <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex gap-4">
            <div className="bg-primary/10 rounded-full p-3 h-fit">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-primary mb-1">Booking Policy</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Please ensure you arrive at the salon 10 minutes before your scheduled slot. 
                Failure to show up for a confirmed appointment may result in a "No-Show" flag. 
                3 flags will result in a temporary ban from the platform.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
