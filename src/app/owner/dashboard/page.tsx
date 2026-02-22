
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Check, 
  X, 
  Flag, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Calendar, 
  Scissors, 
  IndianRupee, 
  Mail, 
  ShieldAlert, 
  Loader2, 
  Plus,
  Trash2,
  Store
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, setDoc, updateDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
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
    return query(collection(db, "salons"), where("ownerId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: salons, isLoading: isSalonLoading } = useCollection(salonsQuery);
  const mySalon = salons?.[0] || null;

  // Fetch bookings for this salon
  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !mySalon) return null;
    return query(collection(db, "bookings"), where("salonId", "==", mySalon.id));
  }, [db, mySalon?.id]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection(bookingsQuery);

  // Form State for Editing Salon
  const [salonForm, setSalonForm] = useState({
    name: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    description: "",
    services: [] as { name: string; price: number }[]
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
        services: mySalon.services || []
      });
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateSalon = async () => {
    if (!user || !db) return;
    setIsSubmitting(true);
    try {
      const salonId = mySalon?.id || `salon_${user.uid}`;
      const salonRef = doc(db, "salons", salonId);
      
      const payload = {
        ...salonForm,
        id: salonId,
        ownerId: user.uid,
        updatedAt: serverTimestamp(),
        // Defaults for new shops
        isVisible: mySalon ? mySalon.isVisible : true,
        isAuthorized: mySalon ? mySalon.isAuthorized : false,
        isPaid: mySalon ? mySalon.isPaid : true,
        registrationDateTime: mySalon ? mySalon.registrationDateTime : new Date().toISOString(),
        imageUrl: mySalon ? mySalon.imageUrl : `https://picsum.photos/seed/${user.uid}/600/400`
      };

      await setDoc(salonRef, payload, { merge: true });
      
      // If it's the first time, make sure user is marked as salon owner
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { isSalonOwner: true });

      toast({
        title: "Shop Updated",
        description: "Your shop details have been successfully saved.",
      });
      setIsEditModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save shop details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'Accepted' | 'Rejected' | 'NoShow') => {
    if (!db) return;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { 
        status: action,
        ownerResponseDateTime: new Date().toISOString()
      });
      
      toast({
        title: `Booking ${action}`,
        description: `Customer has been notified of the status change.`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  const handleRecharge = async () => {
    if (!db || !mySalon) return;
    setIsRecharging(true);
    try {
      // Simulate Payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const salonRef = doc(db, "salons", mySalon.id);
      await updateDoc(salonRef, { 
        isPaid: true,
        lastPaymentDate: new Date().toISOString()
      });

      toast({
        title: "Subscription Renewed!",
        description: "Payment of ₹200 successful. Your shop visibility is active.",
      });
    } finally {
      setIsRecharging(false);
    }
  };

  if (isUserLoading || isSalonLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading Salon Dashboard...</p>
        </div>
      </div>
    );
  }

  const isGmail = user?.email?.endsWith("@gmail.com");
  const isVerified = user?.emailVerified;
  const canAccess = user && isGmail && isVerified;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Salon Chair Owner Portal</CardTitle>
              <CardDescription>Please sign in to manage your salon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">Go to Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-destructive/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Verification Required</CardTitle>
              <CardDescription>
                To list and manage a salon, you must use a verified Gmail account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </span>
                  <Badge variant={isGmail ? "default" : "destructive"}>
                    {isGmail ? "Gmail Detected" : "Non-Gmail"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Check className="h-4 w-4" /> Email Verified
                  </span>
                  <Badge variant={isVerified ? "default" : "destructive"}>
                    {isVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground bg-orange-50 p-4 rounded-lg border border-orange-100">
                <p className="font-semibold text-orange-900 mb-1">Important:</p>
                <ul className="list-disc pl-5 space-y-1 text-orange-800">
                  <li>Registration is strictly limited to @gmail.com addresses.</li>
                  <li>Your email must be verified. Google Sign-In usually handles this automatically.</li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">Try Another Account</Button>
                </Link>
                <p className="text-center text-xs text-muted-foreground">Current: {user.email}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!mySalon) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center py-8">
             <CardHeader>
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">No Salon Registered</CardTitle>
                <CardDescription>You haven't listed your shop on Salon Chair yet.</CardDescription>
             </CardHeader>
             <CardContent>
                <Button className="w-full h-12 text-lg" onClick={openEditModal}>
                  Setup My Shop Now
                </Button>
             </CardContent>
          </Card>
        </main>
        {/* Reuse Edit Modal for initial creation */}
        <SalonEditDialog 
          isOpen={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen}
          formData={salonForm}
          setFormData={setSalonForm}
          onSave={handleUpdateSalon}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  const revenue = bookings?.filter(b => b.status === 'Accepted').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mySalon.name} Dashboard</h1>
            <p className="text-muted-foreground">{mySalon.city}, {mySalon.state} • {mySalon.landmark}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2 shadow-sm" onClick={openEditModal}>
               <Scissors className="h-4 w-4" />
               Edit Shop Details
             </Button>
             <Button 
              className="bg-primary text-white gap-2 shadow-md hover:shadow-lg transition-all"
              onClick={handleRecharge}
              disabled={isRecharging}
             >
               {isRecharging ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <IndianRupee className="h-4 w-4" />
               )}
               Pay Subscription (₹200)
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(revenue * 250).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on accepted bookings</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings?.filter(b => b.status === 'Pending').length || 0}</div>
              <p className="text-xs text-muted-foreground">Waiting for your response</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Overall history</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visibility Status</CardTitle>
              <Badge className={mySalon.isPaid ? "bg-green-500" : "bg-destructive"}>
                {mySalon.isPaid ? "Public" : "Hidden"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mySalon.isPaid ? "Active" : "Unpaid"}</div>
              <p className="text-xs text-muted-foreground">
                {mySalon.isPaid ? "Visible in search" : "Pay to appear in results"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-6 h-12 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="requests" className="px-6">New Requests</TabsTrigger>
            <TabsTrigger value="history" className="px-6">All History</TabsTrigger>
            <TabsTrigger value="services" className="px-6">Services List</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              {isBookingsLoading ? (
                <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>
              ) : bookings?.filter(b => b.status === 'Pending').length ? (
                bookings.filter(b => b.status === 'Pending').map(booking => (
                  <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{booking.userName}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{booking.userPhone}</p>
                          </div>
                          <Badge variant="outline" className="border-accent text-accent">Pending Request</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Service</p>
                            <p className="font-semibold text-primary">{booking.serviceName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-semibold">
                              {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "PPP") : "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Time Slot</p>
                            <p className="font-semibold">
                               {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "p") : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/30 p-6 flex items-center gap-3 border-t md:border-t-0 md:border-l">
                        <Button 
                          onClick={() => handleBookingAction(booking.id, 'Accepted')}
                          className="bg-primary hover:bg-primary/90 flex-1 gap-2 shadow-sm"
                        >
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                        <Button 
                          onClick={() => handleBookingAction(booking.id, 'Rejected')}
                          variant="outline" 
                          className="border-destructive text-destructive hover:bg-destructive/10 flex-1 gap-2 shadow-sm"
                        >
                          <X className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                   <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                   <h3 className="text-lg font-medium">No pending requests</h3>
                   <p className="text-muted-foreground">We'll notify you when someone books an appointment.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-sm">
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="p-4 text-left font-medium">Customer</th>
                          <th className="p-4 text-left font-medium">Service</th>
                          <th className="p-4 text-left font-medium">Date/Time</th>
                          <th className="p-4 text-left font-medium">Status</th>
                          <th className="p-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bookings?.filter(b => b.status !== 'Pending').map(booking => (
                          <tr key={booking.id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <div className="font-medium">{booking.userName}</div>
                              <div className="text-xs text-muted-foreground">{booking.userPhone}</div>
                            </td>
                            <td className="p-4">{booking.serviceName}</td>
                            <td className="p-4">
                              <div>{booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d, yyyy") : "N/A"}</div>
                              <div className="text-xs text-muted-foreground">{booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "p") : "N/A"}</div>
                            </td>
                            <td className="p-4">
                              <Badge variant={
                                booking.status === 'Accepted' ? 'default' : 
                                booking.status === 'Rejected' ? 'destructive' : 
                                'secondary'
                              }>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                               {booking.status === 'Accepted' && (
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 h-8"
                                   onClick={() => handleBookingAction(booking.id, 'NoShow')}
                                 >
                                   <Flag className="h-3.5 w-3.5" /> Flag No-Show
                                 </Button>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(!bookings || bookings.filter(b => b.status !== 'Pending').length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">No appointment history yet.</div>
                  )}
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mySalon.services?.map((s, idx) => (
                   <Card key={idx} className="relative group shadow-sm border-primary/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{s.name}</CardTitle>
                        <CardDescription>Professional Service</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">₹{s.price}</div>
                      </CardContent>
                   </Card>
                ))}
                <Button 
                  variant="outline" 
                  className="h-32 border-dashed border-2 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={openEditModal}
                >
                   <div className="rounded-full bg-primary/10 p-2">
                     <Plus className="h-6 w-6 text-primary" />
                   </div>
                   Update Services
                </Button>
             </div>
          </TabsContent>
        </Tabs>

        <SalonEditDialog 
          isOpen={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen}
          formData={salonForm}
          setFormData={setSalonForm}
          onSave={handleUpdateSalon}
          isSubmitting={isSubmitting}
        />
      </main>
    </div>
  );
}

// Sub-component for Salon Edit Dialog
function SalonEditDialog({ 
  isOpen, 
  onOpenChange, 
  formData, 
  setFormData, 
  onSave, 
  isSubmitting 
}: any) {
  const cities = formData.state && formData.state !== "" ? INDIA_DATA[formData.state] || [] : [];

  const addService = () => {
    setFormData({ ...formData, services: [...formData.services, { name: "", price: 0 }] });
  };

  const removeService = (index: number) => {
    const updated = [...formData.services];
    updated.splice(index, 1);
    setFormData({ ...formData, services: updated });
  };

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: field === 'price' ? Number(value) : value };
    setFormData({ ...formData, services: updated });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shop Configuration</DialogTitle>
          <DialogDescription>
            Update your business profile, location, and services offered.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Salon Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Elegant Cuts"
              />
            </div>
            <div className="space-y-2">
              <Label>Nearby Landmark</Label>
              <Input 
                value={formData.landmark} 
                onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                placeholder="e.g. Opposite Metro Mall"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Complete Street Address</Label>
            <Input 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Building, Street, Area..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Select 
                value={formData.state} 
                onValueChange={(val) => setFormData({...formData, state: val, city: ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select 
                value={formData.city} 
                onValueChange={(val) => setFormData({...formData, city: val})}
                disabled={!formData.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.state ? "Select City" : "Choose State First"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shop Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Tell customers what makes your salon special..."
              className="h-24"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold">Services & Pricing</Label>
              <Button type="button" variant="outline" size="sm" onClick={addService} className="gap-2">
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.services.map((s: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-end bg-muted/30 p-3 rounded-lg border border-muted">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Service Name</Label>
                    <Input 
                      value={s.name} 
                      onChange={(e) => updateService(idx, 'name', e.target.value)}
                      placeholder="e.g. Haircut"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Price (₹)</Label>
                    <Input 
                      type="number" 
                      value={s.price} 
                      onChange={(e) => updateService(idx, 'price', e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeService(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.services.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4 border-2 border-dashed rounded-lg">
                  No services added. Click "Add Service" to start your menu.
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Store className="h-4 w-4 mr-2" />}
            {isSubmitting ? "Saving..." : "Save Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
