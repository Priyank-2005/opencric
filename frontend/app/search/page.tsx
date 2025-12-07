// filepath: frontend/app/search/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMatches } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Loader2, Search as SearchIcon, Calendar } from 'lucide-react';
import { format } from 'date-fns';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchMatches(query)
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <SearchIcon className="text-[#009270]" /> Search Results for "{query}"
        </h1>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#009270] w-8 h-8" /></div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((match: any) => (
              <Link key={match._id} href={`/match/${match._id}`} className="block">
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        {match.info.match_type} • {match.info.venue}
                      </span>
                      <span className="text-xs text-blue-600 font-mono">
                        {match.info.event?.name}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-900">
                        {match.info.teams[0]} vs {match.info.teams[1]}
                      </h3>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                         <Calendar size={12} />
                         {match.info.dates?.[0]}
                      </div>
                   </div>
                   <div className="mt-2 text-sm text-green-700 font-medium">
                      {match.info.outcome?.winner 
                        ? `Result: ${match.info.outcome.winner} won` 
                        : "Match details"}
                   </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg border border-dashed border-gray-300 text-center">
             <p className="text-gray-500 text-lg">No matches found matching "{query}".</p>
             <p className="text-sm text-gray-400 mt-2">Try searching for a team name (e.g. "India") or tournament.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrap in Suspense for useSearchParams hook usage in Client Component
export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  );
}