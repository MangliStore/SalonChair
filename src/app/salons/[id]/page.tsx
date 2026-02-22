
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MOCK_SALONS, Salon } from "@/app/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Info, Calendar as CalendarIcon, Clock, ChevronLeft, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SalonDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const found = MOCK_SALONS.find(s => s.id === id);
    if (found) setSalon(found);
  }, [id]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!salon) return <div className="p-10 text-center">Loading...</div>;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time || !user) {
      toast({
        title: "Missing Information",
        description: "Please select a service, date, and time.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a date-time string for the requested slot
      // date is the Date object, time is like "10:00 AM"
      const timeDate = parse(time, "hh:mm a", new Date());
      const finalDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        timeDate.getHours(),
        timeDate.getMinutes()
      ).toISOString();

      const bookingData = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        salonId: salon.id,
        salonName: salon.name,
        salonOwnerId: salon.ownerId,
        serviceIds: [selectedService], // Simplification: just one for now
        serviceName: selectedService,
        requestedSlotDateTime: finalDateTime,
        requestInitiatedDateTime: new Date().toISOString(),
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

      toast({
        title: "Booking Requested",
        description: `Your request for ${selectedService} at ${salon.name} has been sent. Check "My Bookings" for status updates.`,
      });
      router.push("/my-bookings");
    } catch (error: any) {
      console.error("Booking Error:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Could not submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-primary">
          <ChevronLeft className="h-4 w-4" />
          Back to Listings
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[350px] w-full rounded-2xl overflow-hidden shadow-xl">
              <Image 
                src={salon.imageUrl} 
                alt={salon.name} 
                fill 
                className="object-cover"
                data-ai-hint="salon interior"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold tracking-tight">{salon.name}</h1>
                  <Badge className="bg-primary text-white">Verified Shop</Badge>
                </div>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{salon.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-accent" />
                    <span className="font-medium text-foreground italic">Landmark: {salon.landmark}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Scissors className="h-6 w-6 text-primary" />
                  Service Menu
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {salon.services.map((service, idx) => (
                    <Card 
                      key={idx} 
                      className={cn(
                        "cursor-pointer transition-all border-2", 
                        selectedService === service.name ? "border-primary bg-primary/5 shadow-md" : "border-transparent hover:border-muted hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedService(service.name)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-lg font-bold text-primary">₹{service.price}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-2xl border-primary/10">
              <CardHeader className="bg-primary text-white rounded-t-lg">
                <CardTitle className="text-xl">Request Appointment</CardTitle>
                <CardDescription className="text-white/80">Choose your preferred slot below</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Selected Service</Label>
                    <Input 
                      value={selectedService || "Select from menu..."} 
                      disabled 
                      className="bg-muted font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"].map(t => (
                        <Button
                          key={t}
                          type="button"
                          variant={time === t ? "default" : "outline"}
                          size="sm"
                          className={cn("text-xs", time === t && "bg-accent hover:bg-accent/90 border-accent")}
                          onClick={() => setTime(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Convenience Fee</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total (Pay at shop)</span>
                      <span className="text-primary">₹{selectedService ? salon.services.find(s => s.name === selectedService)?.price : 0}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Requesting..." : "Request Appointment"}
                  </Button>
                </form>
                
                <div className="rounded-lg bg-accent/10 p-4 flex gap-3">
                   <CreditCard className="h-5 w-5 text-accent shrink-0" />
                   <p className="text-xs text-accent-foreground">
                     By requesting, you agree to show up on time. No-shows are flagged by shop owners.
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
