import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { JWT_SECRET } from "./config";
import { renderRichEmailHtml, transporter } from "./mail";

export let wss: WebSocketServer;

const clients = new Map<number, WebSocket>();

export function setupWebSocket(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {
    let userId: number | null = null;

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "auth") {
          const decoded = jwt.verify(message.token, JWT_SECRET) as any;
          userId = decoded.id;
          if (userId) clients.set(userId, ws);
        }
      } catch (e) {}
    });

    ws.on("close", () => {
      if (userId) clients.delete(userId);
    });
  });

  return wss;
}

export const broadcastToUser = (userId: number, data: any) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

export const sendNotificationEmail = async (userId: number, type: string, content: string, link: string) => {
  try {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId);
    if (!user || !user.email) return;

    const html = renderRichEmailHtml({
      title: "【ReMEETs】新しいお知らせが届きました",
      subtitle: "大切なお知らせ",
      mainMessage: content,
      buttonText: "お知らせを確認する",
      buttonUrl: link.startsWith("http") ? link : `${process.env.APP_URL || 'http://localhost:3000'}${link}`,
      noteText: "※心当たりがない場合は破棄してください。"
    });

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ReMEETs事務局 <noreply@remeets.jp>',
          to: user.email,
          subject: '【ReMEETs】新しいお知らせが届きました',
          html
        })
      });
    }
  } catch (err) {
    console.error("Failed to send notification email:", err);
  }
};

export const createNotification = (userId: number, type: string, message: string, link: string = "") => {
  try {
    const stmt = db.prepare("INSERT INTO notifications (user_id, type, content, link) VALUES (?, ?, ?, ?)");
    const info = stmt.run(userId, type, message, link);
    
    broadcastToUser(userId, {
      type: "notification",
      data: {
        id: info.lastInsertRowid,
        user_id: userId,
        type,
        message,
        link,
        is_read: 0,
        created_at: new Date().toISOString()
      }
    });

    sendNotificationEmail(userId, type, message, link);
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};

