# Salon Chair - Modern Salon Booking

A modern, mobile-responsive salon booking marketplace built with Next.js, Tailwind CSS, and Firebase.

## Features

- **Public Marketplace**: Search and browse local salons by state and city.
- **Booking System**: Request appointments with specific services and time slots.
- **Owner Dashboard**: Manage shop details, accept/reject bookings, and track revenue.
- **Admin Control Center**: Verification queue and manual visibility overrides at `/scbadmin`.
- **Security**: Strict Gmail verification for salon owners.

## Deployment to Vercel

This project is optimized for Vercel.

### Prerequisites
- A Vercel account.
- Your code pushed to a Git provider (GitHub, GitLab, or Bitbucket).

### Steps
1. **Import Project**: In Vercel, click "Add New" -> "Project" and select your repository.
2. **Framework**: Ensure the Framework Preset is set to **Next.js**.
3. **Environment Variables**: 
   - The current Firebase config is public and bundled in `src/firebase/config.ts`.
   - If you implement AI features using Genkit, you will need to add `GOOGLE_GENAI_API_KEY` to the Vercel Environment Variables section.
4. **Deploy**: Click "Deploy". Vercel will provide you with a production URL.

## Firebase Setup

Ensure your Firebase project (`studio-5370622301-6620e`) has the following enabled:
1. **Authentication**: Enable the Google Sign-In provider in the Firebase Console.
2. **Firestore**: Ensure the security rules from `firestore.rules` are deployed.

## Tech Stack
- **Next.js 15 (App Router)**
- **Firebase (Auth & Firestore)**
- **Tailwind CSS**
- **Shadcn UI**
- **Lucide Icons**
