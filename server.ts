import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initDatabase, seedData } from "./server/db";
import { PORT, isProd } from "./server/config";
import { logAccessMiddleware } from "./server/middleware/auth";
import { setupWebSocket } from "./server/websocket";
import { authRouter } from "./server/routes/auth";
import { postsRouter } from "./server/routes/posts";
import { adminRouter } from "./server/routes/admin";
import { miscRouter } from "./server/routes/misc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛡️ [Auto-Recovery Guard] サーバーのプロセス即死を防ぐ堅牢化ガード
process.on('uncaughtException', (err: any) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`🚨 [Server Warning] ポート ${err.port || PORT} が使用中です。`);
  } else {
    console.error('🛡️ [Auto-Recovery Guard] Uncaught Exception を検知・安全に吸収しました:', err?.message || err);
  }
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('🛡️ [Auto-Recovery Guard] Unhandled Rejection を安全に吸収しました:', reason);
});

async function startServer() {
  console.log("Starting modular server...");

  // Initialize SQLite database
  initDatabase();

  const app = express();
  const server = createServer(app);

  // Setup WebSocket server
  setupWebSocket(server);

  // Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Security Headers (🛡️ SEC-022: クリックジャッキング & MIMEスニッフィング防御)
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Access Logging Middleware
  app.use(logAccessMiddleware);

  // Seed default data if needed
  try {
    await seedData(false);
  } catch (seedErr) {
    console.error("Initial data seed error:", seedErr);
  }

  // Mount API Routers
  app.use("/api/auth", authRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api", miscRouter);

  // Vite Integration / Static Assets Delivery
  if (!isProd) {
    console.log("Initializing Vite dev server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, () => {
    console.log(`🕊️ ReMEETs Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
