import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { CheckCircle, XCircle, Clock, AlertCircle, Phone, MapPin, User, Briefcase, IndianRupee, Tag, Navigation } from 'lucide-react';
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
  couponCode?: string;
  workerId?: string;
  workerEmail?: string;
  workerEarning?: number;
  adminEarning?: number;
  workerPaymentStatus?: string;
  latitude: number;
  longitude: number;
  workerLatitude?: number;
  workerLongitude?: number;
  createdAt: string;
}

interface Report {
  id: string;
  userId: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  phone?: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt: string;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'coupons' | 'reports'>('bookings');

  // Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  // Worker Assignment State
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedWorkerEmail, setSelectedWorkerEmail] = useState('');

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(ordersData);

        const reportsSnapshot = await getDocs(collection(db, 'reports'));
        const reportsData = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
        reportsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(reportsData);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(usersData);

        const couponsSnapshot = await getDocs(collection(db, 'coupons'));
        const couponsData = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
        setCoupons(couponsData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status.");
    }
  };

  const assignWorker = async (orderId: string, orderPrice: number) => {
    if (!selectedWorkerEmail) return;
    
    const worker = users.find(u => u.email === selectedWorkerEmail && u.role === 'worker');
    if (!worker) {
      alert("Selected user is not a worker or not found.");
      return;
    }

    try {
      // Fixed earning logic: Admin gets 250, Worker gets the rest
      const adminEarning = 250;
      const workerEarning = orderPrice - adminEarning;

      await updateDoc(doc(db, 'orders', orderId), { 
        status: 'assigned',
        workerId: worker.id,
        workerEmail: worker.email,
        workerEarning,
        adminEarning,
        workerPaymentStatus: 'pending'
      });
      
      setOrders(orders.map(o => o.id === orderId ? { 
        ...o, 
        status: 'assigned', 
        workerId: worker.id, 
        workerEmail: worker.email,
        workerEarning,
        adminEarning,
        workerPaymentStatus: 'pending'
      } : o));
      setAssigningOrderId(null);
      setSelectedWorkerEmail('');
    } catch (error) {
      console.error("Error assigning worker:", error);
      alert("Failed to assign worker.");
    }
  };

  const completePayment = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { workerPaymentStatus: 'paid' });
      setOrders(orders.map(o => o.id === orderId ? { ...o, workerPaymentStatus: 'paid' } : o));
    } catch (error) {
      console.error("Error completing payment:", error);
      alert("Failed to complete payment.");
    }
  };

  const makeWorker = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'worker' });
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'worker' } : u));
    } catch (error) {
      console.error("Error making worker:", error);
      alert("Failed to update user role.");
    }
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;

    try {
      const newCoupon = {
        code: newCouponCode.toUpperCase(),
        discountPercentage: Number(newCouponDiscount),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'coupons'), newCoupon);
      setCoupons([...coupons, { id: docRef.id, ...newCoupon }]);
      setNewCouponCode('');
      setNewCouponDiscount('');
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Failed to create coupon.");
    }
  };

  const toggleCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', couponId), { isActive: !currentStatus });
      setCoupons(coupons.map(c => c.id === couponId ? { ...c, isActive: !currentStatus } : c));
    } catch (error) {
      console.error("Error toggling coupon:", error);
      alert("Failed to update coupon.");
    }
  };

  if (!isAdmin) {
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

  const workers = users.filter(u => u.role === 'worker');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {['bookings', 'users', 'coupons', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md font-medium capitalize whitespace-nowrap ${
              activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {activeTab === 'bookings' && (
          <section>
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 border-b pb-2">All Bookings</h2>
            {loading ? (
              <p className="text-stone-500">Loading bookings...</p>
            ) : orders.length === 0 ? (
              <p className="text-stone-500">No bookings found.</p>
            ) : (
              <div className="bg-white shadow-sm rounded-xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status & Worker</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-stone-900">{order.serviceName}</div>
                            <div className="text-sm text-stone-500">
                              {order.price !== order.finalPrice && <span className="line-through mr-1">₹{order.price}</span>}
                              <span className="text-emerald-600 font-medium">₹{order.finalPrice}</span>
                            </div>
                            {order.couponCode && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Tag className="w-3 h-3"/> {order.couponCode}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-stone-900 flex items-center gap-1"><User className="w-3 h-3"/> {order.customerName}</div>
                            <div className="text-sm text-stone-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {order.mobileNumber}</div>
                            <div className="text-sm text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> Gurgaon</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mb-2
                              ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                                order.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'assigned' ? 'bg-purple-100 text-purple-800' : 
                                order.status === 'on_the_way' ? 'bg-purple-100 text-purple-800' : 
                                order.status === 'arrived' ? 'bg-indigo-100 text-indigo-800' : 
                                order.status === 'declined' ? 'bg-red-100 text-red-800' : 
                                'bg-amber-100 text-amber-800'}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                            {order.workerEmail && (
                              <div className="text-xs text-stone-600 flex flex-col gap-1">
                                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3"/> {order.workerEmail}</span>
                                {order.status === 'completed' && (
                                  <span className={`font-medium ${order.workerPaymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    Payment: {order.workerPaymentStatus}
                                  </span>
                                )}
                              </div>
                            )}
                            {(order.status === 'on_the_way' || order.status === 'arrived') && (
                              <div className="mt-2 w-48">
                                <LiveMap 
                                  workerLat={order.workerLatitude} 
                                  workerLng={order.workerLongitude} 
                                  customerLat={order.latitude} 
                                  customerLng={order.longitude} 
                                />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {order.status === 'pending' && (
                              <div className="flex flex-col gap-2 items-end">
                                {assigningOrderId === order.id ? (
                                  <div className="flex gap-2">
                                    <select 
                                      className="border border-stone-300 rounded px-2 py-1 text-xs"
                                      value={selectedWorkerEmail}
                                      onChange={(e) => setSelectedWorkerEmail(e.target.value)}
                                    >
                                      <option value="">Select Worker</option>
                                      {workers.map(w => (
                                        <option key={w.id} value={w.email}>{w.email}</option>
                                      ))}
                                    </select>
                                    <button onClick={() => assignWorker(order.id, order.finalPrice)} className="text-emerald-600 hover:text-emerald-900">Assign</button>
                                    <button onClick={() => setAssigningOrderId(null)} className="text-stone-500">Cancel</button>
                                  </div>
                                ) : (
                                  <>
                                    <button onClick={() => setAssigningOrderId(order.id)} className="text-purple-600 hover:text-purple-900">Assign Worker</button>
                                    <button onClick={() => updateOrderStatus(order.id, 'accepted')} className="text-blue-600 hover:text-blue-900">Accept (No Worker)</button>
                                    <button onClick={() => updateOrderStatus(order.id, 'declined')} className="text-red-600 hover:text-red-900">Decline</button>
                                  </>
                                )}
                              </div>
                            )}
                            {order.status === 'accepted' && !order.workerId && (
                              <button onClick={() => updateOrderStatus(order.id, 'completed')} className="text-emerald-600 hover:text-emerald-900">Complete Work</button>
                            )}
                            {order.status === 'completed' && order.workerId && order.workerPaymentStatus === 'pending' && (
                              <button onClick={() => completePayment(order.id)} className="text-emerald-600 hover:text-emerald-900 flex items-center justify-end gap-1 w-full">
                                <IndianRupee className="w-4 h-4"/> Pay Worker
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 border-b pb-2">User Management</h2>
            <div className="bg-white shadow-sm rounded-xl border border-stone-200 overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{u.displayName || 'No Name'}</div>
                        <div className="text-sm text-stone-500">{u.email}</div>
                        {u.phone && <div className="text-xs text-stone-400">{u.phone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 
                            u.role === 'worker' ? 'bg-purple-100 text-purple-800' : 
                            'bg-stone-100 text-stone-800'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {u.role === 'user' && (
                          <button onClick={() => makeWorker(u.id)} className="text-purple-600 hover:text-purple-900">Make Worker</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'coupons' && (
          <section>
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 border-b pb-2">Coupon Management</h2>
            
            <div className="bg-white p-6 rounded-xl border border-stone-200 mb-8">
              <h3 className="text-lg font-medium text-stone-900 mb-4">Create New Coupon</h3>
              <form onSubmit={createCoupon} className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. SUMMER20"
                    className="w-full px-3 py-2 border border-stone-300 rounded-md uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full px-3 py-2 border border-stone-300 rounded-md"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium">
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-stone-200 overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-stone-900">
                        {coupon.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-stone-600">
                        {coupon.discountPercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => toggleCoupon(coupon.id, coupon.isActive)} 
                          className={`${coupon.isActive ? 'text-red-600 hover:text-red-900' : 'text-emerald-600 hover:text-emerald-900'}`}
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'reports' && (
          <section>
            <h2 className="text-2xl font-semibold text-stone-800 mb-6 border-b pb-2">User Reports</h2>
            {loading ? (
              <p className="text-stone-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-stone-500">No reports found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white shadow-sm rounded-xl border border-stone-200 p-6">
                    <h3 className="text-lg font-medium text-stone-900 mb-2">{report.subject}</h3>
                    <p className="text-sm text-stone-500 mb-4">{new Date(report.createdAt).toLocaleString()}</p>
                    <p className="text-stone-700 whitespace-pre-wrap">{report.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
