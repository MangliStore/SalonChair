
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
import { collection, query, where, doc, serverTimestamp, orderBy } from "firebase/firestore";
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
    return query(collection(db, "salons"), where("ownerId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: salons, isLoading: isSalonLoading } = useCollection(salonsQuery);
  const mySalon = salons?.[0] || null;

  // Fetch bookings for this salon owner
  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "bookings"), 
      where("salonOwnerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: bookings, isLoading: isBookingsLoading, error: bookingsError } = useCollection(bookingsQuery);

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
    } else {
      // Reset for new creation
      setSalonForm({
        name: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        description: "",
        services: []
      });
    }
    setIsEditModalOpen(true);
  };

  const handleUpdateSalon = async () => {
    if (!user || !db) return;
    
    // Basic validation
    if (!salonForm.name || !salonForm.city || !salonForm.state) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name, State, and City are required.",
      });
      return;
    }

    setIsSubmitting(true);
    const salonId = mySalon?.id || `salon_${user.uid}`;
    const salonRef = doc(db, "salons", salonId);
    
    const payload = {
      ...salonForm,
      id: salonId,
      ownerId: user.uid,
      updatedAt: serverTimestamp(),
      isVisible: mySalon ? (mySalon.isVisible ?? true) : true,
      isAuthorized: mySalon ? (mySalon.isAuthorized ?? false) : false,
      isPaid: mySalon ? (mySalon.isPaid ?? true) : true,
      registrationDateTime: mySalon ? (mySalon.registrationDateTime ?? new Date().toISOString()) : new Date().toISOString(),
      imageUrl: mySalon ? (mySalon.imageUrl ?? `https://picsum.photos/seed/${user.uid}/600/400`) : `https://picsum.photos/seed/${user.uid}/600/400`,
      subscriptionId: mySalon ? (mySalon.subscriptionId ?? `sub_${salonId}`) : `sub_${salonId}`
    };

    setDocumentNonBlocking(salonRef, payload, { merge: true });
    
    // Mark user as salon owner
    const userRef = doc(db, "users", user.uid);
    updateDocumentNonBlocking(userRef, { isSalonOwner: true });

    toast({
      title: "Success",
      description: "Shop details saved successfully.",
    });
    setIsEditModalOpen(false);
    setIsSubmitting(false);
  };

  const handleBookingAction = (bookingId: string, action: 'Accepted' | 'Rejected' | 'NoShow') => {
    if (!db) return;
    const bookingRef = doc(db, "bookings", bookingId);
    updateDocumentNonBlocking(bookingRef, { 
      status: action,
      ownerResponseDateTime: new Date().toISOString()
    });
    
    toast({
      title: `Booking ${action}`,
      description: `Customer has been notified.`,
    });
  };

  const handleRecharge = () => {
    if (!db || !mySalon) return;
    setIsRecharging(true);
    
    // Simulate payment delay
    setTimeout(() => {
      const salonRef = doc(db, "salons", mySalon.id);
      updateDocumentNonBlocking(salonRef, { 
        isPaid: true,
        lastPaymentDate: new Date().toISOString()
      });

      toast({
        title: "Subscription Renewed!",
        description: "Your shop is now public.",
      });
      setIsRecharging(false);
    }, 1500);
  };

  if (isUserLoading || isSalonLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading Dashboard...</p>
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
              <CardTitle>Salon Owner Portal</CardTitle>
              <CardDescription>Please sign in to manage your salon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">Sign In</Button>
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
                Use a verified Gmail account to list a salon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Provider</span>
                  <Badge variant={isGmail ? "default" : "destructive"}>{isGmail ? "Gmail" : "Other"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification</span>
                  <Badge variant={isVerified ? "default" : "destructive"}>{isVerified ? "Verified" : "Unverified"}</Badge>
                </div>
              </div>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">Try Another Account</Button>
              </Link>
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
                <CardTitle className="text-2xl">No Salon Found</CardTitle>
                <CardDescription>Ready to start your digital journey?</CardDescription>
             </CardHeader>
             <CardContent>
                <Button className="w-full h-12 text-lg" onClick={openEditModal}>
                  Setup My Shop Now
                </Button>
             </CardContent>
          </Card>
        </main>
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

  const acceptedBookings = bookings?.filter(b => b.status === 'Accepted') || [];
  const revenue = acceptedBookings.length * 250;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mySalon.name} Dashboard</h1>
            <p className="text-muted-foreground">{mySalon.city}, {mySalon.state}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2" onClick={openEditModal}>
               <Scissors className="h-4 w-4" />
               Edit Details
             </Button>
             <Button 
              className="bg-primary text-white gap-2 shadow-md"
              onClick={handleRecharge}
              disabled={isRecharging}
             >
               {isRecharging ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
               Renew (₹200)
             </Button>
          </div>
        </div>

        {bookingsError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-8 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Permission error or missing index. If you just updated, please check your Firebase console for the composite index link.
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings?.filter(b => b.status === 'Pending').length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={mySalon.isPaid ? "bg-green-500" : "bg-destructive"}>
                {mySalon.isPaid ? "Public" : "Hidden"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">New Requests</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              {isBookingsLoading ? (
                <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
              ) : bookings?.filter(b => b.status === 'Pending').length ? (
                bookings.filter(b => b.status === 'Pending').map(booking => (
                  <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary">
                    <div className="flex flex-col md:flex-row p-6 items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">{booking.userName}</h3>
                        <p className="text-sm text-muted-foreground">{booking.userPhone}</p>
                        <Badge variant="secondary" className="mt-2">{booking.serviceName}</Badge>
                      </div>
                      <div className="mt-4 md:mt-0 flex gap-4 text-sm text-muted-foreground">
                        <div className="text-center">
                          <p>Date</p>
                          <p className="font-bold text-foreground">{booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d") : "N/A"}</p>
                        </div>
                        <div className="text-center">
                          <p>Time</p>
                          <p className="font-bold text-foreground">{booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "p") : "N/A"}</p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex gap-2">
                        <Button onClick={() => handleBookingAction(booking.id, 'Accepted')} className="bg-primary">Accept</Button>
                        <Button onClick={() => handleBookingAction(booking.id, 'Rejected')} variant="outline">Reject</Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-xl">
                   <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                   <h3 className="text-lg font-medium">No pending requests</h3>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="p-4 text-left">Customer</th>
                          <th className="p-4 text-left">Service</th>
                          <th className="p-4 text-left">Slot</th>
                          <th className="p-4 text-left">Status</th>
                          <th className="p-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bookings?.filter(b => b.status !== 'Pending').map(booking => (
                          <tr key={booking.id}>
                            <td className="p-4">{booking.userName}</td>
                            <td className="p-4">{booking.serviceName}</td>
                            <td className="p-4">
                              {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d, p") : "N/A"}
                            </td>
                            <td className="p-4">
                              <Badge variant={booking.status === 'Accepted' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                               {booking.status === 'Accepted' && (
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-destructive h-8"
                                   onClick={() => handleBookingAction(booking.id, 'NoShow')}
                                 >
                                   <Flag className="h-3.5 w-3.5 mr-1" /> No-Show
                                 </Button>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </CardContent>
            </Card>
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

function SalonEditDialog({ 
  isOpen, 
  onOpenChange, 
  formData, 
  setFormData, 
  onSave, 
  isSubmitting 
}: any) {
  const cities = formData.state ? INDIA_DATA[formData.state] || [] : [];

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
          <DialogTitle>Shop Profile</DialogTitle>
          <DialogDescription>Setup your business details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Salon Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Landmark</Label>
              <Input 
                value={formData.landmark} 
                onChange={(e) => setFormData({...formData, landmark: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input 
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})}
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
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold">Services</Label>
              <Button type="button" variant="outline" size="sm" onClick={addService}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {formData.services.map((s: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-end bg-muted/30 p-3 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input 
                      value={s.name} 
                      onChange={(e) => updateService(idx, 'name', e.target.value)}
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
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeService(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Shop"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
