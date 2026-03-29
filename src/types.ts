import { Timestamp, GeoPoint } from 'firebase/firestore';

export type UserRole = 'user' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface SalonService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  location: GeoPoint;
  frontPhotoUrl: string;
  services: SalonService[];
  isApproved: boolean;
  isLive: boolean;
  liveExpiryDate: Timestamp;
  createdAt: Timestamp;
  totalBookings: number;
  rating: number;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  serviceIds: string[];
  totalPrice: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  status: BookingStatus;
  createdAt: Timestamp;
  chatEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface Payment {
  id: string;
  salonId: string;
  amount: number;
  monthYear: string;
  qrCodeUrl: string;
  status: 'paid' | 'unpaid';
  expiryDate: Timestamp;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Timestamp;
  type: 'booking' | 'message';
}
