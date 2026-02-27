"use client";

import { useState, useEffect } from "react";
// Important: Use this exact import for Next.js
import dynamic from 'next/dynamic';
const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false }); 
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Navbar } from "@/components/navbar";
import { QrCode, Loader2, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- YOUR SETTINGS ---
  const myUpiId = "7842831137@ybl"; // <-- CHANGE THIS
  const amount = "200";
  const businessName = "Salon Chair";

  // Construct the UPI link only when user is available
  const upiUrl = user 
    ? `upi://pay?pa=${myUpiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=Verify_${user.uid.substring(0, 8)}`
    : "";

  useEffect(() => {
    async function fetchSalon() {
      if (user && db) {
        const docRef = doc(db, "salons", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setSalon(docSnap.data());
        setLoading(false);
      }
    }
    fetchSalon();
  }, [user, db]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        
        {salon?.isPaid ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-4">
            <CheckCircle className="text-green-600 w-8 h-8" />
            <div>
              <h2 className="text-lg font-bold text-green-900">Salon Verified</h2>
              <p className="text-green-700">Your salon is live and visible to customers!</p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <QrCode className="text-primary" /> Activate Dashboard
              </h2>
              
              <div className="bg-gray-50 inline-block p-6 rounded-2xl mb-6 border-2 border-dashed border-gray-200">
                {/* THE QR CODE COMPONENT */}
                {upiUrl ? (
                  <QRCodeSVG 
                    value={upiUrl} 
                    size={200} 
                    level="H" // High error correction
                    includeMargin={true}
                  />
                ) : (
                  <p>Generating QR...</p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">Scan with GPay / PhonePe / Paytm to pay <b>₹200</b></p>
                <div className="bg-primary/10 text-primary py-2 px-4 rounded-full inline-block font-mono text-sm font-bold">
                  Ref: Verify_{user?.uid?.substring(0, 8)}
                </div>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  We use your unique Reference ID in the payment note to automatically verify your salon.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}