import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Booking, Salon } from '../types';
import { motion } from 'motion/react';
import { Calendar, Clock, MessageSquare, Scissors, Loader2, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { salon?: Salon })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingList: (Booking & { salon?: Salon })[] = [];
      
      for (const bookingDoc of snapshot.docs) {
        const data = bookingDoc.data() as Booking;
        const bookingData: Booking & { salon?: Salon } = { ...data, id: bookingDoc.id };
        const salonDoc = await getDoc(doc(db, 'salons', bookingData.salonId));
        if (salonDoc.exists()) {
          bookingData.salon = { ...salonDoc.data() as Salon, id: salonDoc.id };
        }
        bookingList.push(bookingData);
      }
      
      setBookings(bookingList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-[#00E5FF] animate-spin" size={40} />
      </div>
    );
  }

  const upcoming = bookings.filter(b => b.status === 'accepted' || b.status === 'pending');
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'rejected');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">My Bookings</h2>
        <p className="text-gray-400">Manage your appointments and grooming history.</p>
      </div>

      <div className="space-y-12">
        {/* Upcoming */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full"></div>
            Upcoming Appointments
          </h3>
          <div className="space-y-4">
            {upcoming.length === 0 ? (
              <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/5 text-center text-gray-500">
                No upcoming appointments. Start exploring salons!
              </div>
            ) : (
              upcoming.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  className="bg-[#1E1E1E] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#00E5FF]/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={booking.salon?.frontPhotoUrl} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{booking.salon?.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {booking.date}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {booking.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                      <span className={`text-xs font-bold uppercase ${
                        booking.status === 'accepted' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    {booking.chatEnabled && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('openChat', { detail: booking.id }));
                        }}
                        className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 transition-all"
                      >
                        <MessageSquare size={20} />
                      </button>
                    )}
                    <ChevronRight className="text-gray-600 group-hover:text-[#00E5FF] transition-colors" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Past */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            Past History
          </h3>
          <div className="space-y-4">
            {past.map((booking) => (
              <div
                key={booking.id}
                className="bg-[#1E1E1E]/50 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={booking.salon?.frontPhotoUrl} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{booking.salon?.name}</h4>
                    <p className="text-gray-500 text-xs">{booking.date} • {booking.timeSlot}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{formatCurrency(booking.totalPrice)}</p>
                  <span className="text-[10px] font-bold uppercase text-gray-500">{booking.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
