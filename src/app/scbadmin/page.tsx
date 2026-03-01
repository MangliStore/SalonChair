
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Building, Eye, EyeOff, Lock, Loader2, RefreshCcw, CheckCircle2, XCircle, CreditCard, User, Mail, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";

export default function AdminDashboard() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const salonsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "salons");
  }, [db]);

  const { data: dbSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);
  const salons = useMemo(() => dbSalons || [], [dbSalons]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Jumbopack@1137") {
      setIsAuthenticated(true);
      toast({ title: "Access Granted", description: "Welcome back, Administrator." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Incorrect password." });
    }
  };

  const toggleAuthorization = (id: string, status: boolean) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "salons", id), { isAuthorized: status });
    toast({ 
      title: status ? "Salon Approved" : "Approval Revoked", 
      description: `Shop status updated successfully.` 
    });
  };

  const togglePayment = (id: string, currentPaid: boolean) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "salons", id), { isPaid: !currentPaid });
    toast({ title: "Payment Status Updated" });
  };

  const revenue = salons.filter(s => s.isPaid).length * 200;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Control Login</CardTitle>
              <CardDescription>Master password required for verification access</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-12"
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg">Unlock Control Center</Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Control Center</h1>
            <p className="text-muted-foreground">Manage salon network health and verifications.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4" /> Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <CreditCard className="h-32 w-32 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">₹{revenue.toLocaleString()}</div>
              <p className="text-xs text-white/60 mt-2">From {salons.filter(s => s.isPaid).length} active subscriptions</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter text-orange-500">
                {salons.filter(s => !s.isAuthorized).length}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Waiting for landmark & ID check</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listed Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">{salons.length}</div>
              <p className="text-xs text-muted-foreground mt-2">In the national registry</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-800">Verification Queue</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {isSalonsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : salons.map(salon => (
              <Card key={salon.id} className="overflow-hidden border-none shadow-md rounded-3xl hover:shadow-xl transition-shadow bg-white">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden shadow-inner">
                        {salon.imageUrl ? (
                          <Image src={salon.imageUrl} alt={salon.name} fill className="object-cover" />
                        ) : (
                          <Building className="h-10 w-10 text-primary opacity-20" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-gray-900 leading-tight">{salon.name || "Untitled Salon"}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-lg">
                            <User className="h-3 w-3" /> {salon.ownerName || "Unknown"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-lg">
                            <Mail className="h-3 w-3" /> {salon.ownerEmail || "No Email"}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment ID:</p>
                            <Badge variant="outline" className="font-mono text-[10px] font-black border-primary/20 text-primary">
                              SC_{salon.ownerId?.substring(0, 8)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={salon.isAuthorized ? 'default' : 'secondary'} className={salon.isAuthorized ? 'bg-green-500 rounded-full' : 'bg-yellow-500 rounded-full'}>
                        {salon.isAuthorized ? 'Approved' : 'Pending Review'}
                      </Badge>
                      <Badge variant={salon.isPaid ? 'default' : 'secondary'} className={salon.isPaid ? 'bg-blue-500 rounded-full' : 'bg-red-500 rounded-full'}>
                        {salon.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100">
                      <p className="font-black text-[10px] uppercase text-gray-400 mb-3 tracking-widest">Location & Review</p>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed">{salon.address}</p>
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                          <span className="bg-primary/10 px-2 py-0.5 rounded text-[10px] uppercase">Landmark</span>
                          {salon.landmark || "Not provided"}
                        </div>
                        <p className="text-xs text-muted-foreground">{salon.city}, {salon.state}</p>
                        {salon.description && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">About</p>
                            <p className="text-xs text-gray-600 line-clamp-2 italic">{salon.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end gap-4">
                      <div className="flex gap-3 w-full">
                        <Button 
                          variant={salon.isAuthorized ? "outline" : "default"} 
                          className={`flex-1 h-12 rounded-2xl font-bold ${!salon.isAuthorized ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100" : ""}`}
                          onClick={() => toggleAuthorization(salon.id, !salon.isAuthorized)}
                        >
                          {salon.isAuthorized ? (
                            <><XCircle className="mr-2 h-5 w-5" /> Revoke Approval</>
                          ) : (
                            <><CheckCircle2 className="mr-2 h-5 w-5" /> Verify & Approve</>
                          )}
                        </Button>
                        <Button 
                          variant="secondary" 
                          className="h-12 w-12 rounded-2xl p-0"
                          onClick={() => togglePayment(salon.id, !!salon.isPaid)}
                          title="Toggle Payment Status"
                        >
                          {salon.isPaid ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold italic text-right">
                        * Verify Payment Ref (SC_{salon.ownerId?.substring(0, 8)}) in UPI logs before approval.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {salons.length === 0 && !isSalonsLoading && (
              <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-white text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-10" />
                <p className="font-bold">No salons found in the registry.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
