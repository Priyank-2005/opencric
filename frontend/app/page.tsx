// frontend/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getMatches, getNews } from '@/lib/api';
import Link from 'next/link';
import { Loader2, ChevronRight, PlayCircle, Calendar, Filter } from 'lucide-react';
import { format, isFuture, parseISO, isValid, isToday, isYesterday } from 'date-fns';
import clsx from 'clsx';
import Navbar from '@/components/Navbar';

// Helper to get team logo URL
const getTeamLogo = (teamName: string) => {
  const encodedName = encodeURIComponent(teamName);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=64&font-size=0.4`;
};

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'recent' | 'upcoming'>('live');

  // --- NEW: friendlier live detection + debug log ---
  useEffect(() => {
    Promise.all([getMatches(), getNews()])
      .then(([matchesData, newsData]) => {
        // Debug: inspect API payload shape during development
        if (typeof window !== 'undefined') {
          console.log('DEBUG: matchesData from API ->', matchesData);
        }

        setMatches(matchesData);
        setNews(newsData);

        const hasLive = matchesData.some((m: any) => {
          const d = m.info.dates?.[0];
          const dateValid = d && isValid(parseISO(d));
          const date = dateValid ? parseISO(d) : null;

          // Match started if innings array exists and has entries
          const started = Array.isArray(m.innings) && m.innings.length > 0;

          // Toss presence indicates match setup has begun
          const tossExists = m.info.toss && Object.keys(m.info.toss).length > 0;

          // Consider current if date is not in the future (i.e., today or past)
          const isCurrent = date ? !isFuture(date) : true;

          // Live if no winner AND (match started OR toss exists and date not future)
          return !m.info.outcome?.winner && (started || (tossExists && isCurrent));
        });

        if (!hasLive) setActiveTab('recent');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // --- UPDATED isLive helper (more forgiving) ---
  const isLive = (m: any) => {
    const d = m.info.dates?.[0];
    const dateValid = d && isValid(parseISO(d));
    const date = dateValid ? parseISO(d) : null;

    const started = Array.isArray(m.innings) && m.innings.length > 0;
    const tossExists = m.info.toss && Object.keys(m.info.toss).length > 0;

    const isCurrent = date ? !isFuture(date) : true;

    return !m.info.outcome?.winner && (started || (tossExists && isCurrent));
  };

  const isUpcoming = (m: any) => {
     const d = m.info.dates?.[0];
     return d && isValid(parseISO(d)) && isFuture(parseISO(d));
  };

  const isRecent = (m: any) => !!m.info.outcome?.winner;

  // Get matches for active tab
  const displayMatches = matches.filter(m => {
     if (activeTab === 'live') return isLive(m);
     if (activeTab === 'upcoming') return isUpcoming(m);
     if (activeTab === 'recent') return isRecent(m);
     return false;
  }).slice(0, 10);

  // Helper to calculate score and overs correctly (Legal balls only)
  const getScore = (m: any, team: string) => {
    const inn = m.innings?.find((i: any) => i.team === team);
    if (!inn) return '';
    let r = 0, w = 0;
    let legalBalls = 0;

    if(inn.overs) {
      inn.overs.forEach((o: any) => o.deliveries.forEach((d: any) => {
        r += d.runs.total;
        if (d.wickets?.length) w++;

        // Count legal balls for over calculation
        const isWide = d.extras && d.extras.wides;
        const isNoBall = d.extras && d.extras.noballs;
        if (!isWide && !isNoBall) {
            legalBalls++;
        }
      }));
    }
    const overs = Math.floor(legalBalls / 6) + (legalBalls % 6) / 10;
    return `${r}/${w} (${overs})`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#e3e6e3]"><Loader2 className="w-10 h-10 animate-spin text-[#009270]" /></div>;

  return (
    <div className="min-h-screen bg-[#e3e6e3] font-sans text-gray-900">
      <Navbar />

      {/* Quick Access Bar */}
      <div className="bg-white border-b border-gray-300 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto text-xs font-medium text-gray-600 items-center">
           <span className="font-bold text-black text-xs uppercase tracking-wide">Quick Access</span>
           <span className="text-gray-300 text-lg font-light">|</span>
           <a href="https://www.wplt20.com/auction" target="_blank" rel="noopener noreferrer" className="hover:text-[#009270] whitespace-nowrap flex items-center gap-1">WPL Auction 2026 <span className="bg-red-500 text-white text-[9px] px-1 rounded">NEW</span></a>
           <Link href="/fantasy" className="hover:text-[#009270] whitespace-nowrap">Fantasy Handbook</Link>
           <Link href="/series" className="hover:text-[#009270] whitespace-nowrap">Browse Series</Link>
           <Link href="/rankings" className="hover:text-[#009270] whitespace-nowrap">ICC Rankings</Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* LEFT SIDEBAR: Latest News */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
           <div className="bg-white rounded-sm border border-gray-200 p-0 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                 <h3 className="text-[#009270] font-bold text-sm uppercase">Latest News</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {news.slice(0, 8).map((item, i) => (
                  <div key={i} className="p-3 group cursor-pointer hover:bg-gray-50 transition-colors">
                    <h4 className="text-sm font-medium leading-snug text-gray-800 group-hover:text-[#009270]">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 block mt-1">{item.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center bg-gray-50 border-t border-gray-100">
                 <Link href="/news" className="text-blue-600 text-xs font-bold hover:underline">More News</Link>
              </div>
           </div>
        </div>

        {/* CENTER: Tabbed Match Feed */}
        <div className="lg:col-span-2 space-y-0">
           {/* Tabs */}
           <div className="flex bg-white rounded-t-sm border border-gray-200 border-b-0 overflow-hidden">
              {['live', 'recent', 'upcoming'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={clsx(
                      "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all relative flex items-center justify-center gap-2",
                      activeTab === tab 
                        ? "text-[#009270] bg-white" 
                        : "text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700"
                   )}
                 >
                    {activeTab === tab && <span className="w-1.5 h-1.5 rounded-full bg-[#009270] absolute left-4"></span>}
                    {tab} Matches
                 </button>
              ))}
           </div>

           {/* Match List */}
           <div className="bg-white rounded-b-sm border border-gray-200 overflow-hidden shadow-sm min-h-[300px]">
              {displayMatches.length > 0 ? (
                 <div className="divide-y divide-gray-100">
                    {displayMatches.map((m: any) => (
                      <Link key={m._id} href={`/match/${m._id}`} className="block hover:bg-[#f9f9f9] transition-colors p-4 group relative">
                         {/* Status Badge */}
                         <div className="absolute top-4 right-4">
                            <span className={clsx("text-[9px] px-2 py-0.5 rounded font-bold uppercase border", 
                               activeTab === 'live' ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-500 border-gray-200"
                            )}>
                               {activeTab === 'live' ? 'Live' : activeTab === 'upcoming' ? 'Upcoming' : 'Result'}
                            </span>
                         </div>

                         <div className="flex justify-between items-start mb-3 pr-16">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate">
                               {m.info.event?.name || 'Series'} • {m.info.match_type} • {m.info.venue}
                            </span>
                         </div>
                         
                         <div className="space-y-3 mb-3">
                            {m.info.teams.map((t: string) => (
                              <div key={t} className="flex justify-between items-center pr-2">
                                 <div className="flex items-center gap-3">
                                    <img 
                                      src={getTeamLogo(t)} 
                                      alt={`${t} logo`} 
                                      className="w-6 h-6 rounded object-cover border border-gray-200 p-0.5"
                                    />
                                    <span className="text-sm font-bold text-gray-900">{t}</span>
                                 </div>
                                 <span className={clsx("text-sm font-mono font-semibold", activeTab === 'upcoming' ? "text-gray-300" : "text-black")}>
                                    {activeTab === 'upcoming' ? '--' : getScore(m, t)}
                                 </span>
                              </div>
                            ))}
                         </div>

                         <div className="text-xs text-blue-600 group-hover:underline font-medium truncate mt-2">
                            {activeTab === 'upcoming' 
                              ? `Starts at ${format(new Date(m.info.dates[0]), 'MMM d, h:mm a')}`
                              : m.info.outcome?.winner 
                                ? `${m.info.outcome.winner} won by ${m.info.outcome.by?.runs ? m.info.outcome.by.runs + ' runs' : m.info.outcome.by?.wickets + ' wickets'}`
                                : m.innings?.length > 0 ? "Match in Progress - Live updates" : "Toss scheduled"}
                         </div>
                      </Link>
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50/50">
                    <Filter className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No {activeTab} matches available.</p>
                 </div>
              )}
           </div>
        </div>

        {/* RIGHT SIDEBAR: Videos/Specials */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
           {/* Featured Video */}
           <div className="bg-white rounded-sm border border-gray-200 p-0 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                 <h3 className="text-[#009270] font-bold text-sm uppercase">Featured Videos</h3>
              </div>
              <div className="p-3">
                 <div className="aspect-video bg-black rounded overflow-hidden relative mb-2 cursor-pointer group">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <PlayCircle className="w-10 h-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1 rounded font-bold">08:09</div>
                 </div>
                 <p className="text-xs font-bold leading-tight text-gray-800 hover:text-[#009270] cursor-pointer">
                    Gambhir roars at critics: "Stick to your domain!"
                 </p>
                 <span className="text-[10px] text-gray-400 mt-1 block">2h ago</span>
              </div>
           </div>

           {/* Special */}
           <div className="bg-white rounded-sm border border-gray-200 p-0 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                 <h3 className="text-[#009270] font-bold text-sm uppercase">Specials</h3>
              </div>
              <div className="p-3">
                 <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                    [Image: Analysis]
                 </div>
                 <p className="text-xs font-bold leading-tight text-gray-900 hover:text-[#009270] cursor-pointer">
                    The tactical blunder that cost the game
                 </p>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
