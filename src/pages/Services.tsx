import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, X, Loader } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
}

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedService, setSelectedService] = useState<{name: string, price: number} | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user && user.displayName) {
      setCustomerName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const q = query(collection(db, 'coupons'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        const couponsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
        setActiveCoupons(couponsData);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = () => {
    if (!couponCode) {
      setDiscount(0);
      setCouponError('');
      return;
    }

    const coupon = activeCoupons.find(c => c.code === couponCode.toUpperCase());
    
    if (coupon) {
      if (selectedService) {
        const calculatedDiscount = (selectedService.price * coupon.discountPercentage) / 100;
        setDiscount(calculatedDiscount);
        setCouponError('');
      }
    } else if (couponCode.toUpperCase() === 'WELCOME50') {
      // Fallback
      setDiscount(50);
      setCouponError('');
    } else {
      setDiscount(0);
      setCouponError('Invalid coupon code');
    }
  };

  const getLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Rough bounding box for Gurgaon
        if (lat >= 28.35 && lat <= 28.55 && lng >= 76.85 && lng <= 77.15) {
          setCoordinates({ lat, lng });
        } else {
          setLocationError("Service only available in Gurgaon");
          setCoordinates(null);
        }
        setIsLocating(false);
      },
      () => {
        setLocationError("Unable to retrieve your location.");
        setIsLocating(false);
      }
    );
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedService || !coordinates) return;

    setIsSubmitting(true);

    try {
      const finalPrice = selectedService.price - discount;
      
      const orderData: any = {
        userId: user.uid,
        serviceName: selectedService.name,
        price: selectedService.price,
        customerName,
        mobileNumber,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        finalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      if (discount > 0) {
        orderData.discount = discount;
        if (couponCode) {
          orderData.couponCode = couponCode.toUpperCase();
        }
      }

      await addDoc(collection(db, 'orders'), orderData);
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error("Error booking service:", error);
      alert("Failed to book service. Please try again.");
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      id: 'ladies',
      name: 'Ladies Massage',
      price: 500,
      duration: '1 Hour',
      description: 'A relaxing full-body massage tailored specifically for women, focusing on stress relief and rejuvenation.',
      image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'gents',
      name: 'Gents Massage',
      price: 700,
      duration: '1 Hour',
      description: 'Deep tissue and therapeutic massage designed for men to relieve muscle tension and improve flexibility.',
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative pb-24 md:pb-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-emerald-950 mb-4">Premium Services</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Choose from our specialized massage therapies delivered right to your door.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="rounded-3xl overflow-hidden glass-panel flex flex-col group"
          >
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-emerald-900/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-amber-700 font-semibold shadow-sm">
                ₹{service.price}
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow bg-white/50">
              <h3 className="text-2xl font-serif font-bold text-emerald-950 mb-2">{service.name}</h3>
              <p className="text-sm text-amber-600 font-medium mb-4">{service.duration}</p>
              <p className="text-stone-600 mb-8 flex-grow leading-relaxed">{service.description}</p>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!user) navigate('/login');
                  else setSelectedService({ name: service.name, price: service.price });
                }}
                className="w-full py-4 rounded-full text-white font-medium gold-gradient"
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedService && !showSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-stone-100 bg-stone-50">
                <h3 className="font-serif font-semibold text-lg text-stone-900">Book {selectedService.name}</h3>
                <button onClick={() => setSelectedService(null)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="booking-form" onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10,15}"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={getLocation}
                        disabled={isLocating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-md hover:bg-stone-200 transition-colors disabled:opacity-50"
                      >
                        {isLocating ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {coordinates ? 'Location Found' : 'Detect Location'}
                      </button>
                    </div>
                    {locationError && <p className="text-red-500 text-sm mt-1">{locationError}</p>}
                    {coordinates && <p className="text-emerald-600 text-sm mt-1">✓ Location verified (Gurgaon)</p>}
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. WELCOME50"
                        className="flex-1 px-3 py-2 border border-stone-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-900"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
                    {discount > 0 && <p className="text-emerald-600 text-sm mt-1">✓ ₹{discount} discount applied!</p>}
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-stone-100 bg-stone-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-stone-600">Total Price:</span>
                  <span className="text-xl font-semibold text-emerald-700">₹{selectedService.price - discount}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  form="booking-form"
                  disabled={!coordinates || isSubmitting}
                  className="w-full py-3 px-4 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Booking Confirmed!</h3>
              <p className="text-stone-600">Your massage has been booked successfully. Redirecting to your orders...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
