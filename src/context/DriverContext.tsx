import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { DriverStatus, Alert, AnalyticsData, TimelineEvent, Language } from '../types';
import { VisionEngine, calculateEAR, calculateMAR, estimateHeadPose, analyzeGaze, sampleLighting } from '../lib/vision-engine';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { analyzeDriverFrame, analyzeBehaviorPatterns, speakAdvice, getCoDriverAdvice } from '../lib/gemini-service';

interface DriverContextType {
  status: DriverStatus;
  alerts: Alert[];
  analytics: AnalyticsData[];
  timeline: TimelineEvent[];
  isSystemOn: boolean;
  setIsSystemOn: (on: boolean) => void;
  isVoiceOn: boolean;
  setIsVoiceOn: (on: boolean) => void;
  isNightMode: boolean;
  setIsNightMode: (on: boolean) => void;
  sensitivity: number;
  setSensitivity: (val: number) => void;
  profile: any;
  setProfile: (val: any) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  localIntel: { weather: string; nearbyPlaces: string[] };
  interventionActive: boolean;
  setInterventionActive: (val: boolean) => void;
  isEmergencyBraking: boolean;
  setIsEmergencyBraking: (val: boolean) => void;
  coDriverText: string;
  setCoDriverText: (val: string) => void;
  digitalTwin: any;
  simulationMode: 'none' | 'drowsy' | 'distracted' | 'high-risk';
  setSimulationMode: (mode: 'none' | 'distracted' | 'high-risk' | 'drowsy') => void;
  cognitiveLoad: number;
  isPrivacyMode: boolean;
  setIsPrivacyMode: (val: boolean) => void;
  isSafeMode: boolean;
  setIsSafeMode: (val: boolean) => void;
  recoveryMode: { isActive: boolean; step: number; timer: number };
  setRecoveryMode: (val: { isActive: boolean; step: number; timer: number }) => void;
  calmMode: { isActive: boolean; timer: number; phase: 'inhale' | 'hold' | 'exhale' };
  setCalmMode: (val: { isActive: boolean; timer: number; phase: 'inhale' | 'hold' | 'exhale' }) => void;
  sessionStats: { alerts: number; maxRisk: number; startTime: number };
  resetSession: () => void;
  isListening: boolean;
  startListening: () => void;
  sosActive: boolean;
  sendEmergencyAlert: () => void;
  setLanguage: (lang: Language) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VisionEngine | null>(null);
  const sessionStartTime = useRef<number | null>(null);
  const microsleepTimerRef = useRef<number>(0);
  const lastBlinkTimeRef = useRef<number>(Date.now());
  const blinkHistoryRef = useRef<number[]>([]);
  const riskHistoryRef = useRef<number[]>([]);

  const [status, setStatus] = useState<DriverStatus>({
    isDrowsy: false,
    isDistracted: false,
    isYawning: false,
    isMicrosleeping: false,
    isUsingPhone: false,
    isWearingSeatbelt: true,
    blinkCount: 0,
    blinkRate: 0,
    eyeClosureDuration: 0,
    attentionScore: 100,
    riskScore: 0,
    predictedRisk: 0,
    predictedTrend: 'stable',
    coachAdvice: "Drive safe. I'm watching the road with you.",
    learningInsights: ["Calibrating your baseline behavior..."],
    headPose: { pitch: 0, yaw: 0, roll: 0 },
    gaze: 'road',
    emotion: 'Neutral',
    driverIdentity: null,
    posture: 'good',
    xaiReasoning: [],
    healthMetrics: { heartRate: 72, stressLevel: 15 },
    lightingLevel: 'normal',
    language: 'en'
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isSystemOn, setIsSystemOn] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [localIntel, setLocalIntel] = useState({ weather: 'Loading...', nearbyPlaces: [] as string[] });
  const [interventionActive, setInterventionActive] = useState(false);
  const [isEmergencyBraking, setIsEmergencyBraking] = useState(false);
  const [coDriverText, setCoDriverText] = useState("DriveSentinel-X Active.");
  const [sosActive, setSosActive] = useState(false);
  
  // Hackathon Features
  const [simulationMode, setSimulationMode] = useState<'none' | 'drowsy' | 'distracted' | 'high-risk'>('none');
  const [cognitiveLoad, setCognitiveLoad] = useState(15);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState({ isActive: false, step: 0, timer: 0 });
  const [calmMode, setCalmMode] = useState<{ isActive: boolean; timer: number; phase: 'inhale' | 'hold' | 'exhale' }>({ isActive: false, timer: 0, phase: 'inhale' });
  const [sessionStats, setSessionStats] = useState({ alerts: 0, maxRisk: 0, startTime: Date.now() });
  const [isListening, setIsListening] = useState(false);

  const setLanguage = (lang: Language) => {
    setStatus(prev => ({ ...prev, language: lang }));
    const msg = lang === 'en' ? "Language set to English." : lang === 'hi' ? "भाषा हिंदी में सेट की गई है।" : "भाषा मराठीत सेट केली आहे.";
    setCoDriverText(msg);
    if (isVoiceOn) speakAdvice(msg, lang);
  };

  const sendEmergencyAlert = () => {
    setSosActive(true);
    const msg = status.language === 'en' ? "Emergency alert sent. Location shared." : status.language === 'hi' ? "आपातकालीन अलर्ट भेजा गया। स्थान साझा किया गया।" : "आणीबाणीचा अलर्ट पाठवला. स्थान सामायिक केले.";
    setCoDriverText(msg);
    if (isVoiceOn) speakAdvice(msg, status.language);
    addAlert('safety', 'SOS: Emergency Alert Sent', 'critical');
    setTimeout(() => setSosActive(false), 8000);
  };

  const startListening = () => {
    if (isPrivacyMode) {
      setCoDriverText("Privacy Mode blocks voice commands.");
      return;
    }
    setIsListening(true);
    setCoDriverText("Listening...");
    
    // Simulate intent recognition
    setTimeout(() => {
      setIsListening(false);
      const random = Math.random();
      if (random < 0.3) {
        // Toggle language
        const nextLang: Language = status.language === 'en' ? 'hi' : status.language === 'hi' ? 'mr' : 'en';
        setLanguage(nextLang);
      } else if (random < 0.6) {
        setCoDriverText("Repeating last alert...");
        if (alerts.length > 0 && isVoiceOn) {
          speakAdvice(alerts[0].message, status.language);
        } else {
            speakAdvice("No recent alerts to repeat.", status.language);
        }
      } else {
        setCoDriverText("Monitoring safety parameters.");
        if (isVoiceOn) speakAdvice("Monitoring your safety Alex.", status.language);
      }
    }, 2000);
  };

  const [profile, setProfile] = useState({
    name: "Alex",
    id: "DSX-000",
    safetyScore: 100,
    totalXP: 0
  });

  const [digitalTwin, setDigitalTwin] = useState({
    avgSleep: 6.8,
    reactionTime: 245,
    fatigueBaseline: 24,
    healthScore: 88,
    attentionStability: 92
  });

  const resetSession = () => {
    setSessionStats({ alerts: 0, maxRisk: 0, startTime: Date.now() });
    setStatus(prev => ({ ...prev, riskScore: 0, predictedRisk: 0 }));
    setAnalytics([]);
    setAlerts([]);
    setTimeline([]);
  };

  const addTimelineEvent = (type: TimelineEvent['type'], message: string, intensity: TimelineEvent['intensity']) => {
    if (isPrivacyMode) return;
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      message,
      intensity
    };
    setTimeline(prev => [newEvent, ...prev].slice(0, 30));
  };

  const addAlert = (category: Alert['category'], message: string, type: Alert['type'], reason?: string) => {
    if (isPrivacyMode) return;
    
    // Multilingual Translation for Alerts
    const translations: { [key: string]: { [key in Language]: string } } = {
      'DROWSY_ALERT': { en: 'Fatigue Detected', hi: 'थकान महसूस हुई', mr: 'थकवा जाणवला' },
      'DISTRICTED_ALERT': { en: 'Distraction Detected', hi: 'ध्यान भटक गया', mr: 'लक्ष विचलित झाले' },
      'PHONE_ALERT': { en: 'Mobile Usage Detected', hi: 'मोबाइल का उपयोग', mr: 'मोबाईल वापर आढळला' }
    };

    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type,
      message,
      category,
      reason: reason || status.xaiReasoning[status.xaiReasoning.length - 1]
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    setSessionStats(prev => ({ ...prev, alerts: prev.alerts + 1 }));
    setCoDriverText(message);
    if (isVoiceOn) speakAdvice(message, status.language);
    addTimelineEvent(category === 'fatigue' ? 'fatigue' : 'distraction', message, type === 'critical' ? 'high' : type === 'warning' ? 'medium' : 'low');
  };

  // periodic Intelligent Analysis
  useEffect(() => {
    let interval: any;
    if (isSystemOn && !isPrivacyMode) {
      interval = setInterval(async () => {
        if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
            const analysis = await analyzeDriverFrame(base64);
            if (analysis) {
              setStatus(prev => ({
                ...prev,
                driverIdentity: analysis.identity,
                isUsingPhone: analysis.phoneDetected,
                isWearingSeatbelt: analysis.seatbeltOn,
                emotion: analysis.emotion,
                posture: analysis.posture.toLowerCase() as any,
                xaiReasoning: [...prev.xaiReasoning, analysis.reasoning].slice(-5)
              }));

              if (analysis.phoneDetected) addAlert('distraction', 'Distraction Detected: Mobile Usage', 'critical');
              if (!analysis.seatbeltOn) addAlert('safety', 'Please Wear Seatbelt', 'warning');
              
              if (analysis.identity && analysis.identity !== profile.name && analysis.identity !== "Unknown") {
                setProfile(prev => ({ ...prev, name: analysis.identity }));
                setCoDriverText(`Identity Recognized: Welcome, ${analysis.identity}.`);
              }
            }
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSystemOn, isPrivacyMode, profile.name]);

  // Behavior Pattern Learning
  useEffect(() => {
    let interval: any;
    if (isSystemOn && analytics.length > 10) {
      interval = setInterval(async () => {
        const insights = await analyzeBehaviorPatterns(analytics);
        setStatus(prev => ({ ...prev, learningInsights: insights }));
      }, 30000); 
    }
    return () => clearInterval(interval);
  }, [isSystemOn, analytics.length]);

  // Smart Driving Coach
  useEffect(() => {
    let interval: any;
    if (isSystemOn && status.riskScore > 20) {
      interval = setInterval(async () => {
        const advice = await getCoDriverAdvice({
          riskScore: status.riskScore,
          status: status.isDrowsy ? 'Drowsy' : status.isDistracted ? 'Distracted' : 'Active',
          history: alerts.slice(0, 3).map(a => a.message),
          language: status.language === 'en' ? 'English' : status.language === 'hi' ? 'Hindi' : 'Marathi'
        });
        if (advice) {
          setStatus(prev => ({ ...prev, coachAdvice: advice }));
          if (status.riskScore > 50) {
            setCoDriverText(advice);
            if (isVoiceOn) speakAdvice(advice, status.language);
          }
        }
      }, 20000);
    }
    return () => clearInterval(interval);
  }, [isSystemOn, status.riskScore, alerts, isVoiceOn]);

  // Calm Mode logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (calmMode.isActive && calmMode.timer > 0) {
      timer = setInterval(() => {
        setCalmMode(prev => {
          const nextTimer = prev.timer - 1;
          const nextPhase = nextTimer > 8 ? 'inhale' : nextTimer > 4 ? 'hold' : 'exhale';
          return { ...prev, timer: nextTimer, phase: nextPhase };
        });
      }, 1000);
    } else if (calmMode.isActive && calmMode.timer === 0) {
      setCalmMode({ isActive: false, timer: 0, phase: 'inhale' });
      setCoDriverText("Stress baseline recovered. Drive safely.");
      addTimelineEvent('safe', 'Completed Guided Breathing', 'low');
    }
    return () => clearInterval(timer);
  }, [calmMode.isActive, calmMode.timer]);

  // Vision Processing
  const processVisionData = (ear: number, mar: number, pose: { pitch: number, yaw: number, roll: number }, landmarks: any[]) => {
    const isNight = sampleLighting(videoRef.current!) === 'low';
    const nightSensitivity = (isNight || isNightMode) ? 1.3 : 1.0;
    
    if (isNight && !isNightMode) setIsNightMode(true);
    const drowsyThreshold = (0.22 * (sensitivity / 50)) * nightSensitivity;
    const yawningThreshold = (0.6 / (sensitivity / 50)) / nightSensitivity;

    let drowsy = ear < drowsyThreshold;
    let yawning = mar > yawningThreshold;
    let gazeStatus = analyzeGaze(landmarks);
    let distracted = gazeStatus !== 'road' || Math.abs(pose.yaw) > 25 || Math.abs(pose.pitch) > 25;

    if (ear < 0.15) {
      microsleepTimerRef.current += 1;
    } else {
      if (microsleepTimerRef.current > 0 && microsleepTimerRef.current < 10) {
        // Detected a quick blink
        const now = Date.now();
        const diff = (now - lastBlinkTimeRef.current) / 1000;
        if (diff > 0.1) {
          blinkHistoryRef.current = [...blinkHistoryRef.current, now].slice(-20);
          lastBlinkTimeRef.current = now;
        }
      }
      microsleepTimerRef.current = 0;
    }
    const isMicrosleeping = microsleepTimerRef.current > 30;

    if (simulationMode === 'drowsy') drowsy = true;
    if (simulationMode === 'distracted') distracted = true;
    if (simulationMode === 'high-risk') { drowsy = true; distracted = true; }

    let newRisk = status.riskScore;

    // Calculate Extended Metrics
    const eyeClosureDuration = (microsleepTimerRef.current * 100) / 1000;
    const blinkRate = blinkHistoryRef.current.length > 1 
      ? (blinkHistoryRef.current.length / ((Date.now() - blinkHistoryRef.current[0]) / 60000))
      : 0;
    const attentionScore = Math.max(0, 100 - (newRisk * 0.8) - (distracted ? 20 : 0));
    const reasoning: string[] = [];

    if (isNight) reasoning.push("Low-light conditions: High sensitivity mode active.");
    if (isMicrosleeping) {
      newRisk += 15;
      reasoning.push("MICROSLEEP DETECTED: Instant safety intervention.");
      addAlert('fatigue', 'CRITICAL: Microsleep detected!', 'critical');
    }
    if (drowsy) {
      newRisk += 2 * nightSensitivity;
      reasoning.push(`Low EAR (${ear.toFixed(2)}): Fatigue signal.`);
    }
    if (distracted) {
      newRisk += 1;
      reasoning.push(`Gaze Error: Driver looking at ${gazeStatus}.`);
    }
    if (yawning) {
      newRisk += 0.5;
      reasoning.push(`Frequent Yawning recorded.`);
    }
    
    if (!drowsy && !distracted && !yawning && !isMicrosleeping) newRisk -= 0.5;
    newRisk = Math.max(0, Math.min(100, newRisk));

    // Prediction Logic
    riskHistoryRef.current = [...riskHistoryRef.current, newRisk].slice(-60);
    const recentScores = riskHistoryRef.current.slice(-20);
    const olderScores = riskHistoryRef.current.slice(0, 20);
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / (recentScores.length || 1);
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / (olderScores.length || 1);
    const trend: 'stable' | 'rising' | 'falling' = recentAvg > olderAvg + 2 ? 'rising' : recentAvg < olderAvg - 2 ? 'falling' : 'stable';
    const predicted = Math.min(100, Math.max(0, newRisk + (trend === 'rising' ? 10 : trend === 'falling' ? -5 : 0)));

    const heartRate = 70 + (newRisk / 2) + Math.random() * 5;
    const stress = (newRisk * 1.2) + Math.random() * 10;

    setStatus(prev => ({
      ...prev,
      isDrowsy: drowsy,
      isDistracted: distracted,
      isYawning: yawning,
      isMicrosleeping,
      headPose: pose,
      blinkRate,
      eyeClosureDuration,
      attentionScore,
      riskScore: newRisk,
      predictedRisk: predicted,
      predictedTrend: trend,
      gaze: gazeStatus,
      lightingLevel: isNight ? 'low' : 'normal',
      healthMetrics: { heartRate, stressLevel: stress },
      xaiReasoning: reasoning.length > 0 ? Array.from(new Set([...reasoning, ...prev.xaiReasoning])).slice(0, 5) : prev.xaiReasoning
    }));

    if (newRisk > sessionStats.maxRisk) setSessionStats(prev => ({ ...prev, maxRisk: newRisk }));

    if (newRisk > 85 && !interventionActive) {
      const phrase = status.language === 'en' ? 'You are getting drowsy! Please take a break immediately.' : 
                     status.language === 'hi' ? 'आपको नींद आ रही है! कृपया तुरंत ब्रेक लें।' : 'तुम्हाला झोप येत आहे! कृपया त्वरित विश्रांती घ्या.';
      addAlert('fatigue', phrase, 'critical');
    }

    // Periodically sync to backend API
    if (Date.now() % 2000 < 50) {
      fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: drowsy ? 'Drowsy' : distracted ? 'Distracted' : 'Focused', riskScore: newRisk })
      }).catch(() => {});
    }

    if (Date.now() % 5000 < 500) {
      setAnalytics(prev => [...prev, {
        timestamp: Date.now(),
        riskScore: newRisk,
        ear,
        mar,
        emotion: status.emotion,
        isUsingPhone: status.isUsingPhone
      }].slice(-100));
    }

    drawHUD(landmarks, drowsy, distracted, eyeClosureDuration, blinkRate, attentionScore, gazeStatus);
  };

  const drawHUD = (landmarks: any[], drowsy: boolean, distracted: boolean, closure: number, blinkRate: number, attention: number, gaze: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate Bounding Box
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const padding = 0.05;
    const rect = {
      x: (minX - padding) * canvas.width,
      y: (minY - padding) * canvas.height,
      w: (maxX - minX + padding * 2) * canvas.width,
      h: (maxY - minY + padding * 2) * canvas.height
    };

    const color = drowsy ? '#FF4B4B' : distracted ? '#FFD600' : '#00FF95';
    const glow = drowsy ? 'rgba(255, 75, 75, 0.5)' : distracted ? 'rgba(255, 214, 0, 0.5)' : 'rgba(0, 255, 149, 0.5)';

    // Draw Bounding Box with Pulse if Critical
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    if (drowsy || status.riskScore > 80) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.5;
    }
    
    // Corner brackets instead of full box for futuristic look
    const len = 40;
    ctx.beginPath();
    // Top Left
    ctx.moveTo(rect.x, rect.y + len); ctx.lineTo(rect.x, rect.y); ctx.lineTo(rect.x + len, rect.y);
    // Top Right
    ctx.moveTo(rect.x + rect.w - len, rect.y); ctx.lineTo(rect.x + rect.w, rect.y); ctx.lineTo(rect.x + rect.w, rect.y + len);
    // Bottom Right
    ctx.moveTo(rect.x + rect.w, rect.y + rect.h - len); ctx.lineTo(rect.x + rect.w, rect.y + rect.h); ctx.lineTo(rect.x + rect.w - len, rect.y + rect.h);
    // Bottom Left
    ctx.moveTo(rect.x + len, rect.y + rect.h); ctx.lineTo(rect.x, rect.y + rect.h); ctx.lineTo(rect.x, rect.y + rect.h - len);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Scanning Line
    const scanY = (Math.sin(Date.now() / 500) * 0.5 + 0.5) * rect.h + rect.y;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(rect.x, scanY);
    ctx.lineTo(rect.x + rect.w, scanY);
    ctx.stroke();
    
    // Scan text
    ctx.font = '700 8px monospace';
    ctx.fillStyle = color;
    ctx.fillText('SCANNING...', rect.x + 5, scanY - 5);
    ctx.globalAlpha = 1.0;

    // Landmarks (Dots)
    ctx.fillStyle = color;
    [33, 263, 1, 61, 291, 199].forEach(idx => {
       const p = landmarks[idx];
       ctx.beginPath();
       ctx.arc(p.x * canvas.width, p.y * canvas.height, 2, 0, Math.PI * 2);
       ctx.fill();
    });

    // Iris / Gaze Lines
    const leftIris = landmarks[468];
    const rightIris = landmarks[473];
    ctx.strokeStyle = '#00A3FF';
    ctx.lineWidth = 1;
    [leftIris, rightIris].forEach(iris => {
      ctx.beginPath();
      ctx.moveTo(iris.x * canvas.width, iris.y * canvas.height);
      const targetX = gaze === 'road' ? iris.x : gaze === 'distracted' ? iris.x - 0.1 : iris.x + 0.1;
      ctx.lineTo(targetX * canvas.width, (iris.y - 0.1) * canvas.height);
      ctx.stroke();
    });

    // Data Overlay
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = 'white';
    const textX = rect.x + rect.w + 10;
    const textY = rect.y + 10;
    ctx.fillText(`${drowsy ? 'DROWSY' : distracted ? 'DISTRACTED' : 'FOCUSED'}`, rect.x, rect.y - 10);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`ATTENTION: ${Math.round(attention)}%`, textX, textY);
    ctx.fillText(`EYE_CLOSURE: ${closure.toFixed(2)}s`, textX, textY + 15);
    ctx.fillText(`BLINK_RATE: ${blinkRate.toFixed(1)}/min`, textX, textY + 30);
    ctx.fillText(`GAZE: ${gaze.toUpperCase()}`, textX, textY + 45);
  };

  useEffect(() => {
    let engine: VisionEngine | null = null;
    if (isSystemOn && videoRef.current) {
      engine = new VisionEngine(videoRef.current, (results) => {
        if (results.multiFaceLandmarks?.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          processVisionData(calculateEAR(landmarks), calculateMAR(landmarks), estimateHeadPose(landmarks), landmarks);
        }
      });
      engineRef.current = engine;
      engine.start().catch(err => console.error("Engine start error:", err));
    }
    return () => { engine?.stop(); };
  }, [isSystemOn]);

  return (
    <DriverContext.Provider value={{
      status, alerts, analytics, timeline, isSystemOn, setIsSystemOn,
      isVoiceOn, setIsVoiceOn, isNightMode, setIsNightMode,
      sensitivity, setSensitivity, profile, setProfile,
      videoRef, canvasRef, localIntel, interventionActive, setInterventionActive,
      isEmergencyBraking, setIsEmergencyBraking, coDriverText, setCoDriverText,
      digitalTwin, simulationMode, setSimulationMode, cognitiveLoad,
      isPrivacyMode, setIsPrivacyMode, isSafeMode, setIsSafeMode,
      recoveryMode, setRecoveryMode, calmMode, setCalmMode, sessionStats, resetSession,
      isListening, startListening, sosActive, sendEmergencyAlert, setLanguage
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver must be used within DriverProvider');
  return context;
};
