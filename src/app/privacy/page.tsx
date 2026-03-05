"use client";

import { Navbar } from "@/components/navbar";
import { Scissors, ShieldCheck, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">Privacy Policy</h1>
              <p className="text-muted-foreground font-medium">Last Updated: March 5, 2026</p>
            </div>
          </div>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <p className="text-lg">
                At Salon Chair, accessible from <Link href="https://salonchair.website" className="text-primary hover:underline font-bold">https://salonchair.website</Link>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Salon Chair and how we use it.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">1</span>
                Information We Collect
              </h2>
              <p>We collect personal information that you voluntarily provide to us when you register on the App or book a service.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Name, email address (via Google Login), phone number, and city.</li>
                <li><strong>Salon Data:</strong> Shop name, location, and verification details for owners.</li>
                <li><strong>Booking Data:</strong> Service type, appointment time, and salon preference.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">2</span>
                How We Use Your Information
              </h2>
              <p>We use the information we collect in various ways, including to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our booking platform.</li>
                <li>Notify Salon Owners of new bookings via push notifications.</li>
                <li>Verify the identity of Salon Owners for the subscription service.</li>
                <li>Send you emails or SMS regarding your appointments.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">3</span>
                Google User Data (OAuth Disclosure)
              </h2>
              <p>Salon Chair's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We only access your Google Email and Profile Name to create your account.</li>
                <li>We do not share your Google data with third-party advertisers or data brokers.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">4</span>
                Data Retention and Deletion
              </h2>
              <p>In accordance with Indian IT Rules 2026, we retain your data only as long as necessary.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users can request data deletion by emailing <span className="text-primary font-bold">citimobilesknr@gmail.com</span>.</li>
                <li>Accounts inactive for more than 2 years will be automatically purged.</li>
              </ul>
            </section>

            <section className="pt-8 border-t border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Grievance Officer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3">
                  <p className="flex items-center gap-3 font-bold text-gray-900">
                    <span className="text-primary bg-white p-2 rounded-xl border"><Mail className="h-4 w-4" /></span>
                    citimobilesknr@gmail.com
                  </p>
                  <p className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="text-primary bg-white p-2 rounded-xl border"><MapPin className="h-4 w-4" /></span>
                    Karimnagar, Telangana, India.
                  </p>
                </div>
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center justify-center">
                   <div className="text-center">
                      <Scissors className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-primary">Salon Chair Team</p>
                   </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground text-sm">
        <div className="flex justify-center items-center gap-4 mb-4 font-bold">
           <Link href="/" className="hover:text-primary transition-colors">Home</Link>
           <span className="opacity-20">|</span>
           <Link href="/privacy" className="text-primary">Privacy Policy</Link>
        </div>
        <p>© 2026 Salon Chair Marketplace. Built for style.</p>
      </footer>
    </div>
  );
}
