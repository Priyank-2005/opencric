// filepath: frontend/app/match/[id]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getMatchById } from '@/lib/api';
import io, { Socket } from 'socket.io-client';
import { Loader2, Calendar, MapPin, Trophy, ChevronLeft, User, BarChart2, X } from 'lucide-react';
import clsx from 'clsx';
import Navbar from '@/components/Navbar';
// Import Recharts - Added Scatter/ComposedChart for wickets
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, ComposedChart, Scatter } from 'recharts';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'commentary' | 'scorecard' | 'analysis' | 'teams'>('commentary');
  const [filterType, setFilterType] = useState<'all' | 'wicket' | 'four' | 'six'>('all');
  
  // Feature 2: Player Profile Modal State
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);

  const fetchMatch = () => {
    getMatchById(id as string)
      .then(setMatch)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    fetchMatch();
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    socketRef.current = io(socketUrl);
    socketRef.current.on(`match:${id}`, (payload) => {
      if (payload.type === 'score_update') fetchMatch();
    });
    return () => { socketRef.current?.disconnect(); };
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="w-8 h-8 animate-spin text-[#009270]" /></div>;
  if (!match) return <div className="h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Match not found</div>;

  const { info, innings } = match;
  const lastInning = innings && innings.length > 0 ? innings[innings.length - 1] : null;

  // --- Helper: Calculate Score ---
  const calculateScore = (inn: any) => {
    let r = 0, w = 0, b = 0;
    inn.overs.forEach((o: any) => {
      o.deliveries.forEach((d: any) => {
        r += d.runs.total;
        if (d.wickets?.length) w++;
        // Count legal balls for overs
        const isWide = d.extras && d.extras.wides;
        const isNoBall = d.extras && d.extras.noballs;
        if (!isWide && !isNoBall) b++;
      });
    });
    const overs = Math.floor(b / 6) + (b % 6) / 10;
    return { runs: r, wickets: w, overs };
  };

  // --- Helper: Generate Graphs Data (Enhanced with Wickets) ---
  const getGraphData = (inn: any) => {
     let cumulativeRuns = 0;
     return inn.overs.map((o: any, i: number) => {
        let overRuns = 0;
        let wicketsInOver = 0;
        o.deliveries.forEach((d: any) => {
           overRuns += d.runs.total;
           if(d.wickets?.length > 0) wicketsInOver++;
        });
        cumulativeRuns += overRuns;
        return { 
           over: i + 1, 
           runs: overRuns, 
           total: cumulativeRuns,
           // For bar chart: show a dot if wicket fell (arbitrary height or just boolean flag for custom shape)
           wickets: wicketsInOver > 0 ? overRuns + 1 : null, // Position dot slightly above bar
           wicketCount: wicketsInOver
        };
     });
  };

  // --- Helper: Get Detailed Scorecard Data ---
  const getScorecardData = (inn: any) => {
     const batters: any = {};
     const bowlers: any = {};
     
     inn.overs.forEach((o: any) => {
        o.deliveries.forEach((d: any) => {
           // Batters
           const bName = d.batter;
           if (!batters[bName]) batters[bName] = { runs: 0, balls: 0, 4: 0, 6: 0, out: null };
           batters[bName].runs += d.runs.batter;
           const isWide = d.extras?.wides;
           if (!isWide) batters[bName].balls++;
           if (d.runs.batter === 4) batters[bName][4]++;
           if (d.runs.batter === 6) batters[bName][6]++;
           if (d.wickets?.length) {
              const wicket = d.wickets[0];
              if (wicket.player_out === bName) batters[bName].out = wicket.kind;
           }

           // Bowlers
           const bowlName = d.bowler;
           if (!bowlers[bowlName]) bowlers[bowlName] = { runs: 0, balls: 0, w: 0 };
           bowlers[bowlName].runs += d.runs.total; // Runs conceded
           // Legal balls
           const isNoBall = d.extras?.noballs;
           if (!isWide && !isNoBall) bowlers[bowlName].balls++;
           if (d.wickets?.length) {
               // Credit wicket to bowler if not run out
               if (d.wickets[0].kind !== 'run out') bowlers[bowlName].w++;
           }
        });
     });
     return { batters, bowlers };
  };

  // Custom Wicket Dot for Line Chart
  const WicketDot = (props: any) => {
     const { cx, cy, payload } = props;
     if (payload.wicketCount > 0) {
        return (
           <circle cx={cx} cy={cy} r={4} fill="red" stroke="white" strokeWidth={2} />
        );
     }
     return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-10 dark:bg-gray-900 transition-colors">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-slate-900 text-white pb-16 pt-6 relative overflow-hidden shadow-lg">
         <div className="absolute top-0 right-0 opacity-5"><Trophy size={300} /></div>
         <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="flex items-center text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">
               <span>{info.match_type} • {info.city}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h1 className="text-3xl font-bold">{info.teams[0]}</h1>
                  <div className="text-xl mt-1 font-mono text-blue-400">
                     {innings?.find((i:any) => i.team === info.teams[0]) ? (() => { const s = calculateScore(innings.find((i:any) => i.team === info.teams[0])); return `${s.runs}/${s.wickets} (${s.overs})`; })() : 'Yet to Bat'}
                  </div>
               </div>
               <div className="text-slate-500 font-bold text-xl">VS</div>
               <div className="text-right">
                  <h1 className="text-3xl font-bold">{info.teams[1]}</h1>
                  <div className="text-xl mt-1 font-mono text-blue-400">
                     {innings?.find((i:any) => i.team === info.teams[1]) ? (() => { const s = calculateScore(innings.find((i:any) => i.team === info.teams[1])); return `${s.runs}/${s.wickets} (${s.overs})`; })() : 'Yet to Bat'}
                  </div>
               </div>
            </div>
            <div className="text-sm font-medium text-slate-300 bg-slate-800/50 inline-block px-3 py-1 rounded-full">
               {info.outcome?.winner ? `${info.outcome.winner} won` : `Live • ${info.toss?.winner} elected to ${info.toss?.decision}`}
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 -mt-8 mx-0 md:mx-4 md:rounded-t-lg max-w-4xl md:ml-auto md:mr-auto">
         <div className="flex px-4 overflow-x-auto">
            {['commentary', 'scorecard', 'analysis', 'teams'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab as any)} className={clsx("py-4 px-6 text-sm font-bold uppercase tracking-wide border-b-4 transition-colors whitespace-nowrap", activeTab === tab ? "border-[#009270] text-[#009270]" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200")}>{tab}</button>
            ))}
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
         
         {/* --- COMMENTARY TAB --- */}
         {activeTab === 'commentary' && (
            <div className="space-y-4">
               {/* Filters (Feature 6) */}
               <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {[
                     { id: 'all', label: 'All' },
                     { id: 'wicket', label: 'Wickets', color: 'bg-red-100 text-red-700 border-red-200' },
                     { id: 'four', label: 'Fours', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                     { id: 'six', label: 'Sixes', color: 'bg-green-100 text-green-700 border-green-200' }
                  ].map(f => (
                     <button 
                        key={f.id} 
                        onClick={() => setFilterType(f.id as any)}
                        className={clsx(
                           "px-3 py-1 rounded-full text-xs font-bold border transition-colors",
                           filterType === f.id 
                              ? (f.color || "bg-gray-800 text-white border-gray-800") 
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        )}
                     >
                        {f.label}
                     </button>
                  ))}
               </div>

               {lastInning ? [...lastInning.overs].reverse().map((over: any) => (
                  <div key={over.over} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                     <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                        <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Over {over.over + 1}</span>
                     </div>
                     <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {[...over.deliveries].reverse().filter((ball: any) => {
                           if (filterType === 'wicket') return ball.wickets && ball.wickets.length > 0;
                           if (filterType === 'four') return ball.runs.batter === 4;
                           if (filterType === 'six') return ball.runs.batter === 6;
                           return true;
                        }).map((ball: any, i: number) => (
                           <div key={i} className="flex p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <div className="w-12 pt-1 font-mono text-xs text-gray-500 dark:text-gray-400">{over.over}.{over.deliveries.length - i}</div>
                              <div className="flex-1">
                                 <div className="flex items-center mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white text-sm mr-2">{ball.bowler} to {ball.batter}</span>
                                    {ball.wickets?.length > 0 && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold">OUT</span>}
                                    {ball.runs.batter === 4 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded font-bold">4</span>}
                                    {ball.runs.batter === 6 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold">6</span>}
                                 </div>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {ball.wickets?.length ? <span className="text-red-600 dark:text-red-400 font-bold">{ball.wickets[0].kind}</span> : `${ball.runs.total} run(s)`}
                                    {ball.commentary && <span className="text-gray-500 dark:text-gray-400 ml-1"> - {ball.commentary}</span>}
                                 </p>
                              </div>
                              <div className="w-8 text-right font-bold text-gray-800 dark:text-white">{ball.runs.total}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               )) : <div className="p-8 text-center text-gray-500 dark:text-gray-400">Match hasn't started.</div>}
            </div>
         )}

         {/* --- SCORECARD TAB (Feature 1) --- */}
         {activeTab === 'scorecard' && (
            <div className="space-y-6">
               {innings.map((inn: any, idx: number) => {
                  const { batters, bowlers } = getScorecardData(inn);
                  return (
                     <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-[#009270] text-white px-4 py-2 font-bold text-sm uppercase flex justify-between">
                           <span>{inn.team} Innings</span>
                           <span>{calculateScore(inn).runs}/{calculateScore(inn).wickets} ({calculateScore(inn).overs})</span>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left dark:text-gray-200">
                              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                                 <tr><th className="py-2 pl-4">Batter</th><th className="py-2">R</th><th className="py-2">B</th><th className="py-2">4s</th><th className="py-2">6s</th><th className="py-2">SR</th></tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                 {Object.entries(batters).map(([name, s]: any) => (
                                    <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedPlayer({ name, role: 'Batter', ...s })}>
                                       <td className="py-2 pl-4 font-medium">
                                          <div className="text-gray-900 dark:text-white">{name}</div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">{s.out ? <span className="text-red-500">{s.out}</span> : 'not out'}</div>
                                       </td>
                                       <td className="py-2 font-bold">{s.runs}</td>
                                       <td className="py-2">{s.balls}</td>
                                       <td className="py-2">{s[4]}</td>
                                       <td className="py-2">{s[6]}</td>
                                       <td className="py-2">{s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0'}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                           <div className="bg-gray-50 dark:bg-gray-700 px-4 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border-y border-gray-200 dark:border-gray-600">Bowling</div>
                           <table className="w-full text-sm text-left dark:text-gray-200">
                              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                                 <tr><th className="py-2 pl-4">Bowler</th><th className="py-2">O</th><th className="py-2">M</th><th className="py-2">R</th><th className="py-2">W</th><th className="py-2">Eco</th></tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                 {Object.entries(bowlers).map(([name, s]: any) => {
                                    const overs = Math.floor(s.balls / 6) + (s.balls % 6) / 10;
                                    return (
                                       <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                          <td className="py-2 pl-4 font-medium text-gray-900 dark:text-white">{name}</td>
                                          <td className="py-2">{overs}</td>
                                          <td className="py-2">0</td>
                                          <td className="py-2">{s.runs}</td>
                                          <td className="py-2 font-bold">{s.w}</td>
                                          <td className="py-2">{s.balls > 0 ? ((s.runs / s.balls) * 6).toFixed(1) : '0.0'}</td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* --- ANALYSIS TAB (Feature 4 - Updated for Wickets) --- */}
         {activeTab === 'analysis' && (
            <div className="space-y-6">
               {innings.map((inn: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                     <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart2 /> Run Rate Analysis: <span className="text-[#009270]">{inn.team}</span>
                     </h3>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={getGraphData(inn)}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis dataKey="over" tickLine={false} axisLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                              <YAxis tickLine={false} axisLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              <Legend wrapperStyle={{fontSize: '12px'}} />
                              <Bar dataKey="runs" fill="#009270" name="Runs" radius={[4, 4, 0, 0]} />
                              {/* Wicket Markers: Using Scatter to overlay red dots */}
                              <Scatter dataKey="wickets" fill="red" name="Wicket" shape="circle" />
                           </ComposedChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="mt-8">
                         <h4 className="font-bold text-sm text-gray-600 dark:text-gray-300 mb-2 uppercase">Cumulative Runs ({inn.team})</h4>
                         <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                               <LineChart data={getGraphData(inn)}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                  <XAxis dataKey="over" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend wrapperStyle={{fontSize: '12px'}} />
                                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={<WicketDot />} name="Total Runs" />
                               </LineChart>
                            </ResponsiveContainer>
                         </div>
                     </div>
                  </div>
               ))}
               {innings.length === 0 && <div className="p-8 text-center text-gray-500">No innings data available.</div>}
            </div>
         )}
         
         {/* --- TEAMS TAB (Existing) --- */}
         {activeTab === 'teams' && (
           // ... (Existing teams code)
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {info.teams.map((team: string) => (
              <div key={team} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-200 font-bold mr-3">
                    {team.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{team}</h3>
                </div>
                <ul className="space-y-3">
                  {info.players[team]?.map((player: string, i: number) => (
                    <li key={i} className="flex items-center text-sm text-slate-700 dark:text-gray-300">
                      <User size={14} className="mr-3 text-gray-400" />
                      {player}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
         )}
      </div>

      {/* Feature 2: Player Modal */}
      {selectedPlayer && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-[#009270] p-6 text-white relative">
                  <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 hover:bg-white/20 p-1 rounded-full transition"><X size={20} /></button>
                  <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                     {selectedPlayer.name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-bold text-center">{selectedPlayer.name}</h2>
                  <p className="text-center text-green-100 text-sm">{selectedPlayer.role || 'Player'}</p>
               </div>
               <div className="p-6">
                  <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase mb-4">Match Stats</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                     <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{selectedPlayer.runs}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Runs</div>
                     </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{selectedPlayer.balls}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Balls</div>
                     </div>
                     <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{selectedPlayer[4] || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">4s</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}