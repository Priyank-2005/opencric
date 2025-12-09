// filepath: frontend/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMatches,
  updateScore,
  updateToss,
  getMatchById,
  changeInnings,
  createMatch,
  getRankings,
  updateRankings,
} from '@/lib/api';
import {
  Loader2,
  Settings,
  RefreshCw,
  AlertTriangle,
  Plus,
  X,
  Upload,
  ListOrdered,
  LogOut,
} from 'lucide-react';
import clsx from 'clsx';
import { addDays, format, parseISO } from 'date-fns';
import Navbar from '@/components/Navbar';

export default function Admin() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<'matches' | 'rankings'>('matches');

  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('Ready');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'series' | 'tournament'>('series');
  const [eventName, setEventName] = useState('');
  const [teams, setTeams] = useState<string[]>(['', '']);
  const [playerDataJson, setPlayerDataJson] = useState<any>(null);
  const [seriesConfig, setSeriesConfig] = useState({ numMatches: 3, startDate: '', format: 'T20', venue: '' });
  const [tournamentConfig, setTournamentConfig] = useState({ startDate: '', format: 'T20', venue: '', type: 'round_robin' });

  const [newMatchesList, setNewMatchesList] = useState<any[]>([{ format: 'T20', date: '', venue: '' }]);

  const [striker, setStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'field'>('bat');

  const [rankingsCache, setRankingsCache] = useState<any>({});
  const [rGender, setRGender] = useState('men');
  const [rFormat, setRFormat] = useState('test');
  const [rCategory, setRCategory] = useState('batting');
  const [rankingJsonInput, setRankingJsonInput] = useState('');

  // auth guard
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // debug: listen for clicks briefly to confirm events fire
  useEffect(() => {
    console.log('Admin mounted (debug instrumentation)');
    let clickLogger: any = null;
    try {
      clickLogger = (e: any) => {
        // log element that received the click (helpful to see overlays)
        const el = e.target as HTMLElement;
        console.log('DOM click ->', el.tagName, el.id || '', el.className || '');
      };
      // attach for 20s to avoid flooding long-term
      document.addEventListener('click', clickLogger);
      const t = setTimeout(() => document.removeEventListener('click', clickLogger!), 20000);
      return () => { clearTimeout(t); if (clickLogger) document.removeEventListener('click', clickLogger); };
    } catch (e) {
      /* ignore */
    }
  }, []);

  // overlay checker: logs top element at center for 10s
  useEffect(() => {
    const checkOverlay = () => {
      try {
        const el = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)[0];
        if (el) console.log('Top element at center ->', el.tagName, el.id || '(no id)', el.className || '(no class)');
      } catch (e) { console.warn('overlay check failed', e); }
    };
    checkOverlay();
    const iv = setInterval(checkOverlay, 1500);
    setTimeout(() => clearInterval(iv), 10000);
    return () => clearInterval(iv);
  }, []);

  // refresh function with defensive handling
  const refreshMatches = async () => {
    try {
      const data = await getMatches();
      if (!Array.isArray(data)) {
        console.warn('getMatches returned non-array', data);
        setMatches([]);
        return;
      }
      // admin: active = no winner
      const activeMatches = data.filter((m: any) => !m?.info?.outcome?.winner);
      setMatches(activeMatches);
      console.log('refreshMatches loaded', activeMatches.length, 'active matches');
    } catch (err: any) {
      console.error('refreshMatches error', err);
      alert('Failed to load matches: ' + (err?.message ?? String(err)));
      setMatches([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshMatches();
      getRankings().then(data => setRankingsCache(data || {})).catch(e => { console.error('getRankings failed', e); setRankingsCache({}); });
    }
  }, [isAuthenticated]);

  // load selected match (normalize players if needed)
  useEffect(() => {
    if (!selectedMatchId) {
      setActiveMatch(null);
      setTossWinner('');
      setTossDecision('bat');
      setStriker('');
      setBowler('');
      return;
    }
    setIsLoading(true);
    getMatchById(selectedMatchId)
      .then(data => {
        // Normalize players into data.info.players for robustness
        if (!data) throw new Error('Empty match data');
        const playersFromInfo = data?.info?.players;
        const playersFromTop = data?.players;
        const playersFromMatches0 = data?.matches?.[0]?.players;
        const normalizedPlayers = playersFromInfo || playersFromTop || playersFromMatches0 || {};
        if (!data.info) data.info = {};
        data.info.players = normalizedPlayers;

        setActiveMatch(data);
        // default toss values
        if (data?.info?.teams && data.info.teams.length > 0) {
          setTossWinner(data.info?.toss?.winner ?? data.info.teams[0]);
        } else {
          setTossWinner('');
        }
        setTossDecision(data?.info?.toss?.decision === 'field' ? 'field' : 'bat');
        // reset players selections
        setStriker('');
        setBowler('');
      })
      .catch(err => {
        console.error('getMatchById failed', err);
        alert('Failed to load selected match: ' + (err?.message ?? String(err)));
        setActiveMatch(null);
      })
      .finally(() => setIsLoading(false));
  }, [selectedMatchId]);

  useEffect(() => {
    const key = `${rGender}_${rFormat}_${rCategory}`;
    setRankingJsonInput(JSON.stringify(rankingsCache[key] || [], null, 2));
  }, [rGender, rFormat, rCategory, rankingsCache]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/login');
  };

  // Rankings update
  const handleRankingUpdate = async () => {
    const key = `${rGender}_${rFormat}_${rCategory}`;
    try {
      const parsed = JSON.parse(rankingJsonInput);
      if (!Array.isArray(parsed)) throw new Error('Expected JSON array');
      setIsLoading(true);
      await updateRankings(key, parsed);
      setRankingsCache({ ...rankingsCache, [key]: parsed });
      alert('Rankings updated');
      setStatus('Rankings Updated');
    } catch (err: any) {
      console.error('handleRankingUpdate error', err);
      alert('Failed to update rankings: ' + (err?.message ?? String(err)));
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(null), 2000);
    }
  };

  // Toss update with logging and better error messages
  const handleTossUpdate = async () => {
    console.log('handleTossUpdate clicked', { selectedMatchId, tossWinner, tossDecision });
    if (!selectedMatchId) {
      alert('Select a fixture first.');
      return;
    }
    if (!tossWinner) {
      alert('Select toss winner.');
      return;
    }
    const payload = { matchId: selectedMatchId, winner: tossWinner, decision: tossDecision };
    console.log('handleTossUpdate payload ->', payload);
    setIsLoading(true);
    try {
      const res = await updateToss(payload);
      console.log('updateToss response ->', res);
      setStatus('Toss Updated!');
      // reload match
      const updated = await getMatchById(selectedMatchId);
      setActiveMatch(updated);
      // refresh admin list in case match state changed
      refreshMatches();
    } catch (err: any) {
      console.error('Toss update failed', err);
      alert('Failed to update toss: ' + (err?.response?.data?.message || err?.message || err?.toString?.() || 'Unknown error'));
      setStatus('Error updating toss');
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(null), 2000);
    }
  };

  const handleChangeInnings = async () => {
    console.log('handleChangeInnings clicked', { selectedMatchId });
    if (!selectedMatchId) { alert('Select a fixture first.'); return; }
    if (!confirm('End Innings?')) return;
    setIsLoading(true);
    try {
      console.log('changeInnings payload ->', { matchId: selectedMatchId });
      const r = await changeInnings({ matchId: selectedMatchId });
      console.log('changeInnings response ->', r);
      setStatus('Innings Changed');
      const updated = await getMatchById(selectedMatchId);
      setActiveMatch(updated);
      setStriker(''); setBowler('');
      refreshMatches();
    } catch (err: any) {
      console.error('changeInnings failed', err);
      alert('Failed to change innings: ' + (err?.message ?? String(err)));
      setStatus('Error changing innings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScore = async (runs: number, extraType: string | null = null, isWicket: boolean = false) => {
    console.log('handleScore clicked', { runs, extraType, isWicket, selectedMatchId, striker, bowler });
    if (!selectedMatchId) { alert('Select a fixture first.'); return; }
    if (!striker || !bowler) { setStatus('Select striker & bowler'); setTimeout(() => setStatus(null), 2000); return; }
    const payload = { matchId: selectedMatchId, runs, extraType, isWicket, batter: striker, bowler, comment: isWicket ? `WICKET! ${striker} is out.` : `${runs} runs to ${striker}.` };
    console.log('handleScore payload ->', payload);
    setIsLoading(true);
    try {
      const r = await updateScore(payload);
      console.log('updateScore response ->', r);
      setLastAction(`${isWicket ? 'WICKET!' : runs} (${striker})`);
      setStatus('Success');
      const updated = await getMatchById(selectedMatchId);
      setActiveMatch(updated);
    } catch (err: any) {
      console.error('updateScore failed', err);
      alert('Failed to update score: ' + (err?.response?.data?.message || err?.message || String(err)));
      setStatus('Error: ' + (err?.message ?? 'Update failed'));
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(null), 1500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        setPlayerDataJson(json);
        alert('Player JSON loaded');
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitCreate = async () => {
    console.log('handleSubmitCreate clicked', { createType, eventName, teams });
    setIsLoading(true);
    try {
      const matchesToCreate: any[] = [];
      if (createType === 'series') {
        if (!eventName || teams.some(t => !t) || !seriesConfig.startDate || !seriesConfig.venue) { alert('Fill required fields'); setIsLoading(false); return; }
        const start = parseISO(seriesConfig.startDate);
        for (let i = 0; i < seriesConfig.numMatches; i++) {
          const matchDate = addDays(start, i * 2);
          matchesToCreate.push({ format: seriesConfig.format, date: format(matchDate, 'yyyy-MM-dd'), venue: seriesConfig.venue, number: i+1, teams, players: playerDataJson?.info?.players || {} });
        }
      } else {
        if (!eventName || teams.length < 3 || teams.some(t => !t) || !tournamentConfig.startDate || !tournamentConfig.venue) { alert('Fill required fields'); setIsLoading(false); return; }
        const start = parseISO(tournamentConfig.startDate);
        let count = 0;
        for (let i=0;i<teams.length;i++) for (let j=i+1;j<teams.length;j++) { const matchDate = addDays(start, count); matchesToCreate.push({ format: tournamentConfig.format, date: format(matchDate, 'yyyy-MM-dd'), venue: tournamentConfig.venue, number: count+1, teams: [teams[i], teams[j]], players: playerDataJson?.info?.players || {} }); count++; }
      }
      console.log('createMatch payload ->', { type: createType, name: eventName, teams, matches: matchesToCreate });
      const res = await createMatch({ type: createType, name: eventName, teams, matches: matchesToCreate });
      console.log('createMatch response ->', res);
      alert(`Created ${matchesToCreate.length} matches`);
      setIsCreateModalOpen(false);
      refreshMatches();
    } catch (err: any) {
      console.error('createMatch failed', err);
      alert('Failed to create matches: ' + (err?.message ?? String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // derived values
  const hasToss = Boolean(activeMatch?.info?.toss && Object.keys(activeMatch.info.toss || {}).length > 0);
  const currentInnings = activeMatch?.innings ? activeMatch.innings[activeMatch.innings.length - 1] : null;
  const battingTeamName = currentInnings?.team;
  const bowlingTeamName = activeMatch?.info?.teams?.find((t: string) => t !== battingTeamName);
  let totalBalls = 0, currentRuns = 0, currentWickets = 0;
  if (currentInnings?.overs) {
    currentInnings.overs.forEach((o: any) => {
      totalBalls += o.deliveries.length;
      o.deliveries.forEach((d: any) => { currentRuns += d.runs?.total ?? 0; if (d.wickets?.length) currentWickets++; });
    });
  }
  const currentOverStr = `${Math.floor(totalBalls/6)}.${totalBalls % 6}`;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center border-b border-gray-700 pb-2">
          <div className="flex gap-4">
            <button onClick={() => { console.log('Matches tab clicked'); setActiveTab('matches'); }} className={clsx('pb-2 px-4 font-bold border-b-2 transition', activeTab === 'matches' ? 'border-green-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300')}>Matches</button>
            <button onClick={() => { console.log('Rankings tab clicked'); setActiveTab('rankings'); }} className={clsx('pb-2 px-4 font-bold border-b-2 transition', activeTab === 'rankings' ? 'border-green-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300')}>Rankings</button>
          </div>
          <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold uppercase tracking-wider"><LogOut size={14}/> Logout</button>
        </div>

        {activeTab === 'matches' ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-gray-400 text-xs font-bold uppercase">Match Control</h2>
                  <button onClick={() => { console.log('New Match button clicked'); setIsCreateModalOpen(true); }} className="bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"><Plus size={12}/> New Match</button>
                </div>

                <select value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-lg text-sm mb-4">
                  <option value="">-- Select Fixture --</option>
                  {matches.map((m: any) => (<option key={m._id} value={m._id}>{m?.info?.teams?.[0]} vs {m?.info?.teams?.[1]} ({m?.info?.match_type})</option>))}
                </select>

                {activeMatch && hasToss && (
                  <div className="bg-gray-900/50 p-3 rounded border border-gray-700 text-center mb-4">
                    <div className="text-xs text-gray-500 uppercase mb-1">Live Score ({battingTeamName})</div>
                    <div className="text-3xl font-mono font-bold text-white mb-1">{currentRuns}/{currentWickets}</div>
                    <div className="text-sm font-mono text-blue-400">Overs: {currentOverStr}</div>
                    <div className="text-xs text-gray-400 mt-2 border-t border-gray-700 pt-2">vs {bowlingTeamName}</div>
                  </div>
                )}

                {activeMatch && hasToss && <button onClick={handleChangeInnings} className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold py-3 rounded transition"><RefreshCw size={14}/> End Innings / Switch Team</button>}
              </div>

              {activeMatch && hasToss && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg space-y-4">
                  <h3 className="text-blue-400 font-bold text-xs uppercase border-b border-gray-700 pb-2">Active Players</h3>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Striker ({battingTeamName})</label>
                    <select value={striker} onChange={(e) => setStriker(e.target.value)} className="w-full bg-gray-900 border border-gray-600 p-2 rounded text-sm text-white">
                      <option value="">Select Striker</option>
                      {(activeMatch?.info?.players?.[battingTeamName] || []).map((p: string) => (<option key={p} value={p}>{p}</option>))}
                      {(!(activeMatch?.info?.players?.[battingTeamName] || []).length) && <option value="Batter 1">Batter 1 (Squad not loaded)</option>}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Bowler ({bowlingTeamName})</label>
                    <select value={bowler} onChange={(e) => setBowler(e.target.value)} className="w-full bg-gray-900 border border-gray-600 p-2 rounded text-sm text-white">
                      <option value="">Select Bowler</option>
                      {(activeMatch?.info?.players?.[bowlingTeamName] || []).map((p: string) => (<option key={p} value={p}>{p}</option>))}
                      {(!(activeMatch?.info?.players?.[bowlingTeamName] || []).length) && <option value="Bowler 1">Bowler 1 (Squad not loaded)</option>}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-6">
              {activeMatch && !hasToss && (
                <div className="bg-gray-800 p-8 rounded-xl border border-yellow-600/50 shadow-lg text-center">
                  <AlertTriangle className="mx-auto text-yellow-500 h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-6">Match Start Procedure</h3>

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Toss Winner</label>
                      <select value={tossWinner} onChange={e => setTossWinner(e.target.value)} className="w-full bg-gray-900 border border-gray-600 p-3 rounded">
                        {activeMatch.info?.teams?.map((t: string) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Decision</label>
                      <select value={tossDecision} onChange={e => setTossDecision(e.target.value as 'bat'|'field')} className="w-full bg-gray-900 border border-gray-600 p-3 rounded">
                        <option value="bat">Bat First</option>
                        <option value="field">Bowl First</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleTossUpdate} disabled={isLoading} className="mt-8 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full shadow-lg">Start Match</button>
                </div>
              )}

              {activeMatch && hasToss && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-2xl relative overflow-hidden">
                  {isLoading && <div className="absolute inset-0 bg-gray-900/50 z-10 flex items-center justify-center"><Loader2 className="animate-spin text-white h-10 w-10"/></div>}
                  <div className="flex justify-between items-center mb-6"><span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ball by Ball Control</span><div className="text-xs text-green-400 font-mono">{lastAction}</div></div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[0,1,2,3].map(n => (<button key={n} onClick={() => handleScore(n)} disabled={isLoading} className="bg-gray-700 hover:bg-gray-600 text-white text-3xl py-8 rounded-xl">{n}</button>))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button onClick={() => handleScore(4)} disabled={isLoading} className="bg-blue-600 py-6 rounded-xl text-white text-3xl">4</button>
                    <button onClick={() => handleScore(6)} disabled={isLoading} className="bg-purple-600 py-6 rounded-xl text-white text-3xl">6</button>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <button onClick={() => handleScore(1, 'wide')} disabled={isLoading} className="py-4 rounded">Wide</button>
                    <button onClick={() => handleScore(1, 'noball')} disabled={isLoading} className="py-4 rounded">NB</button>
                    <button onClick={() => handleScore(0, 'bye')} disabled={isLoading} className="py-4 rounded">Bye</button>
                    <button onClick={() => handleScore(0, 'legbye')} disabled={isLoading} className="py-4 rounded">LB</button>
                    <button onClick={() => handleScore(0, null, true)} disabled={isLoading} className="py-4 rounded bg-red-600 text-white">OUT</button>
                  </div>
                </div>
              )}

              {!activeMatch && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-800/50 rounded-2xl border border-gray-700 p-12">
                  <Settings size={64} className="mb-6 opacity-20" />
                  <p className="text-xl font-medium">Select a fixture or create a new one.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><ListOrdered className="text-yellow-500"/> Manage ICC Rankings</h2>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex gap-2 border-b border-gray-700 pb-2">
                  {['men','women'].map(g => <button key={g} onClick={() => setRGender(g)} className={clsx('px-4 py-1', rGender===g ? 'text-green-400 bg-gray-700' : 'text-gray-500')}>{g}</button>)}
                </div>

                <div className="flex gap-2">{['test','odi','t20'].map(f => <button key={f} onClick={() => setRFormat(f)} className={clsx('px-3 py-1', rFormat===f ? 'border-blue-500 text-blue-400' : 'border-gray-600')}>{f}</button>)}</div>

                <div className="flex gap-2">{['batting','bowling','allrounder','team'].map(c => <button key={c} onClick={() => setRCategory(c)} className={clsx('px-3 py-1', rCategory===c ? 'border-purple-500 text-purple-400' : 'border-gray-600')}>{c}</button>)}</div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg border border-gray-600 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-400 uppercase">Editing: {rGender}/{rFormat}/{rCategory}</p>
                </div>
                <textarea className="w-full h-64 bg-gray-900 text-green-400 p-3 rounded" value={rankingJsonInput} onChange={(e) => setRankingJsonInput(e.target.value)} />
              </div>

              <div className="flex justify-end"><button onClick={handleRankingUpdate} className="bg-green-600 px-6 py-2 rounded">Update</button></div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal (keeps same structure) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl border border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center"><h2 className="text-xl font-bold text-white">Create New Fixture</h2><button onClick={() => { console.log('Close modal'); setIsCreateModalOpen(false); }} className="text-gray-400 hover:text-white"><X size={24}/></button></div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Event Type</label><div className="flex gap-4"><button onClick={() => { setCreateType('series'); setTeams(['', '']); }} className={clsx("flex-1 py-3 rounded-lg border text-sm font-bold", createType === 'series' ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-700 border-gray-600 text-gray-400")}>Bilateral Series</button><button onClick={() => { setCreateType('tournament'); setTeams(['', '', '', '']); }} className={clsx("flex-1 py-3 rounded-lg border text-sm font-bold", createType === 'tournament' ? "bg-purple-600 border-purple-500 text-white" : "bg-gray-700 border-gray-600 text-gray-400")}>Tournament (Auto)</button></div></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Event Name</label><input type="text" placeholder="e.g. Ashes 2026" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={eventName} onChange={e => setEventName(e.target.value)} /></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Player Details (JSON)</label><div className="flex items-center gap-3"><label className="flex-1 cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded p-3 text-sm text-gray-300 flex items-center justify-center gap-2"><Upload size={16} /> {playerDataJson ? "File Loaded" : "Upload JSON"} <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} /></label>{playerDataJson && <span className="text-green-400 text-xs font-bold">Ready</span>}</div></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Participating Teams</label><div className="grid grid-cols-2 gap-3">{teams.map((team, idx) => (<input key={idx} type="text" placeholder={`Team ${idx+1}`} className="bg-gray-900 border border-gray-600 p-3 rounded text-white" value={team} onChange={e => { const n = [...teams]; n[idx] = e.target.value; setTeams(n); }} />))} {createType === 'tournament' && <button onClick={() => setTeams([...teams, ''])} className="bg-gray-700 hover:bg-gray-600 text-white rounded p-3 flex items-center justify-center"><Plus size={16}/></button>}</div></div>
              {createType === 'series' && <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4"><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label><input type="date" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={seriesConfig.startDate} onChange={e => setSeriesConfig({...seriesConfig, startDate: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Matches</label><input type="number" min="1" max="10" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={seriesConfig.numMatches} onChange={e => setSeriesConfig({...seriesConfig, numMatches: parseInt(e.target.value)})} /></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Format</label><select className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={seriesConfig.format} onChange={e => setSeriesConfig({...seriesConfig, format: e.target.value})}><option value="T20">T20</option><option value="ODI">ODI</option><option value="Test">Test</option></select></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Venue</label><input type="text" placeholder="Default Venue" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={seriesConfig.venue} onChange={e => setSeriesConfig({...seriesConfig, venue: e.target.value})} /></div></div>}
              {createType === 'tournament' && <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4"><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label><input type="date" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={tournamentConfig.startDate} onChange={e => setTournamentConfig({...tournamentConfig, startDate: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Format</label><select className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={tournamentConfig.format} onChange={e => setTournamentConfig({...tournamentConfig, format: e.target.value})}><option value="T20">T20</option><option value="ODI">ODI</option><option value="Test">Test</option></select></div><div className="col-span-2"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Venue</label><input type="text" placeholder="Tournament Venue" className="w-full bg-gray-900 border border-gray-600 p-3 rounded text-white" value={tournamentConfig.venue} onChange={e => setTournamentConfig({...tournamentConfig, venue: e.target.value})} /></div></div>}
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3 bg-gray-800"><button onClick={() => { console.log('Cancel create'); setIsCreateModalOpen(false); }} className="px-4 py-2 rounded text-gray-300 hover:text-white hover:bg-gray-700">Cancel</button><button onClick={handleSubmitCreate} disabled={isLoading} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold shadow-lg">Auto-Create</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
