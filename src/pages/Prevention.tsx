
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Wind, Coffee, Music, Zap, Timer, AlertOctagon, HelpCircle } from 'lucide-react';
import { useDriver } from '../context/DriverContext';
import { motion, AnimatePresence } from 'motion/react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Prevention() {
  const { status, isEmergencyBraking, setIsEmergencyBraking } = useDriver();
  const [recoveryTime, setRecoveryTime] = useState(15 * 60); // 15 mins in seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status.isDrowsy) {
      timer = setInterval(() => {
        setRecoveryTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status.isDrowsy]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskLevel = (score: number) => {
    if (score > 80) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500' };
    if (score > 50) return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500' };
    if (score > 20) return { label: 'MEDIUM', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500' };
    return { label: 'LOW', color: 'text-[#00FF95]', bg: 'bg-[#00FF95]/10', border: 'border-[#00FF95]' };
  };

  const risk = getRiskLevel(status.riskScore);

  const precautions = [
    { icon: Coffee, title: 'Caffeine Break', text: 'Consider a 20-minute rest stop with moderate caffeine intake.', active: status.riskScore > 30 },
    { icon: Wind, title: 'Ventilation', text: 'Lower windows to introduce fresh airflow and drop cabin CO2.', active: status.riskScore > 50 },
    { icon: Music, title: 'Acoustic Stimuli', text: 'System recommends switching to high-tempo audio playlists.', active: status.riskScore > 20 },
    { icon: Zap, title: 'Hydration', text: 'Drink cold water to improve metabolic alertness and focus.', active: true }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0B] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Prevention & Proactive Safety</h1>
          <p className="text-sm text-[#8E9299]">Managed intervention and fatigue recovery protocols.</p>
        </div>
        <div className={`px-6 py-2 rounded-full border ${risk.border} ${risk.bg} flex items-center gap-2`}>
           <div className={`w-2 h-2 rounded-full ${risk.color.replace('text', 'bg')} animate-pulse`} />
           <span className={`text-xs font-black uppercase tracking-widest ${risk.color}`}>Threat_Level: {risk.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intervention Simulator */}
        <Card className="lg:col-span-2 bg-[#151619] border-[#2A2C31] text-white">
           <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-[12px] uppercase tracking-widest flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00FF95]" />
                    Safety Intervention System // ACTIVE_MODE
                 </div>
                 <Badge variant="outline" className="font-mono text-[9px] border-white/20">v.4.0_STABLE</Badge>
              </CardTitle>
           </CardHeader>
           <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-4 left-4 flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-[#00FF95]/30 rounded-full" />)}
                 </div>
                 <div className="absolute bottom-4 right-4 text-[9px] font-mono text-[#8E9299] uppercase tracking-widest">
                    Braking_System_Ready // Steering_Link_Secure
                 </div>

                 <motion.div 
                   animate={status.riskScore > 80 ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                   className="mb-8"
                 >
                    <AlertOctagon className={`w-20 h-20 ${status.riskScore > 80 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-white/10'}`} />
                 </motion.div>

                 <div className="text-center max-w-sm">
                    <h3 className="text-xl font-bold uppercase mb-2">Intervention readiness</h3>
                    <p className="text-sm text-[#8E9299] mb-6">
                       System is configured to enter <span className="text-white font-bold">Autonomous Safe Mode</span> if risk persistence exceeds the safety threshold for 3.0 seconds.
                    </p>
                    
                    <button 
                      onClick={() => setIsEmergencyBraking(!isEmergencyBraking)}
                      className={`px-10 py-3 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all border ${
                        isEmergencyBraking 
                        ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      {isEmergencyBraking ? 'INTERVENTION_IN_PROGRESS' : 'TEST_SIMULATION_INTERVENTION'}
                    </button>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Recovery Analytics */}
        <Card className="bg-[#151619] border-[#2A2C31] text-white">
          <CardHeader className="border-b border-white/5">
             <CardTitle className="text-[12px] uppercase tracking-widest flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#00A3FF]" />
                Recovery Recommendation
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-6">
             <div className="py-8">
                <p className="text-[10px] text-[#8E9299] uppercase font-bold mb-2 tracking-[0.3em]">Fatigue Clear-Down Timer</p>
                <div className="text-6xl font-black font-mono tracking-tighter text-[#00A3FF]">
                   {formatTime(recoveryTime)}
                </div>
                <div className="mt-4 flex justify-center gap-1">
                   {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`w-4 h-1 rounded-full ${i < 4 ? 'bg-[#00A3FF]' : 'bg-white/5'}`} />
                   ))}
                </div>
             </div>
             <div>
                <p className="text-xs text-[#8E9299] italic leading-relaxed">
                  "Based on your 2.4s blink peak, a 15-minute regenerative rest is optimized for your current circadian metabolic drift."
                </p>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {precautions.map((p, i) => (
           <Card key={i} className={`bg-[#151619] border-[#2A2C31] text-white transition-all ${p.active ? 'opacity-100' : 'opacity-40 grayscale blur-[1px]'}`}>
              <CardContent className="p-6">
                 <div className={`p-2 w-fit rounded-lg mb-4 ${p.active ? 'bg-[#00A3FF]/10 border border-[#00A3FF]/30' : 'bg-white/5'}`}>
                    <p.icon className={`w-5 h-5 ${p.active ? 'text-[#00A3FF]' : 'text-[#8E9299]'}`} />
                 </div>
                 <h4 className="text-[14px] font-bold uppercase mb-1 tracking-tight">{p.title}</h4>
                 <p className="text-xs text-[#8E9299] leading-tight mb-4">{p.text}</p>
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-[#00FF95]' : 'bg-white/10'}`} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{p.active ? 'Recommended' : 'Standby'}</span>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
