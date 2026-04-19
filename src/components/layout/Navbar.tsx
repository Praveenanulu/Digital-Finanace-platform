import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ShieldCheck, Brain, LineChart, Shield, LogOut, BookOpen, Headphones, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDriver } from '../../context/DriverContext';
import { Separator } from '../ui/separator';

export default function Navbar() {
  const { logout } = useAuth();
  const { isSystemOn, setIsSystemOn, profile } = useDriver();

  const navItems = [
    { name: 'Live Feed', path: '/', icon: Activity },
    { name: 'AI Insights', path: '/insights', icon: Brain },
    { name: 'Education Hub', path: '/education', icon: BookOpen },
    { name: 'Voice AI', path: '/voice', icon: Headphones },
    { name: 'Emergency', path: '/support', icon: ShieldAlert },
    { name: 'Prevention', path: '/prevention', icon: ShieldCheck },
    { name: 'Profile', path: '/profile', icon: LineChart },
  ];

  return (
    <header className="h-[64px] border-b border-[#2A2C31] bg-[#151619] flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-8">
        <div className="text-xl font-extrabold tracking-tighter flex items-center gap-2">
          DRIVE<span className="text-[#00A3FF]">SENTINEL-X</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
                  isActive 
                  ? 'bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/30' 
                  : 'text-[#8E9299] hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-[#00FF95]/10 border border-[#00FF95] text-[#00FF95] text-[10px] uppercase font-mono rounded font-bold">
          {profile.name} // {profile.id}
        </div>
        
        <Separator orientation="vertical" className="h-6 bg-white/10" />

        <button 
          onClick={logout}
          className="p-2 text-[#8E9299] hover:text-white transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setIsSystemOn(!isSystemOn)}
          className={`px-6 py-2 rounded font-black uppercase text-[11px] tracking-widest transition-all ${
            isSystemOn 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-[#00FF95] text-black hover:bg-[#00e686]'
          }`}
        >
          {isSystemOn ? 'SYSTEM_OFF' : 'ENGAGE_AI'}
        </button>
      </div>
    </header>
  );
}
