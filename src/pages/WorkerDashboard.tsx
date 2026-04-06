import { useState, useEffect, useRef } from 'react';
import { collection, query, doc, updateDoc, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, AlertCircle, Phone, MapPin, User, IndianRupee, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import LiveMap from '../components/LiveMap';

interface Order {
  id: string;
  userId: string;
  serviceName: string;
  price: number;
  customerName: string;
  mobileNumber: string;
  finalPrice: number;
  status: string;
  workerId?: string;
  workerEarning?: number;
  workerPaymentStatus?: string;
  latitude: number;
  longitude: number;
  workerLatitude?: number;
  workerLongitude?: number;
  createdAt: string;
}

export default function WorkerDashboard() {
  const { user, isWorker } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user || !isWorker) return;

    const q = query(
      collection(db, 'orders'),
      where('workerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching worker orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isWorker]);

  // Clean up geolocation watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update status.");
    }
  };

  const startTracking = async (orderId: string) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    try {
      // First, get current position to update immediately
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await updateDoc(doc(db, 'orders', orderId), { 
            status: 'on_the_way',
            workerLatitude: position.coords.latitude,
            workerLongitude: position.coords.longitude
          });

          // Then start watching for continuous updates
          watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
              try {
                await updateDoc(doc(db, 'orders', orderId), {
                  workerLatitude: pos.coords.latitude,
                  workerLongitude: pos.coords.longitude
                });
              } catch (err) {
                console.error("Error updating live location:", err);
              }
            },
            (error) => {
              console.error("Error watching position:", error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
          );
        },
        (error) => {
          console.error("Error getting initial position:", error);
          alert("Please enable location permissions to start work.");
        },
        { enableHighAccuracy: true }
      );
    } catch (error) {
      console.error("Error starting tracking:", error);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleArrived = async (orderId: string) => {
    stopTracking();
    await updateOrderStatus(orderId, 'arrived');
  };

  const handleComplete = async (orderId: string) => {
    stopTracking();
    await updateOrderStatus(orderId, 'completed');
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (!isWorker) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-900">Access Denied</h2>
          <p className="text-stone-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.workerEarning || 0), 0);
  const pendingPayments = completedOrders.filter(o => o.workerPaymentStatus === 'pending').reduce((sum, o) => sum + (o.workerEarning || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Worker Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Completed Jobs</p>
            <p className="text-2xl font-bold text-stone-900">{completedOrders.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-emerald-700">₹{totalEarnings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Pending Payment</p>
            <p className="text-2xl font-bold text-amber-700">₹{pendingPayments}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-stone-800 mb-6 border-b pb-2">Assigned Jobs</h2>
      
      {loading ? (
        <p className="text-stone-500">Loading jobs...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-stone-100 text-center">
          <p className="text-stone-500 text-lg">No jobs assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-stone-900">{order.serviceName}</h3>
                  <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'on_the_way' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'arrived' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-sm text-stone-600 mb-6 flex-grow">
                <p className="flex items-center gap-2"><User className="w-4 h-4"/> {order.customerName}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4"/> {order.mobileNumber}</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4"/> Gurgaon</p>
                
                {(order.status === 'on_the_way' || order.status === 'arrived') && (
                  <div className="mt-4 mb-4">
                    <LiveMap 
                      workerLat={order.workerLatitude} 
                      workerLng={order.workerLongitude} 
                      customerLat={order.latitude} 
                      customerLng={order.longitude} 
                    />
                  </div>
                )}

                <div className="mt-4 p-3 bg-stone-50 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-stone-700">Your Earning:</span>
                  <span className="font-bold text-emerald-600 text-lg">₹{order.workerEarning}</span>
                </div>
                {order.status === 'completed' && (
                  <div className="mt-2 text-right">
                    <span className={`text-xs font-medium ${order.workerPaymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      Payment: {order.workerPaymentStatus === 'paid' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-stone-100">
                {order.status === 'assigned' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Job
                  </button>
                )}
                {order.status === 'accepted' && (
                  <button
                    onClick={() => startTracking(order.id)}
                    className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-sm font-bold transition-colors shadow-md"
                  >
                    <Navigation className="w-5 h-5" /> Start Work
                  </button>
                )}
                {order.status === 'on_the_way' && (
                  <>
                    <button
                      onClick={() => openGoogleMaps(order.latitude, order.longitude)}
                      className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-sm font-medium transition-colors"
                    >
                      <MapIcon className="w-4 h-4" /> Open in Google Maps
                    </button>
                    <button
                      onClick={() => handleArrived(order.id)}
                      className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-amber-500 text-white hover:bg-amber-600 rounded-md text-sm font-bold transition-colors shadow-md"
                    >
                      <MapPin className="w-5 h-5" /> Mark as Arrived
                    </button>
                  </>
                )}
                {order.status === 'arrived' && (
                  <button
                    onClick={() => handleComplete(order.id)}
                    className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md text-sm font-bold transition-colors shadow-md"
                  >
                    <CheckCircle className="w-5 h-5" /> Complete Work
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
