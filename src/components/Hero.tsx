import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Star } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Salon Interior"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-[#0A0A0A]/80 to-[#0A0A0A]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          Elevate Your <span className="text-[#00E5FF]">Style</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Discover and book the finest salons near you. Premium grooming experiences at your fingertips.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl max-w-3xl mx-auto"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for services or salons..."
              className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-500"
            />
          </div>
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
            <MapPin className="text-[#00E5FF]" size={20} />
            <span className="text-gray-300 text-sm">Near You (1KM)</span>
          </div>
          <button className="bg-[#00E5FF] hover:bg-[#00B8CC] text-black px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            Explore
          </button>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-8 text-sm text-gray-400 z-10">
        <div className="flex items-center gap-2">
          <Star className="text-[#D4AF37]" size={16} fill="#D4AF37" />
          <span>Top Rated Salons</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></div>
          <span>Real-time Booking</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
