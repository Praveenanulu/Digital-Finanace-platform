import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Phone, MessageSquare, AlertTriangle, Send, Heart, User, Activity, Loader2, Navigation } from 'lucide-react';
import { useDriver } from '../context/DriverContext';
import { Progress } from '@/components/ui/progress';

export default function Support() {
  const { status, sosActive, sendEmergencyAlert, profile } = useDriver();
  const [isLocating, setIsLocating] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const triggerSOS = () => {
    setCountdown(5);
    setIsLocating(true);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          sendEmergencyAlert();
          setIsLocating(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
      <div className="atmosphere" />
      
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Emergency & Support</h1>
            <p className="text-[#8E9299] text-sm font-medium tracking-widest uppercase">Real-time incident response system</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-xl">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#8E9299] uppercase font-bold">Current Node</span>
                <span className="text-xs font-mono text-[#00FF95]">SECURE_SERVER_WEST_1</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-[#00FF95] animate-pulse" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Action Section */}
          <div className="space-y-8">
            <Card className="glass relative overflow-hidden p-8 flex flex-col items-center text-center">
               <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                  <ShieldAlert size={120} />
               </div>
               
               <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
                  <AlertTriangle size={48} className="text-red-500" />
               </div>

               <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Immediate SOS Trigger</h2>
               <p className="text-[#8E9299] text-base mb-8 max-w-sm">
                 Activating SOS will instantly share your real-time coordinates, health metrics, and cabin vision data with nearest emergency responders.
               </p>

               <div className="w-full flex flex-col items-center gap-4">
                  <button 
                    onClick={triggerSOS}
                    disabled={sosActive || countdown > 0}
                    className={`group relative w-full h-24 rounded-2xl transition-all overflow-hidden flex items-center justify-center ${sosActive ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}
                  >
                     <AnimatePresence mode="wait">
                        {countdown > 0 ? (
                           <motion.div 
                             key="countdown"
                             initial={{ scale: 0.5, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             exit={{ scale: 1.5, opacity: 0 }}
                             className="text-4xl font-black text-white"
                           >
                             {countdown}
                           </motion.div>
                        ) : sosActive ? (
                           <motion.span 
                             key="sent"
                             initial={{ y: 20, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             className="flex items-center gap-3 text-xl font-black uppercase text-white tracking-widest"
                           >
                             <Send className="animate-pulse" />
                             Alert Sent
                           </motion.span>
                        ) : (
                           <motion.span 
                             key="trigger"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="flex items-center gap-3 text-2xl font-black uppercase text-white tracking-widest"
                           >
                             Trigger SOS
                           </motion.span>
                        )}
                     </AnimatePresence>
                     {isLocating && (
                        <div className="absolute bottom-0 left-0 h-1.5 bg-white/30 transition-all duration-1000" style={{ width: `${(5-countdown)*20}%` }} />
                     )}
                  </button>
                  <p className="text-[10px] text-[#8E9299] uppercase font-medium tracking-widest">
                    {isLocating ? "Acquiring Satellite Lock..." : "Long press or click to initialize"}
                  </p>
               </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="glass p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#00A3FF] mb-4 flex items-center gap-2">
                     <MapPin size={14} />
                     Shared Metadata
                  </h3>
                  <div className="space-y-3">
                     {[
                       { label: 'Coordinates', val: '19.0760° N, 72.8777° E' },
                       { label: 'Vehicle ID', val: 'SENTINEL-X-404' },
                       { label: 'Occupants', val: '1 (Verified)' },
                       { label: 'Cabin Status', val: 'Critical Event' },
                     ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                           <span className="text-[10px] text-[#8E9299] uppercase">{item.label}</span>
                           <span className="text-[10px] font-mono text-white/80">{item.val}</span>
                        </div>
                     ))}
                  </div>
               </Card>

               <Card className="glass p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#00FF95] mb-4 flex items-center gap-2">
                     <Heart size={14} />
                     Vital Telemetry
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex gap-2 items-center">
                           <Activity size={16} className="text-[#00FF95]" />
                           <span className="text-[10px] uppercase font-bold">Heart Rate</span>
                        </div>
                        <span className="text-sm font-mono font-black">{status.healthMetrics.heartRate} BPM</span>
                     </div>
                     <Progress value={status.healthMetrics.stressLevel} className="h-1 bg-white/5" indicatorClassName="bg-[#00FF95]" />
                     <div className="flex justify-between text-[10px] uppercase tracking-tighter text-[#8E9299]">
                        <span>Baseline Stress</span>
                        <span>{status.healthMetrics.stressLevel}% Load</span>
                     </div>
                  </div>
               </Card>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="glass p-6 border-l-4 border-l-[#00A3FF]">
               <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <Phone size={14} className="text-[#00A3FF]" />
                  Emergency Contacts
               </h3>
               <div className="space-y-4">
                  {[
                    { name: 'Roadside Assistance', num: '1-800-DSX-SAFE', icon: <Navigation size={14} /> },
                    { name: 'Primary Guardian', num: '+91 99xx-xxx-xxx', icon: <User size={14} /> },
                    { name: 'Local Police (Auto)', num: '100', icon: <ShieldAlert size={14} /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#00A3FF]/10 transition-colors">
                             {item.icon}
                          </div>
                          <div>
                             <p className="text-[10px] text-[#8E9299] uppercase font-bold leading-tight">{item.name}</p>
                             <p className="text-xs font-mono text-white/90">{item.num}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <section className="glass rounded-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3">
                  <Loader2 className="w-4 h-4 text-[#00FF95] animate-spin opacity-20" />
               </div>
               <p className="text-[10px] text-[#00FF95] uppercase font-black tracking-widest mb-3">Live Response Status</p>
               <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-2 h-2 rounded-full bg-[#00FF95] animate-pulse" />
                     <p className="text-[10px] text-[#8E9299] uppercase font-bold">Responders Notified</p>
                  </div>
                  <div className="space-y-3">
                     <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={sosActive ? { x: ['-100%', '300%'] } : {}}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="w-1/3 h-full bg-[#00A3FF]"
                        />
                     </div>
                     <p className="text-[9px] text-white/40 uppercase tracking-widest text-center">Satellite Tracking Active</p>
                  </div>
               </div>
            </section>

            <Card className="glass p-6 border-l-4 border-l-[#FFD600]">
               <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={14} className="text-[#FFD600]" />
                  Protocol Guidance
               </h3>
               <p className="text-[10px] text-[#8E9299] uppercase leading-relaxed tracking-tight">
                 If safe, pull over to the side of the road and turn on hazard lights. Wait for voice instructions from the Sentinel Dispatcher.
               </p>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sosActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/20 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 border-[20px] border-red-500/10 pointer-events-none"
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
                      <span className="text-xs font-mono font-bold uppercase">Distress Signal Transmitted</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
