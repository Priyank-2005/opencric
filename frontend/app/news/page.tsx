// filepath: frontend/app/news/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getNews } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Loader2, Clock } from 'lucide-react';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews().then(data => {
      setNews(data);
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
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Latest Cricket News</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer">
               <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition duration-500" />}
               </div>
               <div className="p-5 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-[#009270]">{item.title}</h2>
                  <p className="text-sm text-gray-600 mb-4 flex-1">{item.summary}</p>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                     <Clock size={12} /> {item.time}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}