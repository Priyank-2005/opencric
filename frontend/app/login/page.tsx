'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded password check
    // In a real app, this would verify with a backend API
    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Navbar />
      
      <div className="flex items-center justify-center h-[80vh]">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
           <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full text-[#009270]">
                 <Lock size={32} />
              </div>
           </div>
           
           <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Access</h2>
           
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-gray-600 mb-2">Password</label>
                 <input 
                   type="password" 
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009270] focus:border-[#009270] outline-none transition"
                   placeholder="Enter admin password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                 />
              </div>
              
              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              
              <button 
                type="submit" 
                className="w-full bg-[#009270] hover:bg-[#007a5e] text-white font-bold py-3 rounded-lg transition-colors shadow-md"
              >
                Login
              </button>
           </form>
           
           <p className="text-center text-xs text-gray-400 mt-6">
              Authorized personnel only.
           </p>
        </div>
      </div>
    </div>
  );
}