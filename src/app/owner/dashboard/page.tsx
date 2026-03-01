
"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from 'next/dynamic';
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false }); 
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  Upload
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
import Image from "next/image";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PAYMENT SETTINGS ---
  const myUpiId = "7842831137@ybl"; 
  const amount = "200";
  const businessName = "Salon Chair";
  const upiUrl = user 
    ? `upi://pay?pa=${myUpiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=SC_${user.uid.substring(0, 8)}`
    : "";

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
    name: "", address: "", landmark: "", city: "", state: "", description: "", imageUrl: "", services: [] as any[]
  });

  const openEditModal = () => {
    if (mySalon) {
      setSalonForm({
        name: mySalon.name || "", 
        address: mySalon.address || "", 
        landmark: mySalon.landmark || "",
        city: mySalon.city || "", 
        state: mySalon.state || "", 
        description: mySalon.description || "",
        imageUrl: mySalon.imageUrl || "",
        services: mySalon.services || []
      });
    }
    setIsEditModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSalonForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSalon = async () => {
    if (!user || !db) return;
    if (!salonForm.name || !salonForm.city || !salonForm.state || !salonForm.imageUrl) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields and upload an image.",
      });
      return;
    }

    setIsSubmitting(true);
    const salonId = mySalon?.id || user.uid; 
    const salonRef = doc(db, "salons", salonId);

    const payload = {
      ...salonForm,
      id: salonId,
      ownerId: user.uid,
      ownerName: user.displayName || "Owner",
      ownerEmail: user.email || "No Email",
      updatedAt: serverTimestamp(),
      isAuthorized: mySalon ? (mySalon.isAuthorized ?? false) : false,
      isPaid: mySalon ? (mySalon.isPaid ?? false) : false,
      isVisible: true,
      registrationDateTime: mySalon?.registrationDateTime || new Date().toISOString(),
    };

    setDocumentNonBlocking(salonRef, payload, { merge: true });
    updateDocumentNonBlocking(doc(db, "users", user.uid), { isSalonOwner: true });

    toast({ title: "Shop Profile Saved", description: "Your details have been submitted for review." });
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {(!mySalon || !mySalon.isPaid) && (
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-primary/10">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4 py-1">
                Activation Required
              </Badge>
              <h2 className="text-4xl font-black text-gray-900 leading-tight">Activate Your Salon Profile</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Scan this unique QR code to pay the one-time activation fee of ₹{amount}. Your shop will be live within 24 hours of payment verification.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Your Payment ID:</span>
                  <span className="font-mono font-black text-primary bg-white px-4 py-2 rounded-xl border shadow-sm">
                    SC_{user.uid.substring(0, 8)}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <p>Our admin uses this ID to verify your transaction. Ensure you scan the QR correctly.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="rounded-xl h-12 font-bold flex-1" onClick={openEditModal}>
                  {mySalon ? "Edit Shop Profile" : "Setup Shop Profile"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-primary/20 shadow-inner">
                {upiUrl ? (
                  <QRCodeSVG 
                    value={upiUrl} 
                    size={240} 
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="h-[240px] w-[240px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-primary font-bold">
                <CreditCard className="h-5 w-5" />
                <span>Pre-filled Amount: ₹{amount}.00</span>
              </div>
              <div className="flex -space-x-2">
                <img src="https://picsum.photos/seed/gpay/32/32" className="w-8 h-8 rounded-full border-2 border-white" alt="GPay" />
                <img src="https://picsum.photos/seed/phonepe/32/32" className="w-8 h-8 rounded-full border-2 border-white" alt="PhonePe" />
                <img src="https://picsum.photos/seed/paytm/32/32" className="w-8 h-8 rounded-full border-2 border-white" alt="Paytm" />
              </div>
            </div>
          </div>
        )}

        {mySalon && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-6">
                {mySalon.imageUrl && (
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden border">
                    <Image src={mySalon.imageUrl} alt={mySalon.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold">{mySalon.name || "Untitled Salon"}</h1>
                    {mySalon.isAuthorized && mySalon.isPaid ? (
                      <Badge className="bg-green-600 rounded-full">Verified & Live</Badge>
                    ) : !mySalon.isPaid ? (
                      <Badge variant="destructive" className="rounded-full">Unpaid</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full">Pending Verification</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{mySalon.city || "Setup city"}, {mySalon.state || "Setup state"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl h-12 px-6" onClick={openEditModal}>Edit Profile</Button>
              </div>
            </div>

            <Tabs defaultValue="new">
              <TabsList className="bg-white p-1 rounded-xl border h-12">
                <TabsTrigger value="new" className="rounded-lg px-6">New Requests ({bookings.filter(b => b.status === 'Pending').length})</TabsTrigger>
                <TabsTrigger value="confirmed" className="rounded-lg px-6">Booked ({bookings.filter(b => b.status === 'Accepted').length})</TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg px-6">History</TabsTrigger>
              </TabsList>

              <TabsContent value="new" className="mt-6 space-y-4">
                {bookings.filter(b => b.status === 'Pending').length > 0 ? (
                  bookings.filter(b => b.status === 'Pending').map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} now={now} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-white text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    No new appointment requests.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="mt-6 space-y-4">
                {bookings.filter(b => b.status === 'Accepted').length > 0 ? (
                  bookings.filter(b => b.status === 'Accepted').map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} showHistoryActions now={now} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-white text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                    No confirmed appointments.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6 space-y-4">
                {bookings.length > 0 ? (
                  bookings.map(b => (
                    <BookingCard key={b.id} booking={b} onAction={handleBookingAction} isHistory now={now} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-white text-muted-foreground">
                    No booking history found.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Salon Profile</DialogTitle>
            <DialogDescription>Details will be reviewed by admin for final approval. Image is mandatory.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Salon Name *</Label><Input className="rounded-xl" value={salonForm.name} onChange={e => setSalonForm({...salonForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Landmark</Label><Input className="rounded-xl" value={salonForm.landmark} onChange={e => setSalonForm({...salonForm, landmark: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Full Address</Label><Input className="rounded-xl" value={salonForm.address} onChange={e => setSalonForm({...salonForm, address: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={salonForm.state} onValueChange={v => setSalonForm({...salonForm, state: v, city: ""})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={salonForm.city} onValueChange={v => setSalonForm({...salonForm, city: v})} disabled={!salonForm.state}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{(salonForm.state ? INDIA_DATA[salonForm.state] : []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Salon Image *</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50">
                  {salonForm.imageUrl ? (
                    <Image src={salonForm.imageUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                  )}
                </div>
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="salon-image-upload" 
                    onChange={handleImageUpload} 
                  />
                  <Label 
                    htmlFor="salon-image-upload" 
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {salonForm.imageUrl ? "Change Image" : "Upload Image"}
                  </Label>
                  <p className="text-[10px] text-muted-foreground mt-2">Recommended: Square image, max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea 
                className="w-full min-h-[80px] rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={salonForm.description} 
                onChange={e => setSalonForm({...salonForm, description: e.target.value})}
                placeholder="Tell customers about your salon..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button className="rounded-xl px-8" onClick={handleUpdateSalon} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Profile'}</Button>
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
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow rounded-2xl border-gray-100", isExpired && "opacity-75 grayscale-[0.2]")}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{booking.userName}</h3>
              <Badge variant="outline" className={cn("text-[10px] font-bold uppercase rounded-full", statusColors[booking.status])}>
                {booking.status}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="text-[10px] font-bold uppercase rounded-full">Time Passed</Badge>
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

          <div className="flex gap-8 items-center bg-muted/30 px-6 py-3 rounded-2xl">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Date</p>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d") : 'N/A'}
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
                  <Button onClick={() => onAction(booking.id, 'Accepted')} className="flex-1 md:w-28 bg-green-600 hover:bg-green-700 rounded-xl">Accept</Button>
                  <Button onClick={() => onAction(booking.id, 'Rejected')} variant="outline" className="flex-1 md:w-28 rounded-xl">Reject</Button>
                </>
              ) : showHistoryActions ? (
                <>
                  <Button onClick={() => onAction(booking.id, 'Completed')} className="flex-1 md:w-28 bg-blue-600 hover:bg-blue-700 rounded-xl">Mark Done</Button>
                  <Button onClick={() => onAction(booking.id, 'NoShow')} variant="outline" className="flex-1 md:w-28 rounded-xl">No-Show</Button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
