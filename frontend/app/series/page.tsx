// filepath: frontend/app/series/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSeries } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Loader2, Calendar } from 'lucide-react';

export default function SeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeries().then(data => {
      setSeries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#009270]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Cricket Schedule & Series</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-500 uppercase text-xs tracking-wider">
              Current & Upcoming Series
           </div>
           <div className="divide-y divide-gray-100">
              {series.map((s) => (
                <div key={s.id} className="p-6 flex justify-between items-center hover:bg-green-50 transition-colors cursor-pointer group">
                   <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#009270] mb-1">{s.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                         <Calendar size={14} /> {s.dates}
                      </p>
                   </div>
                   <button className="text-xs font-bold text-[#009270] border border-[#009270] px-4 py-2 rounded-full hover:bg-[#009270] hover:text-white transition-all">
                      View Fixtures
                   </button>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}