// filepath: frontend/app/rankings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getRankings } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function Rankings() {
  const [rankings, setRankings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [format, setFormat] = useState<'test' | 'odi' | 't20'>('test');
  const [category, setCategory] = useState<'batting' | 'bowling' | 'allrounder' | 'team'>('batting');

  useEffect(() => {
    getRankings().then(data => {
      setRankings(data);
      setLoading(false);
    });
  }, []);

  const getActiveData = () => {
    if (!rankings) return [];
    // Construct key to match DB: e.g., "men_test_batting"
    const key = `${gender}_${format}_${category}`;
    return rankings[key] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#009270]" />
      </div>
    );
  }

  const data = getActiveData();

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">ICC Cricket Rankings</h1>

        {/* Level 1: Gender */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          {['men', 'women'].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g as any)}
              className={clsx(
                "pb-2 px-4 text-lg font-bold capitalize transition-colors border-b-4 -mb-1",
                gender === g ? "border-[#009270] text-[#009270]" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Level 2: Format */}
        <div className="flex gap-2 mb-6">
          {['test', 'odi', 't20'].map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f as any)}
              className={clsx(
                "px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-sm",
                format === f ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Level 3: Category */}
        <div className="gap-1 mb-8 bg-white p-1 rounded-lg shadow-sm inline-flex">
          {['batting', 'bowling', 'allrounder', 'team'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c as any)}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-bold capitalize transition-all",
                category === c ? "bg-[#009270] text-white shadow" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {c === 'allrounder' ? 'All Rounder' : c}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
             <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wider">
               {gender}'s {format} {category} Rankings
             </h2>
             <span className="text-xs text-gray-400">Last Updated: Recently</span>
          </div>
          
          {data.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
                  <th className="py-3 pl-6 w-16">Rank</th>
                  <th className="py-3">{category === 'team' ? 'Team' : 'Player'}</th>
                  {category !== 'team' && <th className="py-3">Team</th>}
                  <th className="py-3 pr-6 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.map((item: any, i: number) => (
                  // FIXED: Using a composite key to handle rank ties (e.g. two players at rank 14)
                  <tr key={`${item.rank}-${item.name || item.team}-${i}`} className="hover:bg-green-50/50 transition-colors">
                    <td className="py-3 pl-6 font-bold text-gray-800">{item.rank}</td>
                    <td className="py-3 font-medium text-gray-900">{item.name || item.team}</td>
                    {category !== 'team' && <td className="py-3 text-gray-500">{item.team}</td>}
                    <td className="py-3 pr-6 text-right font-bold text-gray-700">{item.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500 italic">
              No ranking data available for this category yet.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}