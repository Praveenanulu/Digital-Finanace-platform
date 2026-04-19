import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export class VisionEngine {
  private faceMesh: FaceMesh;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement;
  private onResults: (results: Results) => void;
  private isClosed: boolean = false;

  constructor(videoElement: HTMLVideoElement, onResults: (results: Results) => void) {
    this.videoElement = videoElement;
    this.onResults = (results: Results) => {
      if (!this.isClosed) {
        onResults(results);
      }
    };

    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceMesh.onResults(this.onResults);
  }

  async start() {
    this.isClosed = false;
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.isClosed) return;
        try {
          // Double check before sending to avoid WASM deletion errors
          if (!this.isClosed && this.faceMesh) {
            await this.faceMesh.send({ image: this.videoElement });
          }
        } catch (e) {
          if (!this.isClosed) {
            console.error("VisionEngine frame error:", e);
          }
        }
      },
      width: 640,
      height: 480,
    });
    await this.camera.start();
  }

  async stop() {
    if (this.isClosed) return;
    this.isClosed = true;
    
    try {
      if (this.camera) {
        await this.camera.stop();
        this.camera = null;
      }
      // Give a tiny grace period for any pending send calls to finish
      await new Promise(resolve => setTimeout(resolve, 50));
      await this.faceMesh.close();
    } catch (e) {
      console.warn("VisionEngine cleanup warning:", e);
    }
  }
}

/**
 * Calculates Eye Aspect Ratio (EAR)
 * Indices: Left Eye [362, 385, 387, 263, 373, 380], Right Eye [33, 160, 158, 133, 153, 144]
 */
export function calculateEAR(landmarks: any[]) {
  const distance = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  
  // Left eye
  const l1 = distance(landmarks[385], landmarks[380]);
  const l2 = distance(landmarks[387], landmarks[373]);
  const l3 = distance(landmarks[362], landmarks[263]);
  const leftEAR = (l1 + l2) / (2 * l3);

  // Right eye
  const r1 = distance(landmarks[160], landmarks[144]);
  const r2 = distance(landmarks[158], landmarks[153]);
  const r3 = distance(landmarks[33], landmarks[133]);
  const rightEAR = (r1 + r2) / (2 * r3);

  return (leftEAR + rightEAR) / 2;
}

/**
 * Calculates Mouth Aspect Ratio (MAR)
 */
export function calculateMAR(landmarks: any[]) {
  const distance = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  const m1 = distance(landmarks[13], landmarks[14]);
  const m2 = distance(landmarks[78], landmarks[308]);
  return m1 / m2;
}

/**
 * Estimates Head Pose (Pitch, Yaw, Roll)
 */
export function estimateHeadPose(landmarks: any[]) {
  const nose = landmarks[1];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  
  const eyeMidX = (leftEye.x + rightEye.x) / 2;
  const yaw = (nose.x - eyeMidX) * 100;
  
  const eyeMidY = (leftEye.y + rightEye.y) / 2;
  const faceHeight = Math.abs(chin.y - eyeMidY);
  const pitch = (nose.y - eyeMidY) / faceHeight * 100;

  // Roll (Tilt)
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const roll = Math.atan2(dy, dx) * (180 / Math.PI);
  
  return { pitch, yaw, roll };
}

/**
 * Analyzes Gaze Direction based on Iris Position
 */
export function analyzeGaze(landmarks: any[]) {
  // Iris landmarks (FaceMesh refineLandmarks: true)
  // Left Iris: 468, 469, 470, 471, 472 (center, right, top, left, bottom)
  // Right Iris: 473, 474, 475, 476, 477 (center, right, top, left, bottom)
  const leftIrisCenter = landmarks[468];
  const rightIrisCenter = landmarks[473];
  
  if (!leftIrisCenter || !rightIrisCenter) return 'road';

  const leftEyeCenter = { x: (landmarks[362].x + landmarks[263].x) / 2, y: (landmarks[386].y + landmarks[374].y) / 2 };
  const rightEyeCenter = { x: (landmarks[33].x + landmarks[133].x) / 2, y: (landmarks[159].y + landmarks[145].y) / 2 };

  const leftOffset = { x: leftIrisCenter.x - leftEyeCenter.x, y: leftIrisCenter.y - leftEyeCenter.y };
  const rightOffset = { x: rightIrisCenter.x - rightEyeCenter.x, y: rightIrisCenter.y - rightEyeCenter.y };

  const avgOffsetX = (leftOffset.x + rightOffset.x) / 2;
  const avgOffsetY = (leftOffset.y + rightOffset.y) / 2;

  if (Math.abs(avgOffsetX) > 0.008) return 'distracted';
  if (avgOffsetY > 0.005) return 'phone'; // Looking down
  return 'road';
}

/**
 * Samples light level from the video element
 */
export function sampleLighting(video: HTMLVideoElement) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'normal';
    ctx.drawImage(video, 0, 0, 10, 10);
    const data = ctx.getImageData(0, 0, 10, 10).data;
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i+1] + data[i+2]) / 3;
    }
    brightness /= (10 * 10);
    return brightness < 50 ? 'low' : 'normal';
  } catch (e) {
    return 'normal';
  }
}
