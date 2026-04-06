import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Clock, CheckCircle, XCircle, Loader, MapPin, Phone, User, Navigation } from 'lucide-react';
import LiveMap from '../components/LiveMap';

interface Order {
  id: string;
  serviceName: string;
  price: number;
  customerName: string;
  mobileNumber: string;
  finalPrice: number;
  status: string;
  latitude: number;
  longitude: number;
  workerLatitude?: number;
  workerLongitude?: number;
  createdAt: string;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
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
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'cancelled': 
      case 'declined': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'on_the_way': return <Navigation className="w-5 h-5 text-purple-500" />;
      case 'arrived': return <MapPin className="w-5 h-5 text-indigo-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 md:pb-16">
      <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-amber-100">
          <p className="text-stone-500 text-lg mb-4">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6 border border-amber-100/50 hover:border-amber-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex-grow">
                  <h3 className="text-xl font-serif font-bold text-emerald-950 mb-1">{order.serviceName}</h3>
                  <p className="text-sm text-amber-600 font-medium mb-4">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-stone-600 bg-white/50 p-4 rounded-2xl">
                    <span className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-700"/> {order.customerName}</span>
                    <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-700"/> {order.mobileNumber}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-700"/> Gurgaon</span>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    {order.price !== order.finalPrice && (
                      <p className="text-sm text-stone-400 line-through">₹{order.price}</p>
                    )}
                    <p className="font-bold text-2xl text-amber-600">₹{order.finalPrice}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-amber-100 shadow-sm">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-bold capitalize text-emerald-950">{order.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {(order.status === 'on_the_way' || order.status === 'arrived') && (
                <div className="w-full mt-2">
                  <h4 className="text-sm font-bold text-emerald-950 mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-600" />
                    Live Tracking
                  </h4>
                  <LiveMap 
                    workerLat={order.workerLatitude} 
                    workerLng={order.workerLongitude} 
                    customerLat={order.latitude} 
                    customerLng={order.longitude} 
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
