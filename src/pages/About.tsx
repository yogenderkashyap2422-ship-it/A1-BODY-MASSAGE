import { motion } from 'motion/react';
import { CheckCircle, Shield, Clock, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">About Us</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Dedicated to bringing professional relaxation and wellness directly to your doorstep.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <img 
            src="https://picsum.photos/seed/massage/800/600?blur=1" 
            alt="Massage Therapy" 
            className="rounded-2xl shadow-xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-serif font-semibold text-stone-900">Why Choose A-One?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-stone-900">10 Years Experience</h3>
                <p className="text-stone-600">Our therapists are highly trained with over a decade of hands-on experience in various massage techniques.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-stone-900">24/7 Service</h3>
                <p className="text-stone-600">We understand your schedule. Book a session anytime, day or night, and we'll be there.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-stone-900">For Ladies & Gents</h3>
                <p className="text-stone-600">We offer specialized, respectful, and tailored services for both men and women.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-stone-900">Professional & Hygienic</h3>
                <p className="text-stone-600">Your safety and comfort are our top priorities. We maintain the highest standards of hygiene.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
