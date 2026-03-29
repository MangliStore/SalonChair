import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, User, Scissors, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, profile, signIn, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#00E5FF] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <Scissors className="text-black w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Salon<span className="text-[#00E5FF]">Chair</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
                  className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard size={18} />
                  {profile?.role === 'owner' ? 'Dashboard' : 'My Bookings'}
                </button>
                {profile?.role === 'admin' && (
                  <button className="hidden md:flex items-center gap-2 text-sm font-medium text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                    <ShieldCheck size={18} />
                    Admin
                  </button>
                )}
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || ''}
                    className="w-6 h-6 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-medium text-gray-200 hidden sm:inline">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-2 bg-[#00E5FF] hover:bg-[#00B8CC] text-black px-4 py-2 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
              >
                <LogIn size={18} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
