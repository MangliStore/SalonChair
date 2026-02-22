
# Salon Chair - Modern Salon Booking

A modern, mobile-responsive salon booking marketplace built with Next.js, Tailwind CSS, and Firebase.

## Features

- **Public Marketplace**: Search and browse local salons by state and city.
- **Booking System**: Request appointments with specific services and time slots.
- **Owner Dashboard**: Manage shop details, accept/reject bookings, and track revenue.
- **Admin Control Center**: Verification queue and manual visibility overrides at `/scbadmin`.
- **Security**: Strict Gmail verification for salon owners.

## Deployment to Vercel

To get this app live, follow these steps:

### 1. Create a GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository named `salon-chair`.
2. Do **not** initialize it with a README or License.

### 2. Push Code to GitHub
Open your terminal in your local project folder and run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salon-chair.git
git push -u origin main
```

### 3. Connect to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** -> **"Project"**.
3. Select your `salon-chair` repository.
4. Click **"Deploy"**.

### 4. CRITICAL: Fix "auth/unauthorized-domain" Error
If you cannot sign in on your live Vercel site:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: `studio-5370622301-6620e`.
3. Go to **Authentication** -> **Settings** -> **Authorized domains**.
4. Click **Add domain** and paste your Vercel production URL (e.g., `salon-chair.vercel.app`).
5. Also add any preview URLs if you want them to work.

## Firebase Setup

Ensure your Firebase project has the following enabled:
1. **Authentication**: Enable the **Google** Sign-In provider.
2. **Firestore**: Security rules must be deployed.

## Tech Stack
- **Next.js 15 (App Router)**
- **Firebase (Auth & Firestore)**
- **Tailwind CSS**
- **Shadcn UI**
- **Lucide Icons**
