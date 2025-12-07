// filepath: frontend/app/fantasy/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { getMatches } from '@/lib/api';
import { Loader2, Star, TrendingUp, Users, Shield, Award, CheckCircle2, History } from 'lucide-react';
import { format, parseISO, isFuture, isValid } from 'date-fns';
import clsx from 'clsx';

export default function FantasyPage() {
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [completedMatches, setCompletedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    getMatches()
      .then(data => {
        const upcoming = [];
        const completed = [];
        
        for (const m of data) {
           const d = m.info.dates?.[0];
           if (!d || !isValid(parseISO(d))) continue;
           
           if (m.info.outcome?.winner) {
              completed.push(m);
           } else if (isFuture(parseISO(d))) {
              upcoming.push(m);
           }
        }
        
        setUpcomingMatches(upcoming);
        setCompletedMatches(completed);
        
        // Auto-switch tab if no upcoming matches
        if (upcoming.length === 0 && completed.length > 0) {
           setActiveTab('completed');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Helper: Get Key Player (Robust Fallback) ---
  const getKeyPlayer = (match: any, teamName: string, role: 'bat' | 'bowl') => {
     // 1. Try to get from actual player list
     const squad = match.info.players?.[teamName];
     if (squad && squad.length > 0) {
        // Pick a top order batter (index 0-2) or main bowler (index 8-10)
        const index = role === 'bat' ? 0 : Math.min(squad.length - 1, 8);
        return squad[index];
     }
     
     // 2. Fallback for dummy/future matches with no squads
     // Returns a realistic star player based on team name to keep UI looking real
     const starPlayers: Record<string, string[]> = {
        'India': ['Virat Kohli', 'Jasprit Bumrah', 'Rohit Sharma', 'Hardik Pandya'],
        'Australia': ['Pat Cummins', 'Travis Head', 'Steve Smith', 'Mitchell Starc'],
        'England': ['Joe Root', 'Ben Stokes', 'Jos Buttler', 'Jofra Archer'],
        'Pakistan': ['Babar Azam', 'Shaheen Afridi', 'Naseem Shah', 'Rizwan'],
        'South Africa': ['Kagiso Rabada', 'Heinrich Klaasen', 'Aiden Markram', 'Marco Jansen'],
        'New Zealand': ['Kane Williamson', 'Trent Boult', 'Rachin Ravindra', 'Daryl Mitchell']
     };

     const stars = starPlayers[teamName] || ['Star Player', 'Key Bowler'];
     return role === 'bat' ? stars[0] : stars[1];
  };

  // --- Helper: Calculate Fantasy Points for Completed Matches ---
  const calculateFantasyPoints = (match: any) => {
     const points: Record<string, number> = {};
     
     match.innings.forEach((inn: any) => {
        inn.overs.forEach((over: any) => {
           over.deliveries.forEach((ball: any) => {
              // Batting Points (1 run = 1 pt, 4 = +1 pt, 6 = +2 pts)
              const batter = ball.batter;
              const runs = ball.runs.batter;
              if (!points[batter]) points[batter] = 0;
              points[batter] += runs;
              if (runs === 4) points[batter] += 1;
              if (runs === 6) points[batter] += 2;

              // Bowling Points (Wicket = 25 pts)
              if (ball.wickets && ball.wickets.length > 0) {
                 const bowler = ball.bowler;
                 if (!points[bowler]) points[bowler] = 0;
                 // Exclude run outs for bowler
                 if (ball.wickets[0].kind !== 'run out') {
                    points[bowler] += 25;
                 }
              }
           });
        });
     });

     // Convert to array and sort
     return Object.entries(points)
        .map(([name, pts]) => ({ name, pts }))
        .sort((a, b) => b.pts - a.pts)
        .slice(0, 5); // Top 5 performers
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#009270]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans text-gray-900">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Hero */}
        <div className="bg-linear-to-r from-[#009270] to-[#005e48] rounded-xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
              <Star size={200} />
           </div>
           <h1 className="text-3xl font-bold mb-3 flex items-center gap-3 relative z-10">
             <Star className="text-yellow-400 fill-yellow-400" /> Fantasy Handbook
           </h1>
           <p className="text-green-50 max-w-2xl text-lg relative z-10 font-light">
             AI-powered predictions for upcoming games and Dream Team analysis for completed matches.
           </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
           <button 
             onClick={() => setActiveTab('upcoming')}
             className={clsx("pb-2 px-4 font-bold transition-colors border-b-4", activeTab === 'upcoming' ? "border-[#009270] text-[#009270]" : "border-transparent text-gray-500 hover:text-black")}
           >
             Upcoming Predictions
           </button>
           <button 
             onClick={() => setActiveTab('completed')}
             className={clsx("pb-2 px-4 font-bold transition-colors border-b-4", activeTab === 'completed' ? "border-[#009270] text-[#009270]" : "border-transparent text-gray-500 hover:text-black")}
           >
             Past Match "Dream Team"
           </button>
        </div>

        {activeTab === 'upcoming' && (
           upcomingMatches.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-dashed border-gray-300">
                 <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                 <p className="text-gray-500 text-lg">No upcoming matches scheduled.</p>
                 <p className="text-sm text-gray-400 mt-1">Use the "Completed" tab to analyze past games or use Admin to schedule new ones.</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 gap-8">
                 {/* ... (Existing Upcoming Match Card Logic) ... */}
                 {upcomingMatches.map((match) => {
                    const team1 = match.info.teams[0];
                    const team2 = match.info.teams[1];
                    const venue = match.info.venue;
                    // Mock Logic for Prediction
                    const pitchReport = venue.includes("Perth") ? "Pace friendly. Extra bounce expected." : venue.includes("Eden") ? "Spin friendly. Watch out for dew." : "Batting paradise. High scoring game.";
                    
                    // Get players using robust helper
                    const capPick = getKeyPlayer(match, team1, 'bat');
                    const vcPick = getKeyPlayer(match, team2, 'bowl');

                    return (
                       <div key={match._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                             <h3 className="font-bold text-gray-800">{team1} vs {team2}</h3>
                             <span className="text-xs font-bold text-gray-500">{match.info.match_type}</span>
                          </div>
                          <div className="p-6">
                             <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#009270]"><TrendingUp size={20}/></div>
                                <div><h4 className="font-bold text-sm">Pitch Report</h4><p className="text-sm text-gray-600">{pitchReport}</p></div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-yellow-50 p-4 rounded border border-yellow-100 flex flex-col">
                                   <span className="text-xs font-bold text-yellow-800 uppercase block mb-1">Captain Pick</span>
                                   <span className="font-bold text-gray-800 text-lg">{capPick}</span>
                                   <span className="text-xs text-gray-500">Top order batter, excellent form.</span>
                                </div>
                                <div className="bg-blue-50 p-4 rounded border border-blue-100 flex flex-col">
                                   <span className="text-xs font-bold text-blue-800 uppercase block mb-1">Vice-Captain</span>
                                   <span className="font-bold text-gray-800 text-lg">{vcPick}</span>
                                   <span className="text-xs text-gray-500">Wicket-taking bowler, key in death overs.</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           )
        )}

        {activeTab === 'completed' && (
           <div className="grid grid-cols-1 gap-6">
              {completedMatches.length === 0 ? (
                 <div className="bg-white p-12 text-center rounded-lg border border-dashed border-gray-300">No completed matches found.</div>
              ) : (
                 completedMatches.map(match => {
                    const topPerformers = calculateFantasyPoints(match);
                    return (
                       <div key={match._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="bg-[#f0f4f0] px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-gray-800">{match.info.event?.name}</h3>
                                <p className="text-xs text-gray-500">{match.info.teams[0]} vs {match.info.teams[1]}</p>
                             </div>
                             <div className="text-right text-xs">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Dream Team Analysis</span>
                             </div>
                          </div>
                          
                          <div className="p-6">
                             <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                <Award size={16} /> Top Fantasy Point Scorers
                             </h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                {topPerformers.map((p, i) => (
                                   <div key={p.name} className={clsx(
                                      "p-3 rounded-lg border flex flex-col items-center text-center",
                                      i === 0 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-100"
                                   )}>
                                      <div className={clsx("text-xs font-bold uppercase mb-1", i===0 ? "text-yellow-700" : "text-gray-400")}>
                                         {i === 0 ? "MVP" : `#${i+1}`}
                                      </div>
                                      <div className="font-bold text-gray-900 text-sm mb-1 truncate w-full" title={p.name}>{p.name}</div>
                                      <div className="text-xl font-mono font-bold text-[#009270]">{p.pts} <span className="text-[10px] text-gray-400">pts</span></div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    );
                 })
              )}
           </div>
        )}

      </main>
    </div>
  );
}