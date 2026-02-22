
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MOCK_SALONS } from "@/app/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, Calendar as CalendarIcon, ChevronLeft, Loader2, Check } from "lucide-react";
import Image from "next/image";
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

  const salonRef = useMemoFirebase(() => (id ? doc(db, "salons", id as string) : null), [db, id]);
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

  const salon = liveSalon || MOCK_SALONS.find((s) => s.id === id);

  if (isUserLoading || !user || isSalonLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground font-medium">Loading salon details...</p>
      </div>
    );
  }

  if (!salon) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-10 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Salon not found</h1>
          <Button variant="outline" onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    </div>
  );

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    // Explicit Step-by-Step Validation
    if (!selectedService) {
      toast({
        title: "Step 1 Missing",
        description: "Please tap on a service card from the list to select it.",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Step 2 Missing",
        description: "Please select an appointment date from the calendar.",
        variant: "destructive",
      });
      return;
    }

    if (!time) {
      toast({
        title: "Step 3 Missing",
        description: "Please pick a specific time slot.",
        variant: "destructive",
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
        salonOwnerId: salon.ownerId,
        serviceIds: [selectedService],
        serviceName: selectedService,
        requestedSlotDateTime: finalDateTime,
        requestInitiatedDateTime: new Date().toISOString(),
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      addDocumentNonBlocking(collection(db, "bookings"), bookingData);

      toast({
        title: "Success!",
        description: `Your booking request for ${selectedService} has been sent.`,
      });
      
      router.push("/my-bookings");
    } catch (error: any) {
      console.error("Booking submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Something went wrong while processing your request. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Search
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-[350px] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <Image
                src={salon.imageUrl || `https://picsum.photos/seed/${salon.id}/600/400`}
                alt={salon.name}
                fill
                className="object-cover"
                data-ai-hint="salon interior"
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">1. Select a Service</h2>
                  {selectedService && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                      <Check className="h-3 w-3" /> Selected
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {salon.services?.map((service: any, idx: number) => (
                    <Card
                      key={idx}
                      className={cn(
                        "cursor-pointer transition-all border-2 relative",
                        selectedService === service.name
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md"
                          : "border-transparent hover:border-primary/20 hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedService(service.name)}
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-bold">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.durationMinutes || 30} mins</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">₹{service.price}</p>
                          {selectedService === service.name && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!salon.services || salon.services.length === 0) && (
                    <p className="col-span-full text-muted-foreground italic">No services listed for this salon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-2xl border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary text-white">
                <CardTitle>Schedule Appointment</CardTitle>
                <CardDescription className="text-white/80">Choose your date and time</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-[10px]">2</span>
                      Select Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full h-12 justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-[10px]">3</span>
                      Pick a Slot
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM", "05:30 PM", "07:00 PM", "08:30 PM"].map((t) => (
                        <Button
                          key={t}
                          type="button"
                          variant={time === t ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTime(t)}
                          className={cn(time === t ? "bg-primary text-white" : "hover:border-primary/50")}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-bold">{selectedService || "Not selected"}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-bold">{date ? format(date, "MMM dd, yyyy") : "Not selected"}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-bold">{time || "Not selected"}</span>
                       </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-primary hover:bg-primary/90 shadow-lg text-lg font-bold transition-all active:scale-[0.98]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                        </span>
                      ) : (
                        "Confirm Request"
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground leading-tight italic">
                      Requesting a slot does not guarantee an appointment. The owner will notify you if they accept or reject.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
