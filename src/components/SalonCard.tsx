import React, { useState } from 'react';
import { Salon } from '../types';
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';
import BookingModal from './BookingModal';

interface SalonCardProps {
  salon: Salon;
  distance?: number;
}

const SalonCard: React.FC<SalonCardProps> = ({ salon, distance }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-white/5 hover:border-[#00E5FF]/30 transition-all group shadow-xl"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={salon.frontPhotoUrl}
            alt={salon.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-[#D4AF37]">
            <Star size={14} fill="#D4AF37" />
            {salon.rating.toFixed(1)}
          </div>
          {distance && (
            <div className="absolute bottom-4 left-4 bg-[#00E5FF] text-black px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
              {distance.toFixed(1)} KM Away
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold text-white mb-1 truncate">{salon.name}</h3>
          <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
            <MapPin size={14} className="text-gray-500" />
            {salon.address}
          </p>

          <div className="space-y-2 mb-6">
            {salon.services.slice(0, 2).map((service) => (
              <div key={service.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{service.name}</span>
                <span className="text-[#00E5FF] font-medium">{formatCurrency(service.price)}</span>
              </div>
            ))}
            {salon.services.length > 2 && (
              <p className="text-xs text-gray-500">+{salon.services.length - 2} more services</p>
            )}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-white/5 hover:bg-[#00E5FF] hover:text-black text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/10 group-hover:border-[#00E5FF]/50"
          >
            Book Now
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>

      <BookingModal
        salon={salon}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SalonCard;
