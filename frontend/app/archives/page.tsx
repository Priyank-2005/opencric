// filepath: frontend/app/archives/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMatches } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

export default function Archives() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  useEffect(() => {
    getMatches()
      .then(data => {
        // Filter only completed matches
        const completed = data.filter((m: any) => m.info.outcome?.winner);
        setMatches(completed);
        
        // Auto-select the year of the most recent match if available
        if (completed.length > 0) {
           const latestYear = completed[0].info.dates?.[0]?.split('-')[0];
           if (latestYear) setSelectedYear(latestYear);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter matches by selected year
  const filteredMatches = matches.filter(m => m.info.dates?.[0]?.startsWith(selectedYear));

  // Generate list of available years from data + some defaults
  const years = Array.from(new Set(matches.map(m => m.info.dates?.[0]?.split('-')[0]).filter(Boolean))).sort().reverse();
  const displayYears = years.length > 0 ? years : ['2025', '2024', '2023'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#009270]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Sub-header Tabs */}
        <div className="flex border-b border-gray-200 mb-6 text-sm font-medium text-gray-600 overflow-x-auto">
           <button className="px-4 py-3 border-b-2 border-transparent hover:text-black whitespace-nowrap">Current Matches</button>
           <button className="px-4 py-3 border-b-2 border-transparent hover:text-black whitespace-nowrap">Current & Future Series</button>
           <button className="px-4 py-3 border-b-2 border-transparent hover:text-black whitespace-nowrap">Matches By Day</button>
           <button className="px-4 py-3 border-b-2 border-transparent hover:text-black whitespace-nowrap">Teams</button>
           <button className="px-4 py-3 border-b-2 border-[#009270] text-[#009270] font-bold whitespace-nowrap">Series Archive</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* LEFT COLUMN: Match List */}
           <div className="lg:col-span-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Cricket Match Archives</h1>
              
              <div className="mb-4">
                 <h2 className="text-xl font-bold text-gray-800 border-b pb-2">{selectedYear}</h2>
              </div>

              <div className="flex">
                 {/* Category Label (Optional, mimics "International" on left) */}
                 <div className="hidden sm:block w-32 pr-4 pt-4">
                    <span className="text-[#009270] font-bold text-sm">International</span>
                 </div>

                 {/* Series List */}
                 <div className="flex-1 space-y-0">
                    {filteredMatches.length > 0 ? (
                       <div className="divide-y divide-gray-100">
                          {filteredMatches.map((m) => {
                             const dateStr = m.info.dates[0];
                             const formattedDate = dateStr ? format(parseISO(dateStr), 'MMM dd') : '';
                             return (
                                <div key={m._id} className="py-4 flex flex-col sm:flex-row sm:items-baseline hover:bg-gray-50 transition-colors px-2">
                                   <Link href={`/match/${m._id}`} className="flex-1 text-sm font-bold text-gray-900 hover:text-[#009270] hover:underline mr-4">
                                      {m.info.event?.name || `${m.info.teams[0]} vs ${m.info.teams[1]}`}
                                   </Link>
                                   <span className="text-xs text-gray-500 whitespace-nowrap">{formattedDate}</span>
                                </div>
                             );
                          })}
                       </div>
                    ) : (
                       <div className="text-gray-500 italic p-8 text-center bg-gray-50 rounded border border-gray-200 mt-4">
                          No completed series found for {selectedYear}.
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN: Year Filter */}
           <div className="lg:col-span-1">
              <h3 className="font-bold text-gray-800 uppercase text-sm mb-4 border-b pb-2">All Seasons</h3>
              
              {/* Year Groups */}
              <div className="mb-6">
                 <h4 className="text-sm font-bold text-gray-700 mb-2">{selectedYear}-{parseInt(selectedYear)-4}</h4>
                 <div className="grid grid-cols-3 gap-2">
                    {displayYears.map(year => (
                       <button
                         key={year}
                         onClick={() => setSelectedYear(year)}
                         className={clsx(
                            "py-2 text-xs font-bold rounded border transition-colors",
                            selectedYear === year 
                              ? "bg-[#333] text-white border-[#333]" 
                              : "bg-[#f4f5f7] text-gray-600 border-gray-200 hover:bg-gray-200"
                         )}
                       >
                          {year}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}