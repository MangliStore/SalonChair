import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { User, Scissors, ArrowRight } from 'lucide-react';

const RoleSelection: React.FC = () => {
  const { updateRole } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Welcome to <span className="text-[#00E5FF]">SalonChair</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            How would you like to use our platform?
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateRole('user')}
            className="group relative bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 hover:border-[#00E5FF]/50 transition-all text-left overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <User size={120} />
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00E5FF]/20 transition-colors">
              <User className="text-[#00E5FF]" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">I'm a Customer</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Browse top-rated salons, book appointments instantly, and manage your grooming schedule with ease.
            </p>
            <div className="flex items-center gap-2 text-[#00E5FF] font-semibold">
              Get Started <ArrowRight size={20} />
            </div>
          </motion.button>

          {/* Salon Owner Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateRole('owner')}
            className="group relative bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 hover:border-[#D4AF37]/50 transition-all text-left overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scissors size={120} />
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
              <Scissors className="text-[#D4AF37]" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">I'm a Salon Owner</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Register your salon, manage bookings, showcase your services, and grow your business with our tools.
            </p>
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
              Register Salon <ArrowRight size={20} />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
