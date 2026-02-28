
"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false }); 
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { QrCode, Loader2, CheckCircle, ShieldCheck, CreditCard, ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  // --- PAYMENT SETTINGS ---
  const myUpiId = "7842831137@ybl"; 
  const amount = "200";
  const businessName = "Salon Chair";

  const salonRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "salons", user.uid);
  }, [db, user?.uid]);

  const { data: salon, isLoading: isSalonLoading } = useDoc(salonRef);

  // Construct the UPI link with unique transaction note
  const upiUrl = user 
    ? `upi://pay?pa=${myUpiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=SC_${user.uid.substring(0, 8)}`
    : "";

  if (isUserLoading || isSalonLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">Syncing activation status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center">
        
        {salon?.isPaid && salon?.isAuthorized ? (
          <div className="max-w-md w-full bg-white border border-green-100 p-10 rounded-[2.5rem] shadow-xl text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Account Active</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your subscription is active and your salon is live in the marketplace.
            </p>
            <Link href="/owner/dashboard">
              <Button size="lg" className="w-full rounded-2xl h-14 text-lg">
                Go to Management Panel <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-xl w-full">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center space-y-8">
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4 py-1">
                  {salon ? "Payment Pending" : "Step 1: Setup & Pay"}
                </Badge>
                <h2 className="text-3xl font-black tracking-tight text-gray-900">
                  Activate Your Salon
                </h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Scan this unique QR code to pay the one-time activation fee of ₹{amount}.
                </p>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                  {upiUrl ? (
                    <QRCodeSVG 
                      value={upiUrl} 
                      size={220} 
                      level="H"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="h-[220px] flex items-center justify-center">
                      <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <div className="mt-6 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pre-filled Amount</p>
                    <p className="text-2xl font-black text-primary">₹{amount}.00</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Your Payment ID:</span>
                  <span className="font-mono font-black text-primary bg-white px-3 py-1 rounded-lg border shadow-sm">
                    SC_{user?.uid?.substring(0, 8)}
                  </span>
                </div>
                <div className="flex gap-3 text-left text-xs text-gray-400 leading-normal">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <p>
                    This ID is used by our admin to verify your payment. Your shop will be live within 24 hours of successful transaction.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {!salon && (
                  <Link href="/owner/dashboard">
                    <Button variant="outline" className="w-full h-12 rounded-xl gap-2">
                      <Store className="h-4 w-4" /> Setup Shop Details First
                    </Button>
                  </Link>
                )}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    <img src="https://picsum.photos/seed/gpay/40/40" className="w-8 h-8 rounded-full border-2 border-white" alt="GPay" />
                    <img src="https://picsum.photos/seed/phonepe/40/40" className="w-8 h-8 rounded-full border-2 border-white" alt="PhonePe" />
                    <img src="https://picsum.photos/seed/paytm/40/40" className="w-8 h-8 rounded-full border-2 border-white" alt="Paytm" />
                  </div>
                  <p className="text-xs font-bold text-gray-400">Accepted on all UPI apps</p>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already paid? <Link href="/owner/dashboard" className="text-primary font-bold hover:underline">Check verification status</Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
