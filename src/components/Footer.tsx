export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-serif text-emerald-500 font-bold tracking-tight">A-One Massage</span>
            <p className="text-sm mt-1 text-stone-400">Relaxation at Your Doorstep – 24/7 Service</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="tel:9821196616" className="hover:text-emerald-400 transition-colors">Call: 9821196616</a>
            <a href="mailto:Yogenderkashyap2422@gmail.com" className="hover:text-emerald-400 transition-colors">Email Us</a>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-800 pt-8 text-sm text-center text-stone-500">
          &copy; {new Date().getFullYear()} A-One Body Massage. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
