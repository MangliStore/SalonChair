
"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_SALONS, Salon } from "@/app/lib/mock-data";
import { ShieldCheck, CheckCircle, XCircle, BarChart3, Users, Building, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [salons, setSalons] = useState<Salon[]>(MOCK_SALONS);

  const toggleAuthorization = (id: string, status: boolean) => {
    setSalons(prev => prev.map(s => s.id === id ? { ...s, isAuthorized: status } : s));
    toast({
      title: status ? "Salon Approved" : "Salon Rejected",
      description: `Verification status updated successfully.`,
    });
  };

  const togglePayment = (id: string) => {
    setSalons(prev => prev.map(s => s.id === id ? { ...s, isPaid: !s.isPaid } : s));
    toast({
      title: "Manual Visibility Override",
      description: "Visibility status toggled for the salon outlet.",
    });
  };

  const revenue = salons.filter(s => s.isPaid).length * 200;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Control Center</h1>
            <p className="text-muted-foreground">Verification, Revenue & Network Health</p>
          </div>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-primary text-white border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Revenue (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter">₹{revenue.toLocaleString()}</div>
              <p className="text-xs text-white/60 mt-1">Based on {salons.filter(s => s.isPaid).length} active subscriptions</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-accent">
                {salons.filter(s => !s.isAuthorized).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">New shops waiting for address check</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tighter text-destructive">12</div>
              <p className="text-xs text-muted-foreground mt-1">Users with 3+ no-show flags</p>
            </CardContent>
          </Card>
        </div>

        {/* Salon Verification List */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Verification Queue</h2>
          </div>
          
          <div className="space-y-4">
            {salons.map(salon => (
              <Card key={salon.id} className="overflow-hidden border-none shadow-md">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                           <Building className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{salon.name}</h3>
                          <p className="text-sm text-muted-foreground">{salon.ownerId} • Registered 2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {salon.isAuthorized ? (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-green-200">
                             <CheckCircle className="h-3 w-3 mr-1" /> Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/10 border-yellow-200">
                             <AlertTriangle className="h-3 w-3 mr-1" /> Pending Check
                          </Badge>
                        )}
                        <Badge variant={salon.isPaid ? 'default' : 'secondary'} className={salon.isPaid ? 'bg-primary' : ''}>
                          {salon.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <Eye className="h-4 w-4" /> Address & Landmark
                        </div>
                        <p className="pl-6 text-foreground font-medium leading-relaxed">
                          {salon.address}<br />
                          <span className="text-accent">Landmark: {salon.landmark}</span>
                        </p>
                      </div>
                      <div className="flex justify-end items-center gap-3">
                         {!salon.isAuthorized ? (
                           <Button onClick={() => toggleAuthorization(salon.id, true)} className="bg-primary hover:bg-primary/90">
                             Verify & Approve
                           </Button>
                         ) : (
                           <Button onClick={() => toggleAuthorization(salon.id, false)} variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                             Revoke Authorization
                           </Button>
                         )}
                         <Button variant="ghost" size="icon" onClick={() => togglePayment(salon.id)} title="Manual Visibility Override">
                            {salon.isPaid ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-primary" />}
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* System Logs / Alerts */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-bold">Automatic Hide Engine Alerts</h2>
          </div>
          <Card className="bg-destructive/5 border-destructive/20">
             <CardContent className="p-6">
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm py-2 border-b border-destructive/10">
                      <span className="font-medium">Star Salon (Mumbai)</span>
                      <span className="text-destructive">Auto-Hidden: 31 days unpaid</span>
                      <Button variant="link" className="h-auto p-0 text-destructive text-xs">Notify Owner</Button>
                   </div>
                   <div className="flex items-center justify-between text-sm py-2 border-b border-destructive/10">
                      <span className="font-medium">Modern Cuts (Delhi)</span>
                      <span className="text-destructive">Auto-Hidden: 33 days unpaid</span>
                      <Button variant="link" className="h-auto p-0 text-destructive text-xs">Notify Owner</Button>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
