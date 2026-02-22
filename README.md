
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
1. Go to [GitHub](https://github.com) and create a new **Public** or **Private** repository named `salon-chair`.
2. Do **not** initialize it with a README or License.

### 2. Push Code to GitHub
Open your terminal in your local project folder and run:
```bash
git init
git add .
git commit -m "Initial commit from Salon Chair Prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/salon-chair.git
git push -u origin main
```

### 3. Connect to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New"** -> **"Project"**.
3. Select your `salon-chair` repository.
4. Vercel will auto-detect Next.js. Click **"Deploy"**.

## Firebase Setup

Ensure your Firebase project (`studio-5370622301-6620e`) has the following enabled:
1. **Authentication**: Enable the **Google** Sign-In provider in the Firebase Console.
2. **Firestore**: Ensure the security rules from `firestore.rules` are deployed.

## Tech Stack
- **Next.js 15 (App Router)**
- **Firebase (Auth & Firestore)**
- **Tailwind CSS**
- **Shadcn UI**
- **Lucide Icons**
