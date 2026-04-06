import { Link } from 'react-router-dom';
import { Clock, Award, Users, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-200/50 gold-glow bg-white flex flex-col md:flex-row"
        >
          {/* Left Content */}
          <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative z-10 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-widest uppercase">Premium Spa Experience</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 text-emerald-950 leading-tight">
              A-One Body <br/>
              <span className="text-amber-600">Massage</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 mb-8 font-light italic">
              "Relax • Rejuvenate • Refresh"
            </p>
            <p className="text-stone-500 mb-10 max-w-md leading-relaxed">
              Experience ultimate relaxation at your doorstep. Our professional therapists provide luxury spa services 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-medium text-white gold-gradient w-full sm:w-auto"
                >
                  Book Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors w-full sm:w-auto"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10 hidden md:block"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent z-10 md:hidden"></div>
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200"
              alt="Luxury Spa Massage"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-8 rounded-3xl glass-panel"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-amber-100">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-emerald-950 mb-3">10+ Years Experience</h3>
              <p className="text-stone-600 leading-relaxed">Professional therapists delivering premium massage experiences with expert techniques.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-8 rounded-3xl glass-panel"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-emerald-950 mb-3">24/7 Service</h3>
              <p className="text-stone-600 leading-relaxed">Available around the clock. True luxury means relaxation on your own schedule.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center p-8 rounded-3xl glass-panel"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-amber-100">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-emerald-950 mb-3">Ladies & Gents</h3>
              <p className="text-stone-600 leading-relaxed">Specialized luxury services tailored perfectly for both men and women.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
