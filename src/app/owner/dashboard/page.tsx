
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_SALONS, MOCK_BOOKINGS, Booking } from "@/app/lib/mock-data";
import { Check, X, Flag, AlertCircle, TrendingUp, Users, Calendar, Scissors, IndianRupee, Mail, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import Link from "next/link";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const mySalon = MOCK_SALONS[0]; // Simulation for current owner

  const handleAction = (id: string, action: 'Accepted' | 'Rejected' | 'NoShow') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    
    const messages = {
      Accepted: "SMS sent to Rahul with your address and landmark.",
      Rejected: " राहुल was notified and suggested other nearby shops.",
      NoShow: "User flagged for no-show. 3 flags will lead to a 30-day ban."
    };

    toast({
      title: `Booking ${action}`,
      description: messages[action],
    });
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Verification Logic: Must be Gmail AND must be verified
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
                <p className="text-center text-xs text-muted-foreground">
                  Current: {user.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage {mySalon.name} • {mySalon.city}</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2">
               <Scissors className="h-4 w-4" />
               Edit Shop Details
             </Button>
             <Button className="bg-primary text-white gap-2">
               <IndianRupee className="h-4 w-4" />
               Pay Subscription (₹200)
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12,450</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+12 since yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+18</div>
              <p className="text-xs text-muted-foreground">New visitors this week</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Badge className="bg-green-500">Live</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Expires in 12 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-6 h-12">
            <TabsTrigger value="requests" className="px-6">Booking Requests</TabsTrigger>
            <TabsTrigger value="history" className="px-6">Appointment History</TabsTrigger>
            <TabsTrigger value="services" className="px-6">My Services</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'Pending').map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{booking.userName}</h3>
                          <p className="text-sm text-muted-foreground">{booking.userPhone}</p>
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
                          <p className="font-semibold">{booking.date}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Time Slot</p>
                          <p className="font-semibold">{booking.time}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-6 flex items-center gap-3 border-t md:border-t-0 md:border-l">
                      <Button 
                        onClick={() => handleAction(booking.id, 'Accepted')}
                        className="bg-primary hover:bg-primary/90 flex-1 gap-2"
                      >
                        <Check className="h-4 w-4" /> Accept
                      </Button>
                      <Button 
                        onClick={() => handleAction(booking.id, 'Rejected')}
                        variant="outline" 
                        className="border-destructive text-destructive hover:bg-destructive/10 flex-1 gap-2"
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {bookings.filter(b => b.status === 'Pending').length === 0 && (
                <div className="py-20 text-center border-2 border-dashed rounded-xl">
                   <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                   <h3 className="text-lg font-medium">No pending requests</h3>
                   <p className="text-muted-foreground">We'll notify you when someone books an appointment.</p>
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
                          <th className="p-4 text-left font-medium">Customer</th>
                          <th className="p-4 text-left font-medium">Service</th>
                          <th className="p-4 text-left font-medium">Date/Time</th>
                          <th className="p-4 text-left font-medium">Status</th>
                          <th className="p-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bookings.filter(b => b.status !== 'Pending').map(booking => (
                          <tr key={booking.id} className="hover:bg-muted/20">
                            <td className="p-4">
                              <div className="font-medium">{booking.userName}</div>
                              <div className="text-xs text-muted-foreground">{booking.userPhone}</div>
                            </td>
                            <td className="p-4">{booking.serviceName}</td>
                            <td className="p-4">
                              <div>{booking.date}</div>
                              <div className="text-xs text-muted-foreground">{booking.time}</div>
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
                                   className="text-destructive gap-1"
                                   onClick={() => handleAction(booking.id, 'NoShow')}
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
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mySalon.services.map((s, idx) => (
                   <Card key={idx} className="relative group">
                      <CardHeader className="pb-2">
                        <CardTitle>{s.name}</CardTitle>
                        <CardDescription>Base price for standard service</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">₹{s.price}</div>
                      </CardContent>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
                      </div>
                   </Card>
                ))}
                <Button variant="outline" className="h-32 border-dashed border-2 flex flex-col gap-2">
                   <div className="rounded-full bg-primary/10 p-2">
                     <Scissors className="h-6 w-6 text-primary" />
                   </div>
                   Add New Service
                </Button>
             </div>
          </TabsContent>
        </Tabs>

        {/* Visibility Info */}
        <div className="mt-12 rounded-xl bg-orange-50 border border-orange-100 p-6 flex flex-col md:flex-row items-center gap-6">
           <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center text-white shrink-0">
              <IndianRupee className="h-8 w-8" />
           </div>
           <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900">Visibility Maintenance</h3>
              <p className="text-sm text-orange-800">
                Your shop is currently <strong>Active</strong> and visible to the public. 
                Next payment of ₹200 is due on <strong>June 15, 2024</strong>. 
                Keep it active to appear in search results.
              </p>
           </div>
           <Button className="bg-accent hover:bg-accent/90 text-white whitespace-nowrap">
             Recharge Subscription
           </Button>
        </div>
      </main>
    </div>
  );
}
