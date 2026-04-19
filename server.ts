import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory state storage (simulating a DB)
  let latestStatus = {
    state: "Focused",
    riskScore: 0,
    timestamp: Date.now()
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  /**
   * Endpoint to receive driver status from frontend
   */
  app.post("/api/status", (req, res) => {
    const { state, riskScore } = req.body;
    latestStatus = {
      state: state || "Unknown",
      riskScore: riskScore || 0,
      timestamp: Date.now()
    };
    res.json({ success: true });
  });

  /**
   * Endpoint to fetch current driver status
   */
  app.get("/api/status", (req, res) => {
    res.json(latestStatus);
  });

  /**
   * Mock endpoint for video feed (MJPEG simulation if requested)
   * Realistically, we use WebRTC or simple canvas updates in a web context.
   */
  app.get("/api/video_feed", (req, res) => {
    res.status(200).send("Video feed streaming is maintained via direct client-to-video-mesh link for low latency.");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DriveSentinel-X Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
