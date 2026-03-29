import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import RoleSelection from './components/RoleSelection';
import SalonOnboarding from './components/SalonOnboarding';
import OwnerDashboard from './components/OwnerDashboard';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';
import Chat from './components/Chat';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Salon } from './types';

const AppContent: React.FC = () => {
  const { user, profile, loading, updateRole } = useAuth();
  const [hasSalon, setHasSalon] = useState<boolean | null>(null);
  const [checkingSalon, setCheckingSalon] = useState(false);
  const [view, setView] = useState<'home' | 'dashboard'>('home');
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    const handleChat = (e: any) => setActiveChat(e.detail);
    window.addEventListener('openChat', handleChat);
    return () => window.removeEventListener('openChat', handleChat);
  }, []);

  useEffect(() => {
    const checkSalon = async () => {
      if (user) {
        // Auto-assign admin role if email matches
        if (user.email === 'no1salonchair@gmail.com' && profile?.role !== 'admin') {
          await updateRole('admin');
        }

        if (profile?.role === 'owner') {
          setCheckingSalon(true);
          const q = query(collection(db, 'salons'), where('ownerId', '==', user.uid));
          const snapshot = await getDocs(q);
          setHasSalon(!snapshot.empty);
          setCheckingSalon(false);
        }
      } else {
        setHasSalon(null);
      }
    };
    checkSalon();
  }, [user, profile]);

  // Listen for navigation events from Navbar (simplified for now via global window or just passing props)
  useEffect(() => {
    const handleNav = (e: any) => setView(e.detail);
    window.addEventListener('navigate', handleNav);
    return () => window.removeEventListener('navigate', handleNav);
  }, []);

  if (loading || checkingSalon) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="text-[#00E5FF] animate-spin" size={48} />
      </div>
    );
  }

  // If logged in but no profile (new user), show role selection
  if (user && !profile) {
    return (
      <Layout>
        <RoleSelection />
      </Layout>
    );
  }

  // Admin View
  if (profile?.role === 'admin') {
    return (
      <Layout>
        <AdminPanel />
      </Layout>
    );
  }

  // Owner View
  if (profile?.role === 'owner') {
    return (
      <Layout>
        {hasSalon ? <OwnerDashboard /> : <SalonOnboarding />}
      </Layout>
    );
  }

  // User View
  return (
    <Layout>
      {view === 'dashboard' ? <UserDashboard /> : <Home />}
      {activeChat && user && (
        <Chat
          bookingId={activeChat}
          currentUserId={user.uid}
          onClose={() => setActiveChat(null)}
        />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
