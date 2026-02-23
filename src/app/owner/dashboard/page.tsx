
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
  Store
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, serverTimestamp } from "firebase/firestore";
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
      where("salonOwnerId", "==", user.uid)
    );
  }, [db, user?.uid]);

  const { data: rawBookings, isLoading: isBookingsLoading, error: bookingsError } = useCollection(bookingsQuery);

  // Client-side sorting for bookings
  const bookings = useMemo(() => {
    if (!rawBookings) return [];
    return [...rawBookings].sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  }, [rawBookings]);

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

  const isGmail = user?.email?.endsWith("@gmail.com");
  const isVerified = user?.emailVerified;
  const canAccess = user && isGmail && isVerified;

  // Render Logic
  const renderContent = () => {
    if (isUserLoading || isSalonLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-foreground font-medium">Loading Dashboard...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center bg-card">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Salon Owner Portal</CardTitle>
              <CardDescription className="text-foreground/60">Please sign in to manage your salon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login" className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      );
    }

    if (!canAccess) {
      return (
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-destructive/30 bg-card shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive font-bold">Verification Required</CardTitle>
              <CardDescription className="text-foreground/70">
                Use a verified Gmail account to list a salon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Email Provider</span>
                  <Badge variant={isGmail ? "default" : "destructive"}>{isGmail ? "Gmail" : "Other"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Verification</span>
                  <Badge variant={isVerified ? "default" : "destructive"}>{isVerified ? "Verified" : "Unverified"}</Badge>
                </div>
              </div>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full text-foreground hover:bg-muted">Try Another Account</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      );
    }

    if (!mySalon) {
      return (
        <>
          <main className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center py-8 bg-card border-primary/20 shadow-2xl">
              <CardHeader>
                <div className="mx-auto w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <Store className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">No Salon Found</CardTitle>
                <CardDescription className="text-foreground/70">Ready to start your digital journey?</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20" onClick={openEditModal}>
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
        </>
      );
    }

    const acceptedBookingsCount = bookings?.filter(b => b.status === 'Accepted').length || 0;
    const revenue = acceptedBookingsCount * 250;

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{mySalon.name} Dashboard</h1>
            <p className="text-foreground/70 font-medium">{mySalon.city}, {mySalon.state}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-primary/30 text-foreground hover:bg-muted" onClick={openEditModal}>
              <Scissors className="h-4 w-4 text-primary" />
              Edit Details
            </Button>
            <Button
              className="bg-primary text-white gap-2 shadow-lg shadow-primary/20"
              onClick={handleRecharge}
              disabled={isRecharging}
            >
              {isRecharging ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
              Renew (₹200)
            </Button>
          </div>
        </div>

        {bookingsError && (
          <div className="bg-destructive/20 border border-destructive/30 text-destructive p-4 rounded-lg mb-8 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            We encountered a sync issue. Please check your data.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{bookings?.filter(b => b.status === 'Pending').length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{bookings?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider">Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={mySalon.isPaid ? "bg-green-600 text-white" : "bg-destructive text-white"}>
                {mySalon.isPaid ? "Public" : "Hidden"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6 bg-muted/30 p-1 border border-border/50">
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-white">New Requests</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-white">History</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              {isBookingsLoading ? (
                <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
              ) : bookings?.filter(b => b.status === 'Pending').length ? (
                bookings.filter(b => b.status === 'Pending').map(booking => (
                  <Card key={booking.id} className="overflow-hidden border-l-4 border-l-primary bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col md:flex-row p-6 items-center justify-between gap-6">
                      <div className="space-y-1 w-full md:w-auto text-left">
                        <h3 className="text-xl font-extrabold text-foreground">{booking.userName}</h3>
                        <p className="text-sm font-medium text-foreground/70">{booking.userPhone}</p>
                        <Badge variant="secondary" className="mt-2 bg-muted text-foreground border-border/50">{booking.serviceName}</Badge>
                      </div>
                      <div className="flex gap-8 text-sm text-foreground/70 w-full md:w-auto justify-center">
                        <div className="text-center">
                          <p className="uppercase text-[10px] font-bold tracking-widest text-primary mb-1">Date</p>
                          <p className="font-bold text-foreground text-base">{booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d") : "N/A"}</p>
                        </div>
                        <div className="text-center">
                          <p className="uppercase text-[10px] font-bold tracking-widest text-primary mb-1">Time</p>
                          <p className="font-bold text-foreground text-base">{booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "p") : "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button onClick={() => handleBookingAction(booking.id, 'Accepted')} className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-bold">Accept</Button>
                        <Button onClick={() => handleBookingAction(booking.id, 'Rejected')} variant="outline" className="flex-1 md:flex-none text-foreground border-border/50 hover:bg-muted">Reject</Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-xl bg-card">
                  <AlertCircle className="h-10 w-10 text-primary mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-bold text-foreground/70">No pending requests</h3>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border/50">
                      <tr>
                        <th className="p-4 text-left font-bold text-foreground/70 uppercase text-[11px] tracking-wider">Customer</th>
                        <th className="p-4 text-left font-bold text-foreground/70 uppercase text-[11px] tracking-wider">Service</th>
                        <th className="p-4 text-left font-bold text-foreground/70 uppercase text-[11px] tracking-wider">Slot</th>
                        <th className="p-4 text-left font-bold text-foreground/70 uppercase text-[11px] tracking-wider">Status</th>
                        <th className="p-4 text-left font-bold text-foreground/70 uppercase text-[11px] tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {bookings?.filter(b => b.status !== 'Pending').map(booking => (
                        <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4 font-semibold text-foreground">{booking.userName}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="font-normal border-border/50 text-foreground/80">{booking.serviceName}</Badge>
                          </td>
                          <td className="p-4 text-foreground/80">
                            {booking.requestedSlotDateTime ? format(parseISO(booking.requestedSlotDateTime), "MMM d, p") : "N/A"}
                          </td>
                          <td className="p-4">
                            <Badge variant={booking.status === 'Accepted' ? 'default' : 'secondary'} className={booking.status === 'Accepted' ? 'bg-green-600 text-white' : 'bg-muted text-foreground'}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {booking.status === 'Accepted' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 h-8 font-bold"
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
    );
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col antialiased">
      <Navbar />
      {renderContent()}
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

  const removeService = (idx: number) => {
    const updated = [...formData.services];
    updated.splice(idx, 1);
    setFormData({ ...formData, services: updated });
  };

  const updateService = (idx: number, field: string, value: any) => {
    const updated = [...formData.services];
    updated[idx] = { ...updated[idx], [field]: field === 'price' ? Number(value) : value };
    setFormData({ ...formData, services: updated });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark bg-background text-foreground border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-foreground">Shop Profile</DialogTitle>
          <DialogDescription className="text-foreground/70">Setup your business details for the marketplace.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-foreground/90">Salon Name</Label>
              <Input
                className="bg-muted/10 border-border/50 text-foreground focus:border-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-foreground/90">Landmark</Label>
              <Input
                className="bg-muted/10 border-border/50 text-foreground focus:border-primary"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-foreground/90">Address</Label>
            <Input
              className="bg-muted/10 border-border/50 text-foreground focus:border-primary"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-foreground/90">State</Label>
              <Select
                value={formData.state}
                onValueChange={(val) => setFormData({ ...formData, state: val, city: "" })}
              >
                <SelectTrigger className="bg-muted/10 border-border/50 text-foreground">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent className="dark bg-card text-foreground border-border/50">
                  {INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-foreground/90">City</Label>
              <Select
                value={formData.city}
                onValueChange={(val) => setFormData({ ...formData, city: val })}
                disabled={!formData.state}
              >
                <SelectTrigger className="bg-muted/10 border-border/50 text-foreground">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent className="dark bg-card text-foreground border-border/50">
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <Label className="text-xl font-extrabold text-foreground">Services Menu</Label>
              <Button type="button" variant="outline" size="sm" onClick={addService} className="border-primary/50 text-primary hover:bg-primary/10">
                <Plus className="h-4 w-4 mr-1" /> Add Service
              </Button>
            </div>
            <div className="space-y-3">
              {formData.services.map((s: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-end bg-muted/5 p-4 rounded-xl border border-border/30">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Service Name</Label>
                    <Input
                      className="bg-background border-border/50 text-foreground h-9"
                      value={s.name}
                      placeholder="e.g., Haircut"
                      onChange={(e) => updateService(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Price (₹)</Label>
                    <Input
                      type="number"
                      className="bg-background border-border/50 text-foreground h-9"
                      value={s.price}
                      onChange={(e) => updateService(idx, 'price', e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-9 w-9" onClick={() => removeService(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.services.length === 0 && (
                <p className="text-center text-sm text-foreground/50 italic py-4">No services added yet.</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0 border-t border-border/30 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-foreground border-border/50">Cancel</Button>
          <Button onClick={onSave} disabled={isSubmitting} className="font-bold bg-primary text-white shadow-lg shadow-primary/20">
            {isSubmitting ? "Saving..." : "Save Shop Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
