import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import SalonCard from '../components/SalonCard';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, GeoPoint } from 'firebase/firestore';
import { Salon } from '../types';
import { calculateDistance } from '../utils';
import { motion } from 'motion/react';
import { Loader2, MapPinOff } from 'lucide-react';

const Home: React.FC = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Please enable location access to find salons near you.');
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLocation && !locationError) return;

    const q = query(
      collection(db, 'salons'),
      where('isApproved', '==', true),
      where('isLive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salonList: Salon[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Salon;
        const distance = userLocation
          ? calculateDistance(userLocation.lat, userLocation.lng, data.location.latitude, data.location.longitude)
          : 0;

        // Filter by 1KM range if location is available
        if (!userLocation || distance <= 1) {
          salonList.push({ ...data, id: doc.id });
        }
      });
      setSalons(salonList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userLocation, locationError]);

  return (
    <div>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Salons</h2>
            <p className="text-gray-400">Handpicked premium salons in your vicinity.</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
              Sort by Rating
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-[#00E5FF] animate-spin mb-4" size={40} />
            <p className="text-gray-400">Finding salons near you...</p>
          </div>
        ) : locationError ? (
          <div className="bg-[#1E1E1E] p-12 rounded-3xl border border-white/10 text-center max-w-2xl mx-auto">
            <MapPinOff className="text-gray-500 mx-auto mb-6" size={60} />
            <h3 className="text-2xl font-bold text-white mb-4">Location Access Required</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              To show you salons within 1KM, we need access to your location. Please enable location services in your browser settings.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#00E5FF] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00B8CC] transition-all"
            >
              Try Again
            </button>
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No salons found within 1KM of your location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {salons.map((salon) => (
              <SalonCard
                key={salon.id}
                salon={salon}
                distance={
                  userLocation
                    ? calculateDistance(userLocation.lat, userLocation.lng, salon.location.latitude, salon.location.longitude)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
