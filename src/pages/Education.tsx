import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, Info, Volume2, Shield, Brain, Activity } from 'lucide-react';
import { useDriver } from '../context/DriverContext';
import { speakAdvice } from '../lib/gemini-service';
import { EducationCategory, Language } from '../types';

const EDU_CONTENT: EducationCategory[] = [
  {
    id: 'fatigue',
    title: 'Fatigue Awareness',
    description: 'Understanding and identifying signs of driver fatigue.',
    icon: 'Brain',
    tips: [
      { 
        text: 'Frequent yawning and difficulty keeping eyes open.', 
        voice: { 
          en: 'Frequent yawning and difficulty keeping eyes open.', 
          hi: 'बार-बार जम्हाई आना और आँखें खुली रखने में कठिनाई होना।', 
          mr: 'वारंवार जांभई येणे आणि डोळे उघडे ठेवण्यास त्रास होणे.' 
        } 
      },
      { 
        text: 'Drifting from lane or hitting rumble strips.', 
        voice: { 
          en: 'Drifting from lane or hitting rumble strips.', 
          hi: 'लेन से भटकना या रंबल स्ट्रिप्स से टकराना।', 
          mr: 'लेनमधून भरकटणे किंवा रंबल स्ट्रिप्सवर जाणे.' 
        } 
      },
      { 
        text: 'Slow reaction times and impaired decision making.', 
        voice: { 
          en: 'Slow reaction times and impaired decision making.', 
          hi: 'प्रतिक्रिया समय धीमा होना और निर्णय लेने में असमर्थता।', 
          mr: 'प्रतिक्रिया वेळ मंदावणे आणि निर्णय घेण्याची क्षमता कमी होणे.' 
        } 
      }
    ]
  },
  {
    id: 'distraction',
    title: 'Distraction Prevention',
    description: 'The dangers of diverted attention on the road.',
    icon: 'AlertCircle',
    tips: [
      { 
        text: 'Avoid using mobile phones while driving.', 
        voice: { 
          en: 'Never use mobile phones while driving.', 
          hi: 'गाड़ी चलाते समय मोबाइल फोन का उपयोग कभी न करें।', 
          mr: 'गाडी चालवताना कधीही मोबाईल फोन वापरू नका.' 
        } 
      },
      { 
        text: 'Set your navigation before you start your journey.', 
        voice: { 
          en: 'Set your navigation before you start your journey.', 
          hi: 'अपनी यात्रा शुरू करने से पहले अपना नेविगेशन सेट करें।', 
          mr: 'तुमचा प्रवास सुरू करण्यापूर्वी तुमचे नेव्हिगेशन सेट करा.' 
        } 
      }
    ]
  },
  {
    id: 'safety',
    title: 'Safety Fundamentals',
    description: 'Core practices for every responsible driver.',
    icon: 'Shield',
    tips: [
      { 
        text: 'Always wear your seatbelt, even for short trips.', 
        voice: { 
          en: 'Always wear your seatbelt, even for short trips.', 
          hi: 'हमेशा अपनी सीटबेल्ट पहनें, छोटी यात्राओं के लिए भी।', 
          mr: 'नेहमी तुमची सीटबेल्ट लावा, अगदी छोट्या प्रवासासाठी सुद्धा.' 
        } 
      },
      { 
        text: 'Maintain a safe following distance from other vehicles.', 
        voice: { 
          en: 'Maintain a safe following distance from other vehicles.', 
          hi: 'अन्य वाहनों से सुरक्षित दूरी बनाए रखें।', 
          mr: 'इतर वाहनांपासून सुरक्षित अंतर ठेवा.' 
        } 
      }
    ]
  }
];

export default function Education() {
  const { status } = useDriver();
  
  const handleListen = (voice: { [key in Language]: string }) => {
    const text = voice[status.language];
    speakAdvice(text, status.language);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
      <div className="atmosphere" />
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Education & Awareness</h1>
          <p className="text-[#8E9299] text-sm font-medium tracking-widest uppercase">Empowering drivers with knowledge</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EDU_CONTENT.map((category) => (
            <Card key={category.id} className="glass overflow-hidden border-t-4 border-t-[#00A3FF]">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#00A3FF]/10 rounded-lg text-[#00A3FF]">
                    {category.icon === 'Brain' && <Brain size={24} />}
                    {category.icon === 'AlertCircle' && <AlertCircle size={24} />}
                    {category.icon === 'Shield' && <Shield size={24} />}
                  </div>
                  <CardTitle className="text-xl font-bold uppercase tracking-tight">{category.title}</CardTitle>
                </div>
                <CardDescription className="text-[#8E9299] text-sm leading-snug">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[1px] bg-white/5 w-full mb-4" />
                {category.tips.map((tip, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="p-3 bg-white/5 rounded-lg border border-white/5 group relative"
                  >
                    <p className="text-xs text-white/80 leading-relaxed pr-8">{tip.text}</p>
                    <button 
                      onClick={() => handleListen(tip.voice)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E9299] hover:text-[#00A3FF] transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12 glass rounded-2xl p-8 border border-[#00A3FF]/20 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <BookOpen size={120} />
           </div>
           <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 rounded-full bg-[#00A3FF] animate-pulse" />
                 <span className="text-[10px] text-[#00A3FF] uppercase font-black tracking-widest">Hackathon Exclusive</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">AI Knowledge Base</h2>
              <p className="text-[#8E9299] text-base leading-relaxed mb-6">
                Our educational hub leverages machine learning to identify your specific risk patterns and provide personalized learning modules. Stay updated with the latest in safety protocols and driver ergonomics.
              </p>
              <div className="flex flex-wrap gap-3">
                 <Button variant="outline" className="glass-accent text-[#00A3FF] border-[#00A3FF]/20 h-10 uppercase text-[10px] font-bold tracking-widest">
                    Take Safety Quiz
                 </Button>
                 <Button variant="outline" className="glass text-white/40 h-10 uppercase text-[10px] font-bold tracking-widest">
                    Download Resource Pack
                 </Button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
