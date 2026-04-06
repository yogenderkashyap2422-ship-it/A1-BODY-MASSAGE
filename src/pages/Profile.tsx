import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { motion } from 'motion/react';
import { User, Phone, Mail, Camera, Loader, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName,
        photoURL
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-24 md:pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden glass-panel"
      >
        <div className="bg-emerald-900 h-40 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200')] opacity-20 object-cover mix-blend-overlay"></div>
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white gold-glow" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-stone-100 flex items-center justify-center gold-glow">
                  <User className="w-12 h-12 text-stone-300" />
                </div>
              )}
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-amber-600 text-white p-2 rounded-full shadow-md hover:bg-amber-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8 bg-white/50">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-emerald-950 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-950 mb-1">Profile Image URL</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-full text-white font-medium gold-gradient disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-stone-100 text-stone-700 rounded-full font-medium hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-emerald-950">{user.displayName || 'Add your name'}</h1>
                  <p className="text-stone-500 flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-amber-600" />
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-medium text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-full transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 space-y-3">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Account Options</h3>
            
            <Link to="/contact" className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-amber-50 transition-colors border border-amber-100/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-medium text-emerald-950">Contact Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </Link>

            <Link to="/about" className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-amber-50 transition-colors border border-amber-100/50 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-medium text-emerald-950">About Us</span>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-400" />
            </Link>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-red-50 transition-colors border border-red-100 shadow-sm mt-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-medium text-red-600">Log Out</span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
