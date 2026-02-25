
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Building, Eye, EyeOff, Lock, Loader2, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";
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
    <div className="min-h-screen bg-background">
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
          <Card className="bg-primary text-white border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Est. Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter">₹{revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-orange-500">
                {salons.filter(s => !s.isAuthorized).length}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listed Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter">{salons.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Verification Queue</h2>
          </div>
          
          <div className="space-y-4">
            {isSalonsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : salons.map(salon => (
              <Card key={salon.id} className="overflow-hidden border-none shadow-md">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{salon.name || "Untitled Salon"}</h3>
                        <p className="text-xs text-muted-foreground font-mono">ID: {salon.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={salon.isAuthorized ? 'default' : 'secondary'} className={salon.isAuthorized ? 'bg-green-500' : 'bg-yellow-500'}>
                        {salon.isAuthorized ? 'Approved' : 'Pending Review'}
                      </Badge>
                      <Badge variant={salon.isPaid ? 'default' : 'secondary'} className={salon.isPaid ? 'bg-blue-500' : 'bg-red-500'}>
                        {salon.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/30 p-4 rounded-lg space-y-1">
                      <p className="font-bold text-[10px] uppercase text-muted-foreground mb-2">Location & Landmark</p>
                      <p className="text-sm font-medium">{salon.address}</p>
                      <p className="text-sm text-primary font-bold">Landmark: {salon.landmark || "Not provided"}</p>
                      <p className="text-sm text-muted-foreground">{salon.city}, {salon.state}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <Button 
                        variant={salon.isAuthorized ? "outline" : "default"} 
                        className={!salon.isAuthorized ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        onClick={() => toggleAuthorization(salon.id, !salon.isAuthorized)}
                      >
                        {salon.isAuthorized ? (
                          <><XCircle className="mr-2 h-4 w-4" /> Revoke Approval</>
                        ) : (
                          <><CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Approve</>
                        )}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={() => togglePayment(salon.id, !!salon.isPaid)}
                        title="Toggle Payment Status"
                      >
                        {salon.isPaid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {salons.length === 0 && !isSalonsLoading && (
              <div className="py-20 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                No salons found in the registry.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
