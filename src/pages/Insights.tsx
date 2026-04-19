
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, Info, Layers, TrendingUp, Clock, Target } from 'lucide-react';
import { useDriver } from '../context/DriverContext';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function Insights() {
  const { status, alerts, analytics } = useDriver();

  const mockTimeline = alerts.slice(0, 8).map(a => ({
    time: new Date(a.timestamp).toLocaleTimeString([], { hour12: false }),
    event: a.message,
    source: a.category.toUpperCase()
  }));

  const featureWeights = [
    { label: 'Eyelid Closure (EAR)', value: 85, color: '#00A3FF' },
    { label: 'Mouth Opening (MAR)', value: 32, color: '#8E9299' },
    { label: 'Head Orientation', value: 64, color: '#FFD600' },
    { label: 'Blink Rate Delta', value: 45, color: '#00FF95' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0A0B]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">AI Insights & Explainability</h1>
          <p className="text-sm text-[#8E9299]">Interpreting the neural network's behavioral inferences.</p>
        </div>
        <div className="flex bg-[#151619] border border-[#2A2C31] p-3 rounded-xl items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] text-[#8E9299] uppercase font-bold">Inference Confidence</p>
              <p className="text-lg font-mono font-black text-[#00FF95]">94.8%</p>
           </div>
           <Target className="w-8 h-8 text-[#00FF95]/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Explainable AI Panel */}
        <Card className="lg:col-span-2 bg-[#151619] border-[#2A2C31] text-white">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-[12px] uppercase tracking-widest flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#00A3FF]" />
              Explainable AI (XAI) // Diagnostic Output
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-[11px] text-[#8E9299] font-bold uppercase">Current Inference reasoning</p>
                     <div className="space-y-3">
                        {status.xaiReasoning.length > 0 ? (
                           status.xaiReasoning.map((r, i) => (
                             <div key={i} className="flex gap-2 text-sm">
                                <span className="text-[#00FF95] shrink-0">•</span>
                                <span className="text-white/80 italic">"{r}"</span>
                             </div>
                           ))
                        ) : (
                           <p className="text-xs text-[#8E9299] italic">System monitoring normal baseline activity. No alert triggers present.</p>
                        )}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[11px] text-[#8E9299] font-bold uppercase">Feature Importance Visualization</p>
                     <div className="space-y-4">
                        {featureWeights.map((f, i) => (
                           <div key={i} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-mono">
                                 <span>{f.label}</span>
                                 <span>{f.value}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full" style={{ width: `${f.value}%`, backgroundColor: f.color }} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <Separator className="bg-white/5" />

               <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-[#00A3FF]" />
                    <p className="text-[11px] text-[#8E9299] font-bold uppercase">Model Architecture Note</p>
                  </div>
                  <p className="text-xs leading-relaxed text-[#8E9299]">
                    DriveSentinel-X utilizes a lightweight Vision Transformer (ViT) architecture fine-tuned on temporal driver datasets.
                    The "Attention Score" is derived from a cross-validation of eye-closure peaks and sudden head-pose deviations within a 500ms sliding window.
                  </p>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Decision Timeline */}
        <Card className="bg-[#151619] border-[#2A2C31] text-white flex flex-col">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-[12px] uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFD600]" />
              Decision Timeline // Sequence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto no-scrollbar">
             <div className="divide-y divide-white/5">
                {mockTimeline.length > 0 ? (
                  mockTimeline.map((item, i) => (
                    <div key={i} className="p-4 space-y-1 hover:bg-white/5 transition-colors">
                       <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                          <span className={`${item.source === 'CRITICAL' ? 'text-red-500' : 'text-[#8E9299]'}`}>{item.source}</span>
                          <span>{item.time}</span>
                       </div>
                       <p className="text-xs font-medium">{item.event}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#8E9299] text-xs italic">
                     Awaiting telemetry data...
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Micro-Behavior Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="bg-[#151619] border-[#2A2C31] text-white">
            <CardContent className="p-6 flex items-center gap-6">
               <div className="w-16 h-16 bg-[#00A3FF]/10 rounded-2xl flex items-center justify-center border border-[#00A3FF]/20">
                  <Layers className="w-8 h-8 text-[#00A3FF]" />
               </div>
               <div>
                  <p className="text-[11px] text-[#8E9299] uppercase font-bold mb-1">Attention Drift Detection</p>
                  <p className="text-xs text-[#8E9299] leading-tight">
                    Continuously tracking off-road gaze duration. Current drift risk is <span className="text-white font-bold font-mono">0.08ms/s</span>.
                  </p>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-[#151619] border-[#2A2C31] text-white">
            <CardContent className="p-6 flex items-center gap-6">
               <div className="w-16 h-16 bg-[#00FF95]/10 rounded-2xl flex items-center justify-center border border-[#00FF95]/20">
                  <TrendingUp className="w-8 h-8 text-[#00FF95]" />
               </div>
               <div>
                  <p className="text-[11px] text-[#8E9299] uppercase font-bold mb-1">Stability index</p>
                  <p className="text-xs text-[#8E9299] leading-tight">
                    Tracking fatigue oscillation patterns. Stability score is <span className="text-white font-bold font-mono">92/100</span>.
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
