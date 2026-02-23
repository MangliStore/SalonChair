
# Salon Chair - Modern Salon Booking

A modern, mobile-responsive salon booking marketplace built with Next.js, Tailwind CSS, and Firebase.

## 🚨 CRITICAL: Fix "auth/unauthorized-domain" Error
If you see a "Sign in failed" error on your live Vercel site:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `studio-5370622301-6620e`.
3. Go to **Authentication** (left sidebar) -> **Settings** tab -> **Authorized domains** (left sub-menu).
4. Click **Add domain** and paste your Vercel production URL (e.g., `salon-chair-one.vercel.app`).
5. **Note:** Do NOT include `https://`, just the domain name.
6. Also add any Vercel preview URLs if you want them to work.

## Troubleshooting Git Push Errors
If you see `! [rejected] main -> main (fetch first)`, it means there are changes on GitHub that you don't have locally. Run these commands in your terminal:
```bash
git pull origin main --rebase
git push -u origin main
```

## Features
- **Public Marketplace**: Search and browse local salons by state and city.
- **Booking System**: Request appointments with specific services and time slots.
- **Owner Dashboard**: Manage shop details, accept/reject bookings, and track revenue.
- **Security**: Mandatory sign-in and strict Gmail verification for salon owners.

## Tech Stack
- **Next.js 15 (App Router)**
- **Firebase (Auth & Firestore)**
- **Tailwind CSS**
- **Shadcn UI**
- **Lucide Icons**
