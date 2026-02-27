
"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scissors,
  Loader2,
  Store,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, serverTimestamp, limit } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { INDIA_DATA, INDIA_STATES } from "@/app/lib/india-data";
import Link from "next/link";
import { format, parseISO, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { ChatDialog } from "@/components/chat-dialog";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update "now" periodically
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const salonsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "salons"), where("ownerId", "==", user.uid), limit(1));
  }, [db, user?.uid]);

  const { data: salons, isLoading: isSalonLoading } = useCollection(salonsQuery);
  const mySalon = salons?.[0] || null;

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "bookings"), where("salonOwnerId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: rawBookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);
  const bookings = useMemo(() => rawBookings ? [...rawBookings].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)) : [], [rawBookings]);

  const [salonForm, setSalonForm] = useState({
    name: "", address: "", landmark: "", city: "", state: "", description: "", services: [] as any[]
  });

  const openEditModal = () => {
    if (mySalon) {
      setSalonForm({
        name: mySalon.name || "", address: mySalon.address || "", landmark: mySalon.landmark || "",
        city: mySalon.city || "", state: mySalon.state || "", description: mySalon.description || "",
        services: mySalon.services || []
      });
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateSalon = async () => {
    if (!user || !db) return;
    setIsSubmitting(true);
    const salonId = mySalon?.id || `salon_${user.uid}`;
    const salonRef = doc(db, "salons", salonId);

    const payload = {
      ...salonForm,
      id: salonId,
      ownerId: user.uid,
      updatedAt: serverTimestamp(),
      isAuthorized: mySalon ? (mySalon.isAuthorized ?? false) : false,
      isPaid: mySalon ? (mySalon.isPaid ?? true) : true,
      isVisible: true,
      registrationDateTime: mySalon?.registrationDateTime || new Date().toISOString(),
      subscriptionId: mySalon?.subscriptionId || `sub_${salonId}`
    };

    setDocumentNonBlocking(salonRef, payload, { merge: true });
    updateDocumentNonBlocking(doc(db, "users", user.uid), { isSalonOwner: true });

    toast({ title: "Shop Profile Saved", description: "Details are submitted for review." });
    setIsEditModalOpen(false);
    setIsSubmitting(false);
  };

  const handleBookingAction = (bookingId: string, action: string) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "bookings", bookingId), { 
      status: action, 
      ownerResponseDateTime: new Date().toISOString() 
    });
    toast({ title: `Booking ${action}` });
  };

  if (isUserLoading || isSalonLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!user) return <div className="p-20 text-center"><Link href="/login"><Button>Sign In to Access Dashboard</Button></Link></div>;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {!mySalon ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl shadow-sm">
            <Store className="h-16 w-16 text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-2">No Shop Profile Found</h1>
            <p className="text-muted-foreground mb-8">Setup your shop details to start receiving bookings.</p>
            <Button size="lg" onClick={openEditModal}>Setup My Salon</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-card p-6 rounded-2xl shadow-sm border">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold">{mySalon.name}</h1>
                  {mySalon.isAuthorized ? (
                    <Badge className="bg-green-600">Verified & Live</Badge>
                  ) : (
                    <Badge variant="secondary">Pending Review</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{mySalon.city}, {mySalon.state}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={openEditModal}>Edit Profile</Button>
                <Link href="/dashboard"><Button>Renew Subscription</Button></Link>
              </div>
            </div>

            <Tabs defaultValue="new">
              <TabsList className="mb-6">
                <TabsTrigger value="new">New Requests ({bookings.filter(b => b.status === 'Pending').length})</TabsTrigger>
                <TabsTrigger value="confirmed">Booked Appointments ({bookings.filter(b => b.status === 'Accepted').length})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                {bookings.filter(b => b.status === 'Pending').length > 0 ? (
                  bookings.filter(b => b.status === 'Pending').map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} now={now} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    No new appointment requests.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="space-y-4">
                {bookings.filter(b => b.status === 'Accepted').length > 0 ? (
                  bookings.filter(b => b.status === 'Accepted').map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} showHistoryActions now={now} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    No confirmed appointments.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} isHistory now={now} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                    No booking history found.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Salon Profile</DialogTitle><DialogDescription>Admin will review these details before approval.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Salon Name</Label><Input value={salonForm.name} onChange={e => setSalonForm({...salonForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Landmark</Label><Input value={salonForm.landmark} onChange={e => setSalonForm({...salonForm, landmark: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Full Address</Label><Input value={salonForm.address} onChange={e => setSalonForm({...salonForm, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={salonForm.state} onValueChange={v => setSalonForm({...salonForm, state: v, city: ""})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={salonForm.city} onValueChange={v => setSalonForm({...salonForm, city: v})} disabled={!salonForm.state}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(salonForm.state ? INDIA_DATA[salonForm.state] : []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSalon} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Submit Profile'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingCard({ booking, onAction, isHistory = false, showHistoryActions = false, now }: { 
  booking: any, 
  onAction: (id: string, action: string) => void,
  isHistory?: boolean,
  showHistoryActions?: boolean,
  now: Date
}) {
  const statusColors: any = {
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Accepted': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
    'NoShow': 'bg-zinc-100 text-zinc-700 border-zinc-200',
    'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const isExpired = booking.requestedSlotDateTime 
    ? isBefore(parseISO(booking.requestedSlotDateTime), now) 
    : false;

  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", isExpired && "opacity-75 grayscale-[0.2]")}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{booking.userName}</h3>
              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", statusColors[booking.status])}>
                {booking.status}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="text-[10px] font-bold uppercase">Time Passed</Badge>
              )}
              {!isExpired && booking.status === "Accepted" && (
                <ChatDialog bookingId={booking.id} recipientName={booking.userName} />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {booking.userPhone}</div>
              <div className="flex items-center gap-1.5"><Scissors className="h-3.5 w-3.5" /> {booking.serviceName}</div>
            </div>
          </div>

          <div className="flex gap-8 items-center bg-muted/30 px-6 py-3 rounded-xl">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Date</p>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d, yyyy") : 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Time</p>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "p") : 'N/A'}
              </div>
            </div>
          </div>

          {!isHistory && !isExpired && (
            <div className="flex gap-2 w-full md:w-auto">
              {booking.status === 'Pending' ? (
                <>
                  <Button onClick={() => onAction(booking.id, 'Accepted')} className="flex-1 md:w-28 bg-green-600 hover:bg-green-700">Accept</Button>
                  <Button onClick={() => onAction(booking.id, 'Rejected')} variant="outline" className="flex-1 md:w-28">Reject</Button>
                </>
              ) : showHistoryActions ? (
                <>
                  <Button onClick={() => onAction(booking.id, 'Completed')} className="flex-1 md:w-28 bg-blue-600 hover:bg-blue-700">Mark Done</Button>
                  <Button onClick={() => onAction(booking.id, 'NoShow')} variant="outline" className="flex-1 md:w-28">No-Show</Button>
                </>
              ) : null}
            </div>
          )}
          
          {isExpired && !isHistory && (
             <div className="text-xs text-muted-foreground font-medium italic">
               Slot expired. Move to history to manage.
             </div>
          )}
        </div>
      </div>
    </Card>
  );
}
