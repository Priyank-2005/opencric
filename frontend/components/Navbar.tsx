// filepath: frontend/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMatches } from '@/lib/api';
import clsx from 'clsx';

export default function Navbar() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark Mode State
  const router = useRouter();

  // Initial Load & Theme Check
  useEffect(() => {
    // 1. Fetch Matches
    getMatches().then(data => {
      setLiveMatches(data.filter((m: any) => !m.info.outcome?.winner && m.innings?.length > 0));
    }).catch(() => {});

    // 2. Check Theme
    // Check if user has a saved preference
    const localTheme = localStorage.getItem('theme');
    // Check system preference
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (localTheme === 'dark' || (!localTheme && systemDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    // Toggle state
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Apply to DOM & Storage
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
  };

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-[#009270] text-white shadow-md relative dark:bg-gray-900 dark:border-b dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo & Nav */}
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="text-2xl font-bold italic tracking-tighter">criccode</Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-green-100">Live Scores</Link>
              <Link href="/series" className="hover:text-green-100">Schedule</Link>
              <Link href="/archives" className="hover:text-green-100">Archives</Link>
              <Link href="/news" className="hover:text-green-100">News</Link>
              <Link href="/series" className="hover:text-green-100">Series</Link>
              <Link href="/rankings" className="hover:text-green-100">Rankings</Link>
              <Link href="/admin" className="hover:text-green-100 bg-[#007a5e] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider dark:bg-gray-800">Admin</Link>
            </nav>
          </div>

          {/* Icons & Search */}
          <div className="flex items-center gap-4">
            
            {/* Expanded Search Bar */}
            <div className={clsx("absolute top-0 left-0 w-full h-full bg-[#009270] dark:bg-gray-900 flex items-center px-4 transition-transform duration-300 z-20", isSearchOpen ? "translate-y-0" : "-translate-y-full")}>
               <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto relative flex items-center">
                  <Search className="absolute left-3 text-gray-500 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search matches, teams, series..." 
                    className="w-full bg-white text-gray-900 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none dark:bg-gray-800 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus={isSearchOpen}
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-4 text-white hover:text-green-100">
                    <X size={24} />
                  </button>
               </form>
            </div>

            {/* Normal Icons */}
            {!isSearchOpen && (
              <>
                <button onClick={() => setIsSearchOpen(true)} className="hover:text-green-100">
                  <Search className="w-5 h-5" />
                </button>
                <button onClick={toggleDarkMode} className="hover:text-green-100">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Bell className="w-5 h-5 text-green-100 cursor-pointer hidden sm:block" />
                <User className="w-5 h-5 text-green-100 cursor-pointer hidden sm:block" />
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Live Match Strip */}
      <div className="bg-[#464646] text-white overflow-x-auto no-scrollbar border-t border-gray-700 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex py-2 gap-6 text-xs whitespace-nowrap">
          <span className="font-bold text-gray-400 self-center">MATCHES</span>
          {liveMatches.length > 0 ? liveMatches.map((m: any) => (
            <Link key={m._id} href={`/match/${m._id}`} className="hover:text-white text-gray-300 flex items-center gap-2 group">
              <span>{m.info.teams[0]} vs {m.info.teams[1]}</span>
              <span className="text-red-400 group-hover:animate-pulse">• Live</span>
            </Link>
          )) : (
            <span className="text-gray-500 italic self-center">No live matches currently.</span>
          )}
          <span className="text-blue-400 cursor-pointer ml-auto self-center font-bold hover:underline">VIEW ALL</span>
        </div>
      </div>
    </div>
  );
}