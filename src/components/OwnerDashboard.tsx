import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Salon, Booking } from '../types';
import { motion } from 'motion/react';
import { Calendar, Clock, Check, X, MessageSquare, CreditCard, AlertCircle, Loader2, Star } from 'lucide-react';
import QRCode from 'react-qr-code';
import { formatCurrency } from '../utils';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'salons'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setSalon({ ...doc.data() as Salon, id: doc.id });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!salon) return;

    const q = query(collection(db, 'bookings'), where('salonId', '==', salon.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingList: Booking[] = [];
      snapshot.forEach((doc) => {
        bookingList.push({ ...doc.data() as Booking, id: doc.id });
      });
      setBookings(bookingList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
    });

    return () => unsubscribe();
  }, [salon]);

  const handleBookingStatus = async (bookingId: string, status: 'accepted' | 'rejected') => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status,
      chatEnabled: status === 'accepted',
    });
  };

  const getQRData = () => {
    if (!salon) return '';
    const upiId = 'citimobilesknr-1@oksbi';
    const amount = '200';
    const memo = `salon_${salon.id}_${new Date().getMonth() + 1}_${new Date().getFullYear()}`;
    return `upi://pay?pa=${upiId}&pn=SalonChair&am=${amount}&cu=INR&tn=${memo}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-[#00E5FF] animate-spin" size={40} />
      </div>
    );
  }

  if (!salon) return null;

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const upcomingBookings = bookings.filter((b) => b.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Status Banner */}
      {!salon.isApproved ? (
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-6 rounded-3xl mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-[#D4AF37]" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#D4AF37]">Pending Approval</h3>
            <p className="text-gray-400">Our admin team is reviewing your salon. You'll be able to go live once approved.</p>
          </div>
        </div>
      ) : !salon.isLive ? (
        <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 p-6 rounded-3xl mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#00E5FF]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="text-[#00E5FF]" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#00E5FF]">Go Live Now</h3>
              <p className="text-gray-400">Pay ₹200 to activate your salon listing for 30 days.</p>
            </div>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="bg-[#00E5FF] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#00B8CC] transition-all whitespace-nowrap"
          >
            Pay & Go Live
          </button>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-3xl mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="text-green-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-500">Salon is Live</h3>
              <p className="text-gray-400">
                Active until: {salon.liveExpiryDate.toDate().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-white">{salon.totalBookings}</p>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowQR(false)}></div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 max-w-sm w-full text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Scan to Pay</h3>
            <p className="text-gray-400 mb-8">Pay ₹200 via any UPI app</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-8">
              <QRCode value={getQRData()} size={200} />
            </div>
            <div className="text-sm text-gray-500 mb-8">
              <p>UPI ID: citimobilesknr-1@oksbi</p>
              <p className="mt-1">Amount: ₹200.00</p>
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Pending Requests ({pendingBookings.length})
            </h2>
            <div className="space-y-4">
              {pendingBookings.length === 0 ? (
                <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/5 text-center text-gray-500">
                  No pending appointment requests.
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    layout
                    className="bg-[#1E1E1E] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        <Calendar className="text-[#00E5FF]" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{booking.date}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock size={14} /> {booking.timeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleBookingStatus(booking.id, 'rejected')}
                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={() => handleBookingStatus(booking.id, 'accepted')}
                        className="flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all"
                      >
                        <Check size={20} /> Accept
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Upcoming Appointments ({upcomingBookings.length})
            </h2>
            <div className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/5 text-center text-gray-500">
                  No upcoming appointments.
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-[#1E1E1E] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                        <Calendar className="text-green-500" size={24} />
                      </div>
                      <div>
                        <p className="text-white font-bold">{booking.date}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock size={14} /> {booking.timeSlot}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('openChat', { detail: booking.id }))}
                      className="flex items-center gap-2 text-[#00E5FF] font-bold hover:underline"
                    >
                      <MessageSquare size={18} /> Chat with Customer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Salon Details</h3>
            <div className="aspect-video rounded-2xl overflow-hidden mb-6">
              <img src={salon.frontPhotoUrl} alt={salon.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Name</p>
                <p className="text-white font-medium">{salon.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Address</p>
                <p className="text-white font-medium">{salon.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Rating</p>
                <div className="flex items-center gap-1 text-[#D4AF37] font-bold">
                  <Star size={16} fill="#D4AF37" /> {salon.rating.toFixed(1)}
                </div>
              </div>
            </div>
            <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold border border-white/10 transition-all">
              Edit Salon Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
