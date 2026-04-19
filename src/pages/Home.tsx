import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Shield, MapPin, Volume2, VolumeX, Terminal, Brain, Lock, Eye, EyeOff, ShieldAlert, Sparkles, RefreshCcw, LayoutGrid, User, Smartphone, AlertTriangle, Moon, Sun, UserCheck, Wind, History, TrendingUp, TrendingDown, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDriver } from '../context/DriverContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const { 
    status, videoRef, canvasRef, isSystemOn, isNightMode, setIsNightMode, coDriverText, 
    isVoiceOn, setIsVoiceOn, isListening, setCoDriverText, startListening, localIntel,
    simulationMode, setSimulationMode, cognitiveLoad, isPrivacyMode, setIsPrivacyMode,
    isSafeMode, setIsSafeMode, recoveryMode, setRecoveryMode, calmMode, setCalmMode,
    timeline, sessionStats, resetSession, profile, alerts
  } = useDriver();

  const [showSummary, setShowSummary] = React.useState(false);

  // Auto-theme based on vision lightingLevel
  React.useEffect(() => {
    if (status.lightingLevel === 'low' && !isNightMode) {
      setIsNightMode(true);
    }
  }, [status.lightingLevel, isNightMode, setIsNightMode]);

  return (
    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 p-4 min-h-0 relative">
      <div className="atmosphere" />
      
      {/* Left Section: Camera Feed & Main HUD */}
      <div className="flex flex-col gap-4 overflow-hidden">
        <section className="flex-1 glass rounded-xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
           {/* Hardware Frame UI */}
           <div className="absolute inset-0 pointer-events-none border border-white/5" />
           <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#00A3FF]/50" />
           <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#00A3FF]/50" />
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#00A3FF]/50" />
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#00A3FF]/50" />

           {/* Prediction HUD */}
           <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                 <div className="flex flex-col">
                    <span className="text-[8px] text-[#8E9299] uppercase font-bold tracking-tighter">Predicted Risk</span>
                    <div className="flex items-center gap-1.5">
                       <span className="text-sm font-mono font-black" style={{ color: status.predictedRisk > 60 ? '#FF4B4B' : '#00FF95' }}>
                         {Math.round(status.predictedRisk)}%
                       </span>
                       {status.predictedTrend === 'rising' && <TrendingUp className="w-3 h-3 text-red-400" />}
                       {status.predictedTrend === 'falling' && <TrendingDown className="w-3 h-3 text-green-400" />}
                       {status.predictedTrend === 'stable' && <Activity className="w-3 h-3 text-blue-400 opacity-50" />}
                    </div>
                 </div>
                 <div className="w-[1px] h-6 bg-white/10" />
                 <div className="flex flex-col">
                    <span className="text-[8px] text-[#8E9299] uppercase font-bold tracking-tighter">Confidence</span>
                    <span className="text-[10px] font-mono text-white/60">High</span>
                 </div>
              </div>
              {status.predictedTrend === 'rising' && status.predictedRisk > 40 && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-[9px] text-red-200 font-bold uppercase tracking-tight">Risk trend rising: stay alert</span>
                </motion.div>
              )}
           </div>

           <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 font-mono text-[11px] rounded border-l-4 border-[#00A3FF] z-20">
              LIVE_DATA // AZIMUTH: {status.headPose.yaw.toFixed(1)}° // {new Date().toLocaleTimeString()}
           </div>

           <div className="absolute top-4 right-4 z-20 flex gap-2">
              {status.isDrowsy && (
                <Badge className="bg-red-500 text-white animate-pulse">DROWSY_ALERT</Badge>
              )}
              {status.isMicrosleeping && (
                <Badge className="bg-red-600 text-white animate-bounce shadow-[0_0_15px_rgba(220,38,38,0.5)]">EMERGENCY_MICROSLEEP</Badge>
              )}
              <Badge variant="outline" className="bg-black/50 border-[#00FF95] text-[#00FF95] font-mono">
                VISION_ACTIVE
              </Badge>
           </div>

           {/* Video Feed */}
           <div className={`absolute inset-0 w-full h-full transition-all duration-700 ${isNightMode ? 'brightness-50 grayscale contrast-125' : 'bg-neutral-900/10'}`}>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform scale-x-[-1]" width={640} height={480} />
              <div className="scan-line" />
              
              {/* Active Alert Notification */}
              <AnimatePresence>
                {alerts.length > 0 && (Date.now() - alerts[0].timestamp < 5000) && (
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6"
                  >
                    <div className={`glass p-4 border-l-4 ${alerts[0].type === 'critical' ? 'border-red-500' : 'border-yellow-500'} flex flex-col gap-1 shadow-2xl overflow-hidden relative`}>
                       <div className={`absolute top-0 right-0 p-4 opacity-10 ${alerts[0].type === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                          <AlertTriangle size={64} />
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${alerts[0].type === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                          {alerts[0].category} Level: {alerts[0].type}
                       </span>
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">{alerts[0].message}</h3>
                       {alerts[0].reason && (
                          <div className="mt-2 pt-2 border-t border-white/5">
                             <p className="text-[10px] text-[#8E9299] uppercase font-bold tracking-widest mb-1">AI Reasoning</p>
                             <p className="text-xs text-white/70 italic leading-snug">"{alerts[0].reason}"</p>
                          </div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isSystemOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center glass z-30">
                   <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8 text-white/20" />
                   </div>
                   <p className="text-[#8E9299] text-xs font-mono uppercase tracking-[0.3em]">Neural Link Standby</p>
                </div>
              )}
           </div>

           {/* AI Focus UI */}
           {isSystemOn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-48 h-48 border border-[#00A3FF]/20 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 border border-[#00A3FF]/40 rounded-full animate-ping opacity-20" />
                 </div>
              </div>
           )}

           {/* Overlays (Recovery & Calm) */}
           <AnimatePresence>
             {recoveryMode.isActive && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="absolute inset-0 bg-blue-600/20 backdrop-blur-md z-40 flex items-center justify-center p-8 pointer-events-auto"
               >
                 <div className="bg-[#151619] border-2 border-[#00A3FF] rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_-12px_rgba(0,163,255,0.5)]">
                   <div className="mb-6">
                     <div className="text-4xl mb-4">
                       {recoveryMode.step === 0 && "👀"}
                       {recoveryMode.step === 1 && "⬅️➡️"}
                       {recoveryMode.step === 2 && "🔄"}
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">
                       {recoveryMode.step === 0 && "Blink Rapidly"}
                       {recoveryMode.step === 1 && "Look Left & Right"}
                       {recoveryMode.step === 2 && "Rotate Shoulders"}
                     </h3>
                     <p className="text-[#8E9299] text-xs uppercase tracking-widest font-medium">Recovery Mode Active</p>
                   </div>
                   <div className="relative w-20 h-20 mx-auto mb-6">
                     <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-black">{recoveryMode.timer}</span>
                   </div>
                   <button onClick={() => setRecoveryMode({ isActive: false, step: 0, timer: 0 })} className="text-[10px] text-[#8E9299] hover:text-white uppercase font-bold tracking-widest">Skip</button>
                 </div>
               </motion.div>
             )}
             
             {calmMode.isActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#00FF95]/10 backdrop-blur-xl z-50 flex items-center justify-center p-8 pointer-events-auto"
                >
                  <div className="text-center">
                    <motion.div 
                      animate={{ scale: calmMode.phase === 'hold' ? 1.4 : calmMode.phase === 'inhale' ? 1.5 : 1 }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-48 h-48 bg-[#00FF95]/20 rounded-full flex items-center justify-center border-4 border-[#00FF95] shadow-[0_0_50px_#00FF95] mb-8"
                    >
                      <Wind className="w-16 h-16 text-[#00FF95]" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                       {calmMode.phase === 'inhale' ? "Breath In" : calmMode.phase === 'hold' ? "Hold" : "Exhale"}
                    </h2>
                    <p className="text-[#00FF95] font-mono text-sm tracking-[0.3em] uppercase">{calmMode.timer}s Remaining</p>
                    <button onClick={() => setCalmMode({ isActive: false, timer: 0, phase: 'inhale' })} className="mt-12 text-[10px] text-white/40 hover:text-white uppercase font-bold tracking-widest">Abort</button>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </section>

        {/* HUD Stats: Intelligent Scanning */}
        <section className={`grid ${isSafeMode ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-6'} gap-4 transition-all duration-500`}>
           {[
             { label: 'Gaze Focus', value: status.gaze.toUpperCase(), color: status.gaze === 'road' ? '#00FF95' : '#FF4B4B', icon: <Eye className="w-3 h-3" /> },
             { label: 'Emotion', value: status.emotion, color: '#00A3FF', icon: <Brain className="w-3 h-3" /> },
             { label: 'Posture', value: status.posture.toUpperCase(), color: status.posture === 'good' ? '#00FF95' : '#FFD600', icon: <Activity className="w-3 h-3" /> },
             { label: 'Mobile Device', value: status.isUsingPhone ? 'DETECTED' : 'CLEAR', color: status.isUsingPhone ? '#FF4B4B' : '#00FF95', icon: <Smartphone className="w-3 h-3" /> },
             { label: 'Attention', value: `${Math.round(status.attentionScore)}%`, color: status.attentionScore > 70 ? '#00FF95' : '#FFD600', icon: <Brain className="w-3 h-3" /> },
             { label: 'Eye Closure', value: `${status.eyeClosureDuration.toFixed(2)}s`, color: status.eyeClosureDuration > 0.5 ? '#FF4B4B' : '#00A3FF', icon: <Eye className="w-3 h-3" /> },
           ].map((stat, i) => (
             <div key={i} className="glass p-3 rounded-xl flex flex-col justify-center">
                <div className="flex items-center gap-1.5 mb-1">
                   <span className="text-[#8E9299]">{stat.icon}</span>
                   <p className="text-[9px] text-[#8E9299] uppercase font-bold tracking-tight">{stat.label}</p>
                </div>
                <p className="text-sm font-mono font-black truncate" style={{ color: stat.color }}>{stat.value}</p>
             </div>
           ))}
        </section>
      </div>

      {/* Right Sidebar: Intelligence & Feedback */}
      <aside className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
          {/* Smart Coach Advice */}
          <section className="glass-accent rounded-xl p-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4 text-[#00A3FF]" />
             </div>
             <p className="text-[10px] text-[#00A3FF] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                <Brain className="w-3 h-3" />
                Coach Observation
             </p>
             <p className="text-xs text-white/90 leading-snug italic">"{status.coachAdvice}"</p>
          </section>

          {/* Risk Replay Timeline */}
          <section className="glass rounded-xl p-4 flex flex-col min-h-0">
             <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <span className="text-[10px] text-[#8E9299] uppercase font-black tracking-widest flex items-center gap-2">
                   <History className="w-3 h-3" />
                   Risk Timeline
                </span>
                <span className="text-[9px] font-mono opacity-40">LAST_30_EVENTS</span>
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {timeline.length > 0 ? timeline.map((event, i) => (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={event.id} className="flex gap-3 relative">
                      {i < timeline.length - 1 && <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-white/5" />}
                      <div className={`w-4 h-4 rounded-full border-4 ${event.intensity === 'high' ? 'bg-red-500 border-red-900/50' : event.intensity === 'medium' ? 'bg-yellow-500 border-yellow-900/50' : 'bg-[#00FF95] border-green-900/50'} mt-1 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                      <div className="flex flex-col gap-0.5">
                         <span className="text-[9px] font-mono text-[#8E9299] flex items-center gap-2">
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            <span className={`uppercase text-[8px] font-bold px-1.5 rounded ${event.intensity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}>{event.type}</span>
                         </span>
                         <span className="text-[11px] text-white/80 leading-tight">{event.message}</span>
                      </div>
                   </motion.div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-8 opacity-20 italic text-xs">
                     <Activity className="w-8 h-8 mb-2" />
                     Waiting for events...
                  </div>
                )}
             </div>
          </section>

          {/* Behavior Learning Insights */}
          <section className="glass rounded-xl p-4 border-t-2 border-t-[#00FF95]">
             <p className="text-[10px] text-[#00FF95] uppercase font-black tracking-widest mb-3">Adaptive Insights</p>
             <div className="space-y-3">
                {status.learningInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#00FF95] mt-1.5 shrink-0" />
                     <p className="text-[11px] text-white/70 leading-tight">{insight}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Controls & Actions */}
          <section className="glass rounded-xl p-4 mt-auto">
             <div className="grid grid-cols-2 gap-2 mb-4">
                <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setCalmMode({ isActive: true, timer: 12, phase: 'inhale' })}
                   className="glass-accent text-[#00FF95] text-[10px] h-9 gap-2 hover:bg-[#00FF95]/20"
                >
                   <Wind className="w-3 h-3" />
                   Calm Mode
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="outline" size="sm" className="glass-accent text-[#00A3FF] text-[10px] h-9 gap-2 hover:bg-[#00A3FF]/20">
                       <Terminal className="w-3 h-3" />
                       Simulator
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="glass text-white w-48">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-[#8E9299]">Override Sensors</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="text-xs hover:bg-white/5" onClick={() => setSimulationMode('drowsy')}>Simulation: Drowsy</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs hover:bg-white/5" onClick={() => setSimulationMode('distracted')}>Simulation: Distracted</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs hover:bg-white/5 font-bold text-red-400" onClick={() => setSimulationMode('high-risk')}>Simulation: High Risk</DropdownMenuItem>
                    {simulationMode !== 'none' && (
                      <DropdownMenuItem className="text-xs text-red-500 font-black uppercase" onClick={() => setSimulationMode('none')}>Abort Simulation</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
             </div>

             <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex flex-col">
                   <span className="text-[9px] text-[#8E9299] uppercase font-bold tracking-widest">Safe Mode</span>
                   <span className="text-[8px] text-white/30 uppercase">Auto-Stop & Recovery</span>
                </div>
                <Switch checked={isSafeMode} onCheckedChange={setIsSafeMode} className="scale-75 data-[state=checked]:bg-[#00FF95]" />
             </div>

             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setIsVoiceOn(!isVoiceOn)} className={`py-2 rounded border flex flex-col items-center gap-1 transition-all ${isVoiceOn ? 'bg-[#00A3FF]/10 border-[#00A3FF] text-[#00A3FF]' : 'bg-white/5 border-white/10 text-[#8E9299]'}`}>
                   <Volume2 className="w-4 h-4" />
                   <span className="text-[8px] uppercase font-bold">Mute</span>
                </button>
                <button onClick={() => setIsNightMode(!isNightMode)} className={`py-2 rounded border flex flex-col items-center gap-1 transition-all ${isNightMode ? 'bg-[#00FF95]/10 border-[#00FF95] text-[#00FF95]' : 'bg-white/5 border-white/10 text-[#8E9299]'}`}>
                   {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                   <span className="text-[8px] uppercase font-bold text-center">Theme</span>
                </button>
                <button onClick={() => setShowSummary(true)} className="py-2 rounded border border-white/10 bg-white/5 text-[#8E9299] flex flex-col items-center gap-1 hover:text-white">
                   <History className="w-4 h-4" />
                   <span className="text-[8px] uppercase font-bold">History</span>
                </button>
             </div>
          </section>
      </aside>

      {/* Session Summary Modal */}
      <AlertDialog open={showSummary} onOpenChange={setShowSummary}>
        <AlertDialogContent className="glass text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Terminal className="text-[#00A3FF]" />
              Session Analysis
            </AlertDialogTitle>
          </AlertDialogHeader>
          
          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-[#8E9299] uppercase font-bold mb-1">Total Signals</p>
              <p className="text-2xl font-black text-[#00A3FF]">{sessionStats.alerts}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center flex flex-col items-center">
              <p className="text-[10px] text-[#8E9299] uppercase font-bold mb-1">Peak Risk</p>
              <div className="flex items-center gap-2">
                 <p className="text-2xl font-black text-[#FF4B4B]">{Math.round(sessionStats.maxRisk)}%</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { resetSession(); setShowSummary(false); }} className="bg-[#00A3FF] hover:bg-[#0081cc] text-black font-black uppercase tracking-widest text-[11px]">New Session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
