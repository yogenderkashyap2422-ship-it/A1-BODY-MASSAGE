import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';

export default function Report() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        subject,
        message,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-stone-100 p-12"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Report Submitted</h2>
          <p className="text-stone-600 mb-8">Thank you for your feedback. We will look into it shortly.</p>
          <button
            onClick={() => setSuccess(false)}
            className="text-emerald-600 font-medium hover:text-emerald-700"
          >
            Submit another report
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">Submit a Report</h1>
        <p className="text-stone-600">
          Have an issue or feedback? Let us know and we'll address it immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="What is this regarding?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Please provide details..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !subject || !message}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
