
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
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SalonDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const salonRef = useMemoFirebase(() => id ? doc(db, "salons", id as string) : null, [db, id]);
  const { data: liveSalon, isLoading: isSalonLoading } = useDoc(salonRef);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Fallback to mock if live data isn't available yet or document doesn't exist
  const salon = liveSalon || MOCK_SALONS.find(s => s.id === id);

  if (isUserLoading || !user || isSalonLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!salon) return <div className="p-10 text-center">Salon not found</div>;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time || !user) {
      toast({
        title: "Missing Info",
        description: "Select service, date, and time.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
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
        userName: user.displayName || user.email || "User",
        userPhone: user.phoneNumber || "",
        salonId: salon.id,
        salonName: salon.name,
        salonOwnerId: salon.ownerId, // Crucial for security rules & dashboard query
        serviceIds: [selectedService],
        serviceName: selectedService,
        requestedSlotDateTime: finalDateTime,
        requestInitiatedDateTime: new Date().toISOString(),
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      addDocumentNonBlocking(collection(db, "bookings"), bookingData);

      toast({
        title: "Booking Requested",
        description: `Request sent to ${salon.name}.`,
      });
      router.push("/my-bookings");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not submit request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 gap-2">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[350px] w-full rounded-2xl overflow-hidden shadow-xl">
              <Image 
                src={salon.imageUrl || "https://picsum.photos/seed/salon/600/400"} 
                alt={salon.name} 
                fill 
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{salon.name}</h1>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{salon.address}</span>
                  </div>
                  {salon.landmark && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-accent" />
                      <span>Landmark: {salon.landmark}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Services</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {salon.services?.map((service: any, idx: number) => (
                    <Card 
                      key={idx} 
                      className={cn(
                        "cursor-pointer transition-all border-2", 
                        selectedService === service.name ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedService(service.name)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="font-medium">{service.name}</div>
                        <div className="font-bold text-primary">₹{service.price}</div>
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
                <CardTitle>Book Slot</CardTitle>
                <CardDescription className="text-white/80">Choose your preferred time</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["10:00 AM", "11:30 AM", "01:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"].map(t => (
                        <Button
                          key={t}
                          type="button"
                          variant={time === t ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTime(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Requesting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
