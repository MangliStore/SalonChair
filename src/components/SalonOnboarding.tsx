import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../firebase';
import { collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils';
import { motion } from 'motion/react';
import { Upload, MapPin, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

const SalonOnboarding: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [services, setServices] = useState<{ name: string; price: number; duration: number }[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddService = () => {
    setServices([...services, { name: '', price: 0, duration: 30 }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !location || !photo || services.length === 0) return;

    setLoading(true);
    try {
      // 1. Compress and upload photo
      const compressedBlob = await compressImage(photo);
      const photoRef = ref(storage, `salons/${user.uid}/${Date.now()}.jpg`);
      await uploadBytes(photoRef, compressedBlob);
      const photoUrl = await getDownloadURL(photoRef);

      // 2. Save salon data
      const salonData = {
        ownerId: user.uid,
        name,
        address,
        location: new GeoPoint(location.lat, location.lng),
        frontPhotoUrl: photoUrl,
        services: services.map((s, i) => ({ ...s, id: `service_${i}` })),
        isApproved: false,
        isLive: false,
        liveExpiryDate: Timestamp.now(), // Will be updated after payment
        createdAt: Timestamp.now(),
        totalBookings: 0,
        rating: 5.0,
      };

      await addDoc(collection(db, 'salons'), salonData);
      setSuccess(true);
    } catch (error) {
      console.error('Error onboarding salon:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1E1E1E] p-12 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#00E5FF]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-[#00E5FF]" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Your salon listing is now pending approval from our admin team. We'll notify you once it's approved so you can go live.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00E5FF] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00B8CC] transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Register Your Salon</h2>
        <p className="text-gray-400">Fill in the details below to list your salon on our marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full"></div>
            Basic Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Salon Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                placeholder="e.g. Royal Cuts & Spa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00E5FF]/50 transition-all"
                placeholder="Full street address"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all"
            >
              <MapPin size={18} className="text-[#00E5FF]" />
              {location ? 'Location Captured' : 'Get Current Location'}
            </button>
            {location && (
              <span className="text-xs text-gray-500">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full"></div>
            Salon Photo
          </h3>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center group-hover:border-[#00E5FF]/30 transition-all bg-white/5">
              {photoPreview ? (
                <div className="relative inline-block">
                  <img src={photoPreview} alt="Preview" className="max-h-48 rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <Upload className="text-white" size={32} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-400">Click or drag to upload salon front view photo</p>
                  <p className="text-xs text-gray-600">JPG, PNG up to 5MB (will be compressed)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-[#1E1E1E] p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00E5FF] rounded-full"></div>
              Services & Pricing
            </h3>
            <button
              type="button"
              onClick={handleAddService}
              className="flex items-center gap-2 text-sm font-bold text-[#00E5FF] hover:text-[#00B8CC]"
            >
              <Plus size={18} /> Add Service
            </button>
          </div>

          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-medium text-gray-500">Service Name</label>
                  <input
                    type="text"
                    required
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-white outline-none focus:border-[#00E5FF]/50"
                    placeholder="e.g. Haircut"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={service.price}
                    onChange={(e) => handleServiceChange(index, 'price', Number(e.target.value))}
                    className="w-full bg-transparent border-b border-white/10 py-2 text-white outline-none focus:border-[#00E5FF]/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-gray-500">Duration (min)</label>
                    <input
                      type="number"
                      required
                      value={service.duration}
                      onChange={(e) => handleServiceChange(index, 'duration', Number(e.target.value))}
                      className="w-full bg-transparent border-b border-white/10 py-2 text-white outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-gray-600">No services added yet. Click "Add Service" to start.</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !location || !photo || services.length === 0}
          className="w-full bg-[#00E5FF] disabled:bg-gray-700 disabled:cursor-not-allowed text-black py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Submitting Application...
            </>
          ) : (
            'Submit Salon for Approval'
          )}
        </button>
      </form>
    </div>
  );
};

export default SalonOnboarding;
