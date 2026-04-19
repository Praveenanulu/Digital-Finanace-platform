import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Languages, Repeat, Command, Smartphone, AlertTriangle, MessageSquare, Headphones, Shield } from 'lucide-react';
import { useDriver } from '../context/DriverContext';
import { Language } from '../types';

export default function VoiceAssistant() {
  const { status, coDriverText, isListening, startListening, setLanguage, isVoiceOn, setIsVoiceOn } = useDriver();

  const handleLanguageSwitch = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
      <div className="atmosphere" />
      
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">AI Voice Assistant</h1>
            <p className="text-[#8E9299] text-sm font-medium tracking-widest uppercase">Live Multilingual Co-Driver Support</p>
          </div>
          <div className="flex items-center gap-2">
             <Button 
               variant="outline" 
               onClick={() => setIsVoiceOn(!isVoiceOn)}
               className={`h-10 px-4 glass uppercase text-[10px] font-bold tracking-widest ${isVoiceOn ? 'text-[#00FF95] border-[#00FF95]/30' : 'text-[#8E9299]'}`}
             >
                {isVoiceOn ? <Volume2 size={16} className="mr-2" /> : <Languages size={16} className="mr-2" />}
                {isVoiceOn ? 'Speech ON' : 'Speech OFF'}
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 flex-1 min-h-0">
          {/* Main Voice Hub */}
          <div className="flex flex-col gap-6 h-full">
            <Card className="glass flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#00A3FF]/10 to-transparent pointer-events-none" />
               
               <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div 
                    animate={isListening ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 rounded-full border-2 border-[#00A3FF] flex items-center justify-center mb-8 relative"
                  >
                    <div className="absolute inset-0 bg-[#00A3FF]/10 rounded-full blur-2xl" />
                    <Mic size={48} className={isListening ? "text-[#00A3FF]" : "text-[#8E9299]"} />
                  </motion.div>

                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4 min-h-[60px] flex items-center">
                    {coDriverText}
                  </h2>
                  
                  <div className="flex flex-col gap-4 w-full max-w-sm">
                    <Button 
                      onClick={startListening}
                      disabled={isListening}
                      className="w-full h-14 bg-[#00A3FF] hover:bg-[#0088d6] text-black font-black uppercase text-sm tracking-widest rounded-xl shadow-lg shadow-[#00A3FF]/20"
                    >
                      {isListening ? "Listening..." : "Speak Command"}
                    </Button>
                  </div>
               </div>

               {/* Waveform Visualization */}
               <div className="absolute bottom-8 flex items-end gap-1 h-12">
                  {[...Array(20)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={isListening ? { height: [4, Math.random() * 40 + 4, 4] } : { height: 4 }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                      className="w-1 bg-[#00A3FF]/40 rounded-full"
                    />
                  ))}
               </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
               <button onClick={() => setLanguage('en')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${status.language === 'en' ? 'bg-[#00A3FF]/20 border-[#00A3FF] text-[#00A3FF]' : 'glass text-[#8E9299]'}`}>
                  <span className="text-xs font-black uppercase tracking-widest">English</span>
                  <p className="text-[10px] opacity-60">Global Std</p>
               </button>
               <button onClick={() => setLanguage('hi')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${status.language === 'hi' ? 'bg-[#00A3FF]/20 border-[#00A3FF] text-[#00A3FF]' : 'glass text-[#8E9299]'}`}>
                  <span className="text-xs font-black uppercase tracking-widest">हिंदी</span>
                   <p className="text-[10px] opacity-60">National</p>
               </button>
               <button onClick={() => setLanguage('mr')} className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${status.language === 'mr' ? 'bg-[#00A3FF]/20 border-[#00A3FF] text-[#00A3FF]' : 'glass text-[#8E9299]'}`}>
                  <span className="text-xs font-black uppercase tracking-widest">मराठी</span>
                   <p className="text-[10px] opacity-60">Regional</p>
               </button>
            </div>
          </div>

          {/* Quick Actions & Tips */}
          <div className="flex flex-col gap-6">
            <Card className="glass p-6 border-l-4 border-l-[#00FF95]">
               <h3 className="text-[10px] text-[#00FF95] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                  <Command size={12} />
                  Voice Commands
               </h3>
               <ul className="space-y-4">
                  {[
                    { cmd: '"Switch language"', icon: <Languages size={14} /> },
                    { cmd: '"Repeat message"', icon: <Repeat size={14} /> },
                    { cmd: '"Check safety"', icon: <Shield size={14} /> },
                    { cmd: '"SOS Alert"', icon: <AlertTriangle size={14} />, color: 'text-red-400' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs text-white/70 font-mono">
                       <span className={item.color || "text-[#00A3FF]"}>{item.icon}</span>
                       {item.cmd}
                    </li>
                  ))}
               </ul>
            </Card>

            <Card className="glass p-6 bg-blue-500/5">
               <h3 className="text-[10px] text-[#00A3FF] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare size={12} />
                  Translation Engine
               </h3>
               <p className="text-[10px] text-[#8E9299] leading-relaxed uppercase tracking-tighter">
                  Real-time edge-optimized neural translation for 3 major languages. Our system ensures you never miss a critical safety alert due to language barriers.
               </p>
               <div className="mt-4 flex items-center gap-2">
                  <div className="p-1 px-2 rounded bg-black/40 text-[9px] text-white/50 border border-white/5 uppercase font-bold">Latency: 45ms</div>
                  <div className="p-1 px-2 rounded bg-black/40 text-[9px] text-[#00FF95] border border-[#00FF95]/20 uppercase font-bold">Accuracy: 98%</div>
               </div>
            </Card>

            <div className="mt-auto glass p-4 rounded-xl flex items-center gap-4">
               <div className="p-2 bg-[#00A3FF]/10 rounded-lg text-[#00A3FF]">
                  <Headphones size={20} />
               </div>
               <div>
                  <p className="text-[10px] text-white uppercase font-bold">Neural Audio Layer</p>
                  <p className="text-[9px] text-[#8E9299] uppercase">v3.2.1 Stable</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
