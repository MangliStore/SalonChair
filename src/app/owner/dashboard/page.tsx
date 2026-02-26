
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Flag,
  AlertCircle,
  Scissors,
  IndianRupee,
  ShieldAlert,
  Loader2,
  Plus,
  Trash2,
  Store,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, serverTimestamp, limit } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { INDIA_DATA, INDIA_STATES } from "@/app/lib/india-data";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the user's salon
  const salonsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "salons"), where("ownerId", "==", user.uid), limit(1));
  }, [db, user?.uid]);

  const { data: salons, isLoading: isSalonLoading } = useCollection(salonsQuery);
  const mySalon = salons?.[0] || null;

  // Fetch bookings
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

  if (isUserLoading || isSalonLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!user) return <div className="p-20 text-center"><Link href="/login"><Button>Sign In to Access Dashboard</Button></Link></div>;

  return (
    <div className="dark min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {!mySalon ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Store className="h-16 w-16 text-zinc-700 mb-6" />
            <h1 className="text-3xl font-bold mb-2">No Shop Profile Found</h1>
            <p className="text-zinc-400 mb-8">Setup your shop details to start receiving bookings.</p>
            <Button size="lg" onClick={openEditModal}>Setup My Salon</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-extrabold">{mySalon.name}</h1>
                  {mySalon.isAuthorized ? (
                    <Badge className="bg-green-600">Verified & Live</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-600">Pending Review</Badge>
                  )}
                </div>
                <p className="text-zinc-400">{mySalon.city}, {mySalon.state}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={openEditModal} className="border-zinc-700">Edit Profile</Button>
                <Button className="bg-primary hover:bg-primary/90">Renew Subscription</Button>
              </div>
            </div>

            {!mySalon.isAuthorized && (
              <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-900/30 rounded-xl flex gap-3 text-yellow-500">
                <Clock className="h-5 w-5 shrink-0" />
                <p className="text-sm">Your salon is currently <b>Hidden</b> from the public marketplace. An admin will verify your details and payment before making your shop live.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Status</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{mySalon.isAuthorized ? 'Authorized' : 'Pending Verification'}</div></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Pending Bookings</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{bookings.filter(b => b.status === 'Pending').length}</div></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Confirmed Today</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-500">{bookings.filter(b => b.status === 'Accepted').length}</div></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Subscription</CardTitle></CardHeader><CardContent><Badge>{mySalon.isPaid ? 'Paid' : 'Expired'}</Badge></CardContent></Card>
            </div>

            <Tabs defaultValue="new">
              <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
                <TabsTrigger value="new">New Requests ({bookings.filter(b => b.status === 'Pending').length})</TabsTrigger>
                <TabsTrigger value="confirmed">Booked Appointments ({bookings.filter(b => b.status === 'Accepted').length})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="space-y-4">
                {bookings.filter(b => b.status === 'Pending').length > 0 ? (
                  bookings.filter(b => b.status === 'Pending').map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                    <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    No new appointment requests.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="space-y-4">
                {bookings.filter(b => b.status === 'Accepted').length > 0 ? (
                  bookings.filter(b => b.status === 'Accepted').map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} showHistoryActions />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    No confirmed appointments.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} isHistory />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
                    No booking history found.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Edit Salon Profile</DialogTitle><DialogDescription>Admin will review these details before approval.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Salon Name</Label><Input className="bg-zinc-900 border-zinc-800" value={salonForm.name} onChange={e => setSalonForm({...salonForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Landmark</Label><Input className="bg-zinc-900 border-zinc-800" value={salonForm.landmark} onChange={e => setSalonForm({...salonForm, landmark: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Full Address</Label><Input className="bg-zinc-900 border-zinc-800" value={salonForm.address} onChange={e => setSalonForm({...salonForm, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={salonForm.state} onValueChange={v => setSalonForm({...salonForm, state: v, city: ""})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">{INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={salonForm.city} onValueChange={v => setSalonForm({...salonForm, city: v})} disabled={!salonForm.state}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">{(salonForm.state ? INDIA_DATA[salonForm.state] : []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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

function BookingCard({ booking, onAction, isHistory = false, showHistoryActions = false }: { 
  booking: any, 
  onAction: (id: string, action: string) => void,
  isHistory?: boolean,
  showHistoryActions?: boolean
}) {
  const statusColors: any = {
    'Pending': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    'Accepted': 'bg-green-500/20 text-green-500 border-green-500/50',
    'Rejected': 'bg-red-500/20 text-red-500 border-red-500/50',
    'NoShow': 'bg-zinc-500/20 text-zinc-500 border-zinc-500/50',
    'Completed': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{booking.userName}</h3>
              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", statusColors[booking.status])}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {booking.userPhone}</div>
              <div className="flex items-center gap-1.5"><Scissors className="h-3.5 w-3.5" /> {booking.serviceName}</div>
            </div>
          </div>

          <div className="flex gap-8 items-center bg-black/40 px-6 py-3 rounded-xl border border-zinc-800/50">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Date</p>
              <div className="flex items-center gap-2 font-bold">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d, yyyy") : 'N/A'}
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Time</p>
              <div className="flex items-center gap-2 font-bold">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "p") : 'N/A'}
              </div>
            </div>
          </div>

          {!isHistory && (
            <div className="flex gap-2 w-full md:w-auto">
              {booking.status === 'Pending' ? (
                <>
                  <Button onClick={() => onAction(booking.id, 'Accepted')} className="flex-1 md:w-28 bg-green-600 hover:bg-green-700">Accept</Button>
                  <Button onClick={() => onAction(booking.id, 'Rejected')} variant="outline" className="flex-1 md:w-28 border-zinc-700">Reject</Button>
                </>
              ) : showHistoryActions ? (
                <>
                  <Button onClick={() => onAction(booking.id, 'Completed')} className="flex-1 md:w-28 bg-blue-600 hover:bg-blue-700">Mark Done</Button>
                  <Button onClick={() => onAction(booking.id, 'NoShow')} variant="outline" className="flex-1 md:w-28 border-zinc-700 text-zinc-500 hover:text-zinc-300">No-Show</Button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
