import jwt from "jsonwebtoken";
import { db } from "../db";
import { JWT_SECRET, ADMIN_ROLES as CONFIG_ADMIN_ROLES, ROLE_PERMISSIONS as CONFIG_ROLE_PERMISSIONS } from "../config";

export const sanitizeLogText = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "****-****-****-****")
    .replace(/(password|passwd|secret|token)[:=]\s*[^\s,]+/gi, "$1=******");
};



export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });

    try {
      const liveUser = db.prepare("SELECT id, username, email, role, is_blocked, is_ekyc_verified FROM users WHERE id = ?").get(decoded.id) as any;
      if (!liveUser) {
        return res.status(401).json({ error: "ユーザーアカウントが存在しないか、既に退会済みです。" });
      }
      if (liveUser.is_blocked) {
        return res.status(403).json({ error: "このアカウントは管理者により利用停止（凍結）されています。" });
      }
      req.user = { ...decoded, ...liveUser };
    } catch (dbErr) {
      req.user = decoded;
    }
    next();
  });
};



export const optionalAuthenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (!err && decoded?.id) {
        try {
          const liveUser = db.prepare("SELECT id, username, email, role, is_blocked, is_ekyc_verified FROM users WHERE id = ?").get(decoded.id) as any;
          if (liveUser && !liveUser.is_blocked) {
            req.user = { ...decoded, ...liveUser };
          }
        } catch (dbErr) {
          req.user = decoded;
        }
      }
      next();
    });
  } else {
    next();
  }
};

// --- Notification Helpers ---
// Moved inside startServer to access broadcastToUser

// 🛡️ 管理者マルチロール・権限（RBAC）定義
export const ADMIN_ROLES = ['admin', 'super_admin', 'moderator', 'cs_support', 'auditor'];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'manage_settings',
    'manage_admins',
    'manage_payments',
    'moderate_content',
    'manage_contacts',
    'view_police_logs',
    'view_analytics',
    'manage_users',
    'danger_zone'
  ],
  admin: [
    'manage_settings',
    'manage_admins',
    'manage_payments',
    'moderate_content',
    'manage_contacts',
    'view_police_logs',
    'view_analytics',
    'manage_users',
    'danger_zone'
  ],
  moderator: [
    'moderate_content',
    'view_analytics',
    'manage_users'
  ],
  cs_support: [
    'manage_contacts',
    'view_analytics',
    'age_verification',
    'manage_users'
  ],
  auditor: [
    'view_police_logs',
    'view_analytics',
    'view_audit_logs',
    'view_payments'
  ]
};



export const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && ADMIN_ROLES.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: "管理者権限（Admin Role）が必要です。" });
  }
};



export const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
      return res.status(403).json({ error: "管理者権限が必要です。" });
    }
    const permissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ 
        error: `権限エラー: 現在の役職 [${req.user.role}] にはこの操作 [${permission}] を実行する権限が付与されていません。`,
        requiredPermission: permission,
        currentRole: req.user.role
      });
    }
  };
};



export const logAccessMiddleware = (req: any, res: any, next: any) => {
  // Check if IP is blocked
  try {
    const blocked = db.prepare("SELECT * FROM blocked_ips WHERE ip = ?").get(req.ip);
    if (blocked) {
      return res.status(403).json({ error: "Access denied. Your IP has been blocked by administrator.", reason: blocked.reason });
    }
  } catch (err) {
    console.error("IP check error:", err);
  }

  // We use optional auth here to try and get user info if available
  optionalAuthenticateToken(req, res, () => {
    res.on('finish', () => {
      // 静的ファイルやViteアセット、画像等の内部リクエストはスキップしてDB負荷を軽減
      if (
        req.path.startsWith('/@') || 
        req.path.startsWith('/src/') || 
        req.path.startsWith('/node_modules/') || 
        req.path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|map|woff2?|json)$/i)
      ) {
        return;
      }
      try {
        const stmt = db.prepare("INSERT INTO access_logs (user_id, path, method, status_code, ip, user_agent, referer) VALUES (?, ?, ?, ?, ?, ?, ?)");
        stmt.run(req.user?.id || null, req.path, req.method, res.statusCode, req.ip || null, req.headers['user-agent'] || null, req.headers['referer'] || null);
      } catch (err) {
        console.error("Logging error:", err);
      }
    });
    next();
  });
};



export const logAction = (userId: number | null, action: string, details: string = "", ip: string | null = null) => {
  try {
    const sanitized = sanitizeLogText(details);
    db.prepare("INSERT INTO action_logs (user_id, action, details, ip) VALUES (?, ?, ?, ?)").run(userId, action, sanitized, ip);
  } catch (err) {
    console.error("Failed to log action:", err);
  }
};


