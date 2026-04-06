import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MapPin, Loader } from 'lucide-react';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function LocationInfo() {
  const [info, setInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocationInfo = async () => {
      setLoading(true);
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "What are some good landmarks or areas near New Delhi, India where a mobile massage service might be popular?",
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });
        setInfo(response.text || 'We serve the greater metropolitan area with 24/7 mobile massage services.');
      } catch (error) {
        console.error("Error fetching location info:", error);
        setInfo('We serve the greater metropolitan area with 24/7 mobile massage services directly to your doorstep.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationInfo();
  }, []);

  return (
    <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 mt-12">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-serif font-semibold text-stone-900">Service Areas</h2>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2 text-stone-500">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Loading service area information...</span>
        </div>
      ) : (
        <div className="prose prose-stone max-w-none text-stone-600">
          <div className="markdown-body">
            <Markdown>{info}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
