
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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, serverTimestamp, limit } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { INDIA_DATA, INDIA_STATES } from "@/app/lib/india-data";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);

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
      // Keep existing status if updating, or set defaults for new
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
    updateDocumentNonBlocking(doc(db!, "bookings", bookingId), { status: action, ownerResponseDateTime: new Date().toISOString() });
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
                <p className="text-sm">Your salon is currently <b>Hidden</b> from the public marketplace. An admin will verify your details and payment (₹200) before making your shop live.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Status</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{mySalon.isAuthorized ? 'Authorized' : 'Pending Verification'}</div></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Pending Bookings</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{bookings.filter(b => b.status === 'Pending').length}</div></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Total Completed</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{bookings.filter(b => b.status === 'Accepted').length}</div></CardContent></Card>
              <Card className="bg-zinc-900 border-zinc-800"><CardHeader><CardTitle className="text-xs text-zinc-500 uppercase">Subscription</CardTitle></CardHeader><CardContent><Badge>{mySalon.isPaid ? 'Paid' : 'Expired'}</Badge></CardContent></Card>
            </div>

            <Tabs defaultValue="new">
              <TabsList className="bg-zinc-900 border-zinc-800">
                <TabsTrigger value="new">New Requests</TabsTrigger>
                <TabsTrigger value="all">History</TabsTrigger>
              </TabsList>
              <TabsContent value="new" className="mt-6 space-y-4">
                {bookings.filter(b => b.status === 'Pending').length > 0 ? (
                  bookings.filter(b => b.status === 'Pending').map(b => (
                    <Card key={b.id} className="bg-zinc-900 border-zinc-800">
                      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-left w-full md:w-auto">
                          <h3 className="text-lg font-bold">{b.userName}</h3>
                          <p className="text-sm text-zinc-400">{b.userPhone}</p>
                          <Badge variant="outline" className="mt-2">{b.serviceName}</Badge>
                        </div>
                        <div className="flex gap-4 text-center">
                          <div><p className="text-[10px] uppercase font-bold text-zinc-500">Date</p><p className="font-bold">{b.requestedSlotDateTime ? format(parseISO(b.requestedSlotDateTime), "MMM d") : 'N/A'}</p></div>
                          <div><p className="text-[10px] uppercase font-bold text-zinc-500">Time</p><p className="font-bold">{b.requestedSlotDateTime ? format(parseISO(b.requestedSlotDateTime), "p") : 'N/A'}</p></div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button onClick={() => handleBookingAction(b.id, 'Accepted')} className="flex-1 bg-green-600 hover:bg-green-700">Accept</Button>
                          <Button onClick={() => handleBookingAction(b.id, 'Rejected')} variant="outline" className="flex-1 border-zinc-700">Reject</Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">No new appointment requests.</div>
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
