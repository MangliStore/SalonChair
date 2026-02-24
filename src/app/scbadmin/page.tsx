
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle, BarChart3, Building, AlertTriangle, Eye, EyeOff, Lock, Loader2, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
    toast({ title: status ? "Salon Approved" : "Salon Rejected", description: "Status updated successfully." });
  };

  const togglePayment = (id: string, currentPaid: boolean) => {
    if (!db) return;
    updateDocumentNonBlocking(doc(db, "salons", id), { isPaid: !currentPaid });
    toast({ title: "Payment Overridden" });
  };

  const revenue = salons.filter(s => s.isPaid).length * 200;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4"><Lock className="h-6 w-6 text-primary" /></div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>Enter the master password to access the control center</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" /></div>
                <Button type="submit" className="w-full h-12 text-lg">Unlock Dashboard</Button>
              </form>
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
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Control Center</h1>
            <p className="text-muted-foreground">Verification & Network Health</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}><RefreshCcw className="h-4 w-4" /> Refresh Data</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary text-white border-none shadow-xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-white/80">Est. Monthly Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold tracking-tighter">₹{revenue.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold tracking-tighter text-orange-500">{salons.filter(s => !s.isAuthorized).length}</div></CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Shops</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold tracking-tighter">{salons.length}</div></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /><h2 className="text-2xl font-bold">Verification Queue</h2></div>
          
          <div className="space-y-4">
            {isSalonsLoading ? (
              <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>
            ) : salons.map(salon => (
              <Card key={salon.id} className="overflow-hidden border-none shadow-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Building className="h-6 w-6 text-muted-foreground" /></div>
                      <div>
                        <h3 className="text-xl font-bold">{salon.name}</h3>
                        <p className="text-sm text-muted-foreground">Owner: {salon.ownerId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={salon.isAuthorized ? 'default' : 'secondary'} className={salon.isAuthorized ? 'bg-green-500' : 'bg-yellow-500'}>{salon.isAuthorized ? 'Approved' : 'Pending Review'}</Badge>
                      <Badge variant={salon.isPaid ? 'default' : 'secondary'} className={salon.isPaid ? 'bg-blue-500' : 'bg-red-500'}>{salon.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="font-bold text-xs uppercase text-muted-foreground mb-2">Location Details</p>
                      <p className="font-medium">{salon.address}</p>
                      <p className="text-blue-600 font-bold mt-1">Landmark: {salon.landmark}</p>
                      <p className="text-muted-foreground">{salon.city}, {salon.state}</p>
                    </div>
                    <div className="flex justify-end items-center gap-3">
                      <Button 
                        variant={salon.isAuthorized ? "destructive" : "default"} 
                        onClick={() => toggleAuthorization(salon.id, !salon.isAuthorized)}
                      >
                        {salon.isAuthorized ? 'Revoke Approval' : 'Verify & Approve'}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => togglePayment(salon.id, salon.isPaid)} title="Toggle Payment Status">
                        {salon.isPaid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {salons.length === 0 && !isSalonsLoading && (
              <div className="py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">No salons registered in the system.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
