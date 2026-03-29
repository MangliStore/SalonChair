import React, { useState } from 'react';
import { Salon, SalonService, Booking } from '../types';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, Clock, Check, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';
import { format, addDays, isBefore, startOfToday, parse } from 'date-fns';

interface BookingModalProps {
  salon: Salon;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ salon, isOpen, onClose }) => {
  const { user, signIn } = useAuth();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalPrice = salon.services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const handleBooking = async () => {
    if (!user) {
      signIn();
      return;
    }

    if (selectedServices.length === 0 || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const bookingData = {
        userId: user.uid,
        salonId: salon.id,
        serviceIds: selectedServices,
        totalPrice,
        date: selectedDate,
        timeSlot: selectedTime,
        status: 'pending',
        createdAt: Timestamp.now(),
        chatEnabled: false,
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-[#1E1E1E] w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Book Appointment</h3>
            <p className="text-gray-400 text-sm">{salon.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="text-green-500" size={48} />
            </div>
            <h4 className="text-2xl font-bold text-white mb-4">Booking Requested!</h4>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Your appointment request has been sent to {salon.name}. You'll be notified once they accept it.
            </p>
            <button
              onClick={onClose}
              className="bg-[#00E5FF] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00B8CC] transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Services */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
                Select Services
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {salon.services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${
                      selectedServices.includes(service.id)
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{service.name}</p>
                      <p className="text-xs opacity-60">{service.duration} min</p>
                    </div>
                    <span className="font-bold text-[#00E5FF]">{formatCurrency(service.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
                  Select Date
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const date = addDays(new Date(), offset);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                          selectedDate === dateStr
                            ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {format(date, 'EEE, d MMM')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full"></div>
                  Select Time
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                        selectedTime === time
                          ? 'bg-[#00E5FF] text-black border-[#00E5FF]'
                          : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Price</p>
              <p className="text-2xl font-bold text-[#00E5FF]">{formatCurrency(totalPrice)}</p>
            </div>
            <button
              onClick={handleBooking}
              disabled={loading || selectedServices.length === 0 || !selectedTime}
              className="bg-[#00E5FF] disabled:bg-gray-700 disabled:cursor-not-allowed text-black px-10 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Book Appointment'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookingModal;
