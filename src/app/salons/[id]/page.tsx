"use client";

import { useState, useMemo, useEffect } from "react";
import { use } from "react";
import { Navbar } from "@/components/navbar";
import { MOCK_SALONS } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Scissors, IndianRupee, Star, Calendar as CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function SalonDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const salonRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "salons", params.id);
  }, [db, params.id]);

  const { data: dbSalon, isLoading: isSalonLoading } = useDoc(salonRef);

  const salon = useMemo(() => {
    if (dbSalon) return dbSalon;
    return MOCK_SALONS.find(s => s.id === params.id) || null;
  }, [dbSalon, params.id]);

  const handleBooking = async () => {
    if (!user || !salon || !selectedService || !date || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Missing Info",
        description: "Please select a service, date, and time slot.",
      });
      return;
    }

    setIsBooking(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const bookingDateTime = new Date(date);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: user.displayName || "Customer",
        userPhone: user.phoneNumber || "Not provided",
        salonId: salon.id,
        salonName: salon.name,
        salonOwnerId: salon.ownerId,
        serviceIds: [selectedService.name],
        serviceName: selectedService.name,
        requestedSlotDateTime: bookingDateTime.toISOString(),
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Booking Requested!",
        description: "Your request has been sent to the salon owner.",
      });
      router.push("/my-bookings");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Could not complete the request.",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isUserLoading || isSalonLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Salon not found</h1>
          <Button onClick={() => router.push("/")} className="mt-4">Back to Marketplace</Button>
        </main>
      </div>
    );
  }

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative h-64 md:h-96 w-full">
        <Image 
          src={salon.imageUrl || "https://picsum.photos/seed/salon1/1200/600"} 
          alt={salon.name} 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="container mx-auto">
            <Badge className="mb-4 bg-primary hover:bg-primary">Verified Outlet</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{salon.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base opacity-90">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {salon.address}</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current text-yellow-500" /> 4.8 (120+ reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Scissors className="h-6 w-6 text-primary" /> 
                Our Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {salon.services?.map((service: any, idx: number) => (
                  <Card 
                    key={idx} 
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedService?.name === service.name ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                    )}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" /> ~30 mins
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">₹{service.price}</div>
                        {selectedService?.name === service.name && (
                          <CheckCircle2 className="h-5 w-5 text-primary ml-auto mt-1" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="bg-muted/30 rounded-2xl p-6 border border-border">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> About this Salon
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {salon.description || "A premier grooming destination offering expert services in a comfortable environment. Our team of professionals is dedicated to providing the best experience tailored to your style."}
              </p>
              <div className="mt-6 flex flex-wrap gap-6 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">Opening Hours</span>
                  <span className="text-muted-foreground">Mon - Sun: 09:00 AM - 09:00 PM</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">Location</span>
                  <span className="text-muted-foreground">{salon.city}, {salon.state}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl border-primary/10">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>Select your preferred slot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">1. Choose Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-12",
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
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">2. Choose Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="h-10 text-xs"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedService && (
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary flex items-center gap-1">
                        <IndianRupee className="h-4 w-4" /> {selectedService.price}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                  onClick={handleBooking}
                  disabled={isBooking || !selectedService || !selectedTime}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : "Confirm Request"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
