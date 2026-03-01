
# Salon Chair - Modern Salon Booking

A modern, mobile-responsive salon booking marketplace built with Next.js, Tailwind CSS, and Firebase.

## 🚨 CRITICAL: Fix "Sign in to continue to..." Name
To change the project ID (e.g., `studio-5370622301...`) to **"Salon Chair"** on the Google Sign-in screen:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `studio-5370622301-6620e`.
3. Click the **Gear Icon** (Project Settings) in the top left.
4. In the **General** tab, look for **Public-facing name**.
5. Click the edit icon and change it to **Salon Chair**.
6. Click **Save**.

## 🚨 CRITICAL: Fix "auth/unauthorized-domain" Error
If you see a "Sign in failed" error on your live Vercel site:
1. Go to **Authentication** (left sidebar) -> **Settings** tab -> **Authorized domains**.
2. Click **Add domain** and paste your Vercel production URL (e.g., `salon-chair-one.vercel.app`).
3. **Note:** Do NOT include `https://`, just the domain name.

## Features
- **Public Marketplace**: Search and browse local salons by state and city.
- **Booking System**: Request appointments with specific services and time slots.
- **Owner Dashboard**: Manage shop details, with mandatory image resizing (<50KB).
- **Admin Control**: Centralized panel for salon verification and user registry.
- **Security**: Mandatory Gmail sign-in for all users.

## Tech Stack
- **Next.js 15 (App Router)**
- **Firebase (Auth & Firestore)**
- **Tailwind CSS**
- **Shadcn UI**
- **Lucide Icons**
