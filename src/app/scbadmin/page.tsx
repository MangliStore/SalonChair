
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Building, 
  Eye, 
  EyeOff, 
  Lock, 
  Loader2, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  User as UserIcon, 
  Mail, 
  Users,
  Search
} from "lucide-react";
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
  const [userSearch, setUserSearch] = useState("");

  const salonsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "salons");
  }, [db]);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: dbSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);
  const { data: dbUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const salons = useMemo(() => dbSalons || [], [dbSalons]);
  const users = useMemo(() => dbUsers || [], [dbUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.name?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

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
    <div className="min-h-screen bg-gray-50 pb-20">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-primary text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <CreditCard className="h-32 w-32 rotate-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-white/80">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">₹{revenue.toLocaleString()}</div>
              <p className="text-[10px] text-white/60 mt-1">From {salons.filter(s => s.isPaid).length} paid shops</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter text-orange-500">
                {salons.filter(s => !s.isAuthorized).length}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Waiting for approval</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active Salons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter text-green-600">
                {salons.filter(s => s.isAuthorized && s.isPaid).length}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Verified & Paid</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter text-blue-600">
                {users.length}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Total login accounts</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verification" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-2xl border h-14 w-full max-w-md shadow-sm">
            <TabsTrigger value="verification" className="rounded-xl flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <ShieldCheck className="h-4 w-4" /> Salon Queue
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4" /> User Registry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6 outline-none">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-800">Shop Verification Queue</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {isSalonsLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                </div>
              ) : salons.length > 0 ? (
                salons.map(salon => (
                  <Card key={salon.id} className="overflow-hidden border-none shadow-md rounded-[2.5rem] hover:shadow-xl transition-shadow bg-white">
                    <div className="p-8">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
                        <div className="flex items-center gap-6">
                          <div className="relative h-28 w-28 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden shadow-inner">
                            {salon.imageUrl ? (
                              <Image src={salon.imageUrl} alt={salon.name} fill className="object-cover" />
                            ) : (
                              <Building className="h-10 w-10 text-primary opacity-20" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-3xl font-black text-gray-900 leading-tight">{salon.name || "Untitled Salon"}</h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none gap-1.5 px-3 py-1">
                                <UserIcon className="h-3 w-3" /> {salon.ownerName || "Unknown Owner"}
                              </Badge>
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-none gap-1.5 px-3 py-1">
                                <Mail className="h-3 w-3" /> {salon.ownerEmail || "No Email"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Ref:</p>
                              <Badge variant="outline" className="font-mono text-[10px] font-black border-primary/20 text-primary bg-primary/5">
                                SC_{salon.ownerId?.substring(0, 8)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={salon.isAuthorized ? 'bg-green-600 rounded-full' : 'bg-orange-500 rounded-full'}>
                            {salon.isAuthorized ? 'Approved' : 'Review Required'}
                          </Badge>
                          <Badge className={salon.isPaid ? 'bg-blue-600 rounded-full' : 'bg-red-500 rounded-full'}>
                            {salon.isPaid ? 'Paid' : 'Payment Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                          <p className="font-black text-[10px] uppercase text-gray-400 mb-4 tracking-widest">Location Details</p>
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-800 leading-relaxed">{salon.address}</p>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">Landmark</span>
                              <span className="font-medium">{salon.landmark || "N/A"}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">{salon.city}, {salon.state}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-center gap-4">
                          <div className="flex gap-3">
                            <Button 
                              variant={salon.isAuthorized ? "outline" : "default"} 
                              className={`flex-1 h-14 rounded-2xl font-bold text-lg ${!salon.isAuthorized ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100" : ""}`}
                              onClick={() => toggleAuthorization(salon.id, !salon.isAuthorized)}
                            >
                              {salon.isAuthorized ? (
                                <><XCircle className="mr-2 h-5 w-5" /> Revoke Approval</>
                              ) : (
                                <><CheckCircle2 className="mr-2 h-5 w-5" /> Approve Shop</>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              className={`h-14 w-14 rounded-2xl p-0 border-2 ${salon.isPaid ? "border-blue-200 text-blue-600" : "border-red-200 text-red-600"}`}
                              onClick={() => togglePayment(salon.id, !!salon.isPaid)}
                            >
                              {salon.isPaid ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                            </Button>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold italic text-center">
                            * Confirm ₹200 Payment with Ref: SC_{salon.ownerId?.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-[3rem] bg-white text-muted-foreground">
                  <Building className="h-16 w-16 mx-auto mb-4 opacity-5" />
                  <p className="text-xl font-bold">No shops in the verification queue.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 outline-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-800">Registered Users Directory</h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-10 h-10 rounded-xl"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                {isUsersLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b">
                          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Full Name</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Gmail Address</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Owner Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {user.name?.charAt(0) || "U"}
                                </div>
                                <span className="font-bold text-gray-900">{user.name || "Anonymous"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                {user.email}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {user.isSalonOwner ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full px-4">Salon Owner</Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-full px-4 text-gray-400 border-gray-200">Customer</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground font-medium">No users found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
