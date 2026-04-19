
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { User, Award, Zap, History, Target, TrendingUp, CheckCircle2, Brain } from 'lucide-react';
import { useDriver } from '../context/DriverContext';
import { useAuth } from '../hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const { user } = useAuth();
  const { profile, analytics, digitalTwin } = useDriver();

  const safetyLogs = [
    { day: 'Mon', score: 98 },
    { day: 'Tue', score: 94 },
    { day: 'Wed', score: 96 },
    { day: 'Thu', score: 92 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 99 },
    { day: 'Sun', score: 97 },
  ];

  const distractionData = [
    { hour: '08', count: 2 },
    { hour: '10', count: 5 },
    { hour: '12', count: 4 },
    { hour: '14', count: 8 },
    { hour: '16', count: 3 },
    { hour: '18', count: 1 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0A0A0B] space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
           <div className="w-16 h-16 bg-[#151619] border border-[#2A2C31] rounded-2xl flex items-center justify-center overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} alt="Profile" /> : <User className="w-8 h-8 text-[#8E9299]" />}
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">{profile.name} // Driver Analytics</h1>
              <div className="flex items-center gap-2 mt-1">
                 <Badge variant="outline" className="text-[10px] bg-[#00FF95]/5 border-[#00FF95]/20 text-[#00FF95] uppercase font-mono">Expert Class</Badge>
                 <span className="text-[10px] text-[#8E9299] font-mono">ID: {profile.id}</span>
              </div>
           </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-[#8E9299] uppercase font-bold mb-1">Lifetime Safety Score</p>
           <div className="flex items-baseline gap-2 justify-end">
              <span className="text-4xl font-black font-mono tracking-tighter text-white">96.5</span>
              <span className="text-xs font-bold text-[#00FF95]">↑ 2.4%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Digital Twin Insights */}
         <Card className="lg:col-span-1 bg-[#151619] border-[#2A2C31] text-white overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
               <CardTitle className="text-[11px] uppercase tracking-widest flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-[#00A3FF]" />
                  Digital Twin // Baseline
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-[#8E9299] uppercase font-bold">Health Score</span>
                     <span className="text-sm font-mono font-black">{digitalTwin.healthScore}%</span>
                  </div>
                  <Progress value={digitalTwin.healthScore} className="h-1 bg-white/5" indicatorClassName="bg-[#00A3FF]" />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-[#8E9299] uppercase font-bold">Attention Stability</span>
                     <span className="text-sm font-mono font-black">{digitalTwin.attentionStability}%</span>
                  </div>
                  <Progress value={digitalTwin.attentionStability} className="h-1 bg-white/5" indicatorClassName="bg-[#00FF95]" />
               </div>

               <Separator className="bg-white/5" />

               <div className="space-y-4">
                  <p className="text-[10px] text-[#8E9299] uppercase font-bold">Personalized Advice</p>
                  <p className="text-xs italic leading-relaxed text-[#8E9299]">
                    "Your cognitive load peaks between 14:00 - 16:00. We suggest metabolic boosters (green tea/water) during this window to maintain focused baseline scores."
                  </p>
               </div>
            </CardContent>
         </Card>

         {/* Charts */}
         <Card className="lg:col-span-3 bg-[#151619] border-[#2A2C31] text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
               <div className="p-6 border-r border-white/5">
                  <div className="flex justify-between items-center mb-6">
                     <p className="text-[11px] text-[#8E9299] uppercase font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#00FF95]" />
                        Weekly Safety Drift
                     </p>
                  </div>
                  <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={safetyLogs}>
                           <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#00FF95" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#00FF95" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                           <XAxis dataKey="day" hide />
                           <YAxis domain={[80, 100]} hide />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px', fontSize: '10px' }}
                             itemStyle={{ color: '#00FF95' }}
                           />
                           <Area type="monotone" dataKey="score" stroke="#00FF95" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <p className="text-[11px] text-[#8E9299] uppercase font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#FFD600]" />
                        Distraction Heatmap (Count)
                     </p>
                  </div>
                  <div className="h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distractionData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                           <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                           <YAxis hide />
                           <Tooltip 
                             cursor={{fill: 'transparent'}}
                             contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '4px', fontSize: '10px' }}
                           />
                           <Bar dataKey="count" fill="#FFD600" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: Award, label: 'Safety Streak', value: '14 Days', sub: 'Top 5% of Drivers' },
           { icon: CheckCircle2, label: 'Reaction Average', value: '242 ms', sub: '-12ms improvement' },
           { icon: History, label: 'Total AI Monitoring', value: '142.5 hrs', sub: 'Safe Miles Covered' }
         ].map((item, i) => (
           <Card key={i} className="bg-[#151619] border-[#2A2C31] text-white">
              <CardContent className="p-6 flex items-center gap-6">
                 <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-[#8E9299]" />
                 </div>
                 <div>
                    <p className="text-[10px] text-[#8E9299] uppercase font-bold mb-0.5">{item.label}</p>
                    <p className="text-xl font-mono font-black">{item.value}</p>
                    <p className="text-[10px] text-[#00FF95] font-bold uppercase tracking-tight">{item.sub}</p>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
