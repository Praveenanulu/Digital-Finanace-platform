
export type Language = 'en' | 'hi' | 'mr';

export interface DriverStatus {
  isDrowsy: boolean;
  isDistracted: boolean;
  isYawning: boolean;
  isMicrosleeping: boolean;
  isUsingPhone: boolean;
  isWearingSeatbelt: boolean;
  blinkCount: number;
  blinkRate: number;
  eyeClosureDuration: number;
  attentionScore: number;
  riskScore: number;
  predictedRisk: number;
  predictedTrend: 'stable' | 'rising' | 'falling';
  coachAdvice: string;
  learningInsights: string[];
  headPose: { pitch: number; yaw: number; roll: number };
  gaze: 'road' | 'distracted' | 'phone';
  emotion: string;
  driverIdentity: string | null;
  posture: 'good' | 'slouched' | 'tilted';
  xaiReasoning: string[]; // Reasons for the current risk score
  healthMetrics: {
    heartRate: number;
    stressLevel: number;
  };
  lightingLevel: 'normal' | 'low';
  language: Language;
}

export interface EducationCategory {
  id: string;
  title: string;
  description: string;
  tips: { text: string; voice: { [key in Language]: string } }[];
  icon: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'fatigue' | 'distraction' | 'phone' | 'microsleep' | 'safe';
  intensity: 'low' | 'medium' | 'high';
  message: string;
}

export interface AnalyticsData {
  timestamp: number;
  riskScore: number;
  ear: number;
  mar: number;
  emotion: string;
  isUsingPhone: boolean;
}

export type AlertType = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  timestamp: number;
  type: AlertType;
  message: string;
  category: 'fatigue' | 'distraction' | 'safety' | 'system';
  reason?: string;
}

export interface VisionMetrics {
  ear: number;
  mar: number;
  pitch: number;
  yaw: number;
  roll: number;
}
