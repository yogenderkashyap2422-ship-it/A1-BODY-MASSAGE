import { motion } from 'motion/react';
import { Phone, Mail } from 'lucide-react';
import LocationInfo from '../components/LocationInfo';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Contact Us</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          We're here for you 24/7. Reach out to us anytime to book a session or ask a question.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.a 
            href="tel:9821196616"
            whileHover={{ y: -5 }}
            className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-stone-100 text-center transition-shadow hover:shadow-md"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Call Us</h3>
            <p className="text-emerald-600 font-medium text-lg">9821196616</p>
            <p className="text-stone-500 text-sm mt-2">Available 24/7</p>
          </motion.a>

          <motion.a 
            href="mailto:Yogenderkashyap2422@gmail.com"
            whileHover={{ y: -5 }}
            className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-stone-100 text-center transition-shadow hover:shadow-md"
          >
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Email Us</h3>
            <p className="text-amber-700 font-medium break-all">Yogenderkashyap2422@gmail.com</p>
            <p className="text-stone-500 text-sm mt-2">We reply promptly</p>
          </motion.a>
        </div>

        <LocationInfo />
      </div>
    </div>
  );
}
