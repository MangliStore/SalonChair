import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, Timestamp, getDocs } from 'firebase/firestore';
import { Salon, Booking, UserProfile } from '../types';
import { motion } from 'motion/react';
import { Check, X, ShieldCheck, Users, Scissors, Calendar, Loader2, Search } from 'lucide-react';
import { formatCurrency } from '../utils';

const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'salons' | 'users' | 'bookings'>('salons');

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubSalons = onSnapshot(collection(db, 'salons'), (snapshot) => {
      const list: Salon[] = [];
      snapshot.forEach((doc) => list.push({ ...doc.data() as Salon, id: doc.id }));
      setSalons(list);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as UserProfile));
      setUsers(list);
    });

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((doc) => list.push({ ...doc.data() as Booking, id: doc.id }));
      setBookings(list);
      setLoading(false);
    });

    return () => {
      unsubSalons();
      unsubUsers();
      unsubBookings();
    };
  }, [profile]);

  const handleApproveSalon = async (salonId: string, approve: boolean) => {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      isApproved: approve,
      // If approving, we might want to set a default live status or wait for payment
    });
  };

  const handleToggleLive = async (salonId: string, isLive: boolean) => {
    const salonRef = doc(db, 'salons', salonId);
    await updateDoc(salonRef, {
      isLive,
      liveExpiryDate: isLive ? Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : Timestamp.now(),
    });
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-center max-w-md">
          <ShieldCheck className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">This area is restricted to administrators only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-[#00E5FF] animate-spin" size={40} />
      </div>
    );
  }

  const pendingSalons = salons.filter((s) => !s.isApproved);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldCheck className="text-[#D4AF37]" size={36} />
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage salons, users, and platform operations.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('salons')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'salons' ? 'bg-[#00E5FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Salons ({salons.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'users' ? 'bg-[#00E5FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-[#00E5FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'salons' && (
        <div className="space-y-8">
          {/* Pending Approvals */}
          {pendingSalons.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Pending Approvals ({pendingSalons.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingSalons.map((salon) => (
                  <div key={salon.id} className="bg-[#1E1E1E] p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                      <img src={salon.frontPhotoUrl} alt={salon.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{salon.name}</h3>
                    <p className="text-gray-400 text-sm mb-6 truncate">{salon.address}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApproveSalon(salon.id, false)}
                        className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveSalon(salon.id, true)}
                        className="flex-1 bg-green-500 text-black py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Salons Table */}
          <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">All Salons</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search salons..."
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-[#00E5FF]/50"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <th className="px-6 py-4">Salon Name</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Live</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {salons.map((salon) => (
                    <tr key={salon.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={salon.frontPhotoUrl} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-white font-medium">{salon.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {users.find((u) => u.uid === salon.ownerId)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            salon.isApproved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}
                        >
                          {salon.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            salon.isLive ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {salon.isLive ? 'Live' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleLive(salon.id, !salon.isLive)}
                          className="text-xs font-bold text-gray-400 hover:text-white transition-colors"
                        >
                          {salon.isLive ? 'Revoke Live' : 'Grant Live'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.photoURL} className="w-8 h-8 rounded-full" />
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300 text-[10px] font-bold uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {user.createdAt.toDate().toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">All Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Salon</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date/Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">{booking.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-white font-medium">
                      {salons.find((s) => s.id === booking.salonId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {users.find((u) => u.uid === booking.userId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm font-medium">{booking.date}</div>
                      <div className="text-gray-500 text-xs">{booking.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === 'accepted'
                            ? 'bg-green-500/10 text-green-500'
                            : booking.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#00E5FF] font-bold">{formatCurrency(booking.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
