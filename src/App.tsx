/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';
import { DriverProvider } from './context/DriverContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Prevention from './pages/Prevention';
import Profile from './pages/Profile';
import Education from './pages/Education';
import VoiceAssistant from './pages/VoiceAssistant';
import Support from './pages/Support';
import { useDriver } from './context/DriverContext';
import { Shield, LogIn, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './components/ui/card';

function AppContent() {
  const { user, loginWithGoogle, loading } = useAuth();
  const { sosActive } = useDriver();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020306] flex items-center justify-center font-mono text-[#00A3FF]">
        INITIATING_SECURE_AUTH_LAYER...
      </div>
    );
  }

  if (!user) {
// ...
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
        <Card className="bg-[#151619] border border-[#2A2C31] w-full max-w-md p-8 text-center text-white">
           <div className="w-16 h-16 bg-[#00A3FF] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-[#00A3FF]/20">
             <Shield className="w-10 h-10 text-black" />
           </div>
           <h2 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase">DriveSentinel-X</h2>
           <p className="text-neutral-400 text-sm mb-8">Access the next-generation predictive safety platform.</p>
           <button 
             onClick={loginWithGoogle}
             className="w-full py-4 bg-[#00A3FF] text-black font-bold flex items-center justify-center gap-3 rounded-xl hover:bg-[#0088d6] transition-colors uppercase text-sm tracking-widest shadow-lg shadow-[#00A3FF]/10"
           >
             <LogIn className="w-5 h-5" />
             Authorize with Google
           </button>
           <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
             <div className="w-2 h-2 rounded-full bg-[#00FF95] animate-pulse" />
             <span className="text-[10px] text-white font-mono uppercase tracking-[0.2em]">Secure Node 81-X Active</span>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020306] flex flex-col text-white relative">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/prevention" element={<Prevention />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/education" element={<Education />} />
          <Route path="/voice" element={<VoiceAssistant />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <AnimatePresence>
        {sosActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/20 backdrop-blur-2xl z-[1000] flex items-center justify-center p-6 border-[20px] border-red-500/10 pointer-events-none"
          >
             <div className="text-center">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(220,38,38,0.8)] mx-auto mb-8"
                >
                   <ShieldAlert size={64} className="text-white" />
                </motion.div>
                <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">SOS ACTIVE</h2>
                <div className="flex items-center justify-center gap-4">
                   <div className="px-4 py-2 glass rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">Distress Signal Transmitted</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <DriverProvider>
           <AppContent />
        </DriverProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

