import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import { db, setDb, seedData, generateAdditionalSamplePosts, reseedCleanUniquePosts, getPasswordPolicy, validatePasswordAgainstPolicy } from "../../db";
import { JWT_SECRET, ADMIN_ROLES, ROLE_PERMISSIONS } from "../../config";
import { authenticateToken, optionalAuthenticateToken, isAdmin, requirePermission, logAction, sanitizeLogText } from "../../middleware/auth";
import { filterNGWords, detectInappropriateWords, evaluateContentSafety } from "../../moderation";
import { broadcastToUser, sendNotificationEmail } from "../../websocket";
import { sendPasswordResetEmail } from "../../mail";

export {
  express,
  Database,
  bcrypt,
  jwt,
  crypto,
  fs,
  path,
  execSync,
  GoogleGenAI,
  db,
  setDb,
  seedData,
  generateAdditionalSamplePosts,
  reseedCleanUniquePosts,
  getPasswordPolicy,
  validatePasswordAgainstPolicy,
  JWT_SECRET,
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  authenticateToken,
  optionalAuthenticateToken,
  isAdmin,
  requirePermission,
  logAction,
  sanitizeLogText,
  filterNGWords,
  detectInappropriateWords,
  evaluateContentSafety,
  broadcastToUser,
  sendNotificationEmail,
  sendPasswordResetEmail,
};

// 🌟 既存DBユーザーIDの完全UID化マイグレーション即時実行
export function executeUidMigration() {
  try {
    if (!db) return;
    const users = db.prepare("SELECT id, username, email, full_name, nickname FROM users WHERE username != 'admin' AND email != 'sim_spammer_bot@test.local' AND username != 'sim_spammer_bot'").all() as any[];
    const updateStmt = db.prepare("UPDATE users SET username = ? WHERE id = ?");

    const usedUids = new Set<string>();
    users.forEach(u => {
      if (u.username && /^UID-\d{6}$/.test(u.username)) {
        usedUids.add(u.username);
      }
    });

    let updatedCount = 0;
    for (const u of users) {
      if (!u.username || !/^UID-\d{6}$/.test(u.username)) {
        let newUid = '';
        while (true) {
          const num = Math.floor(100000 + Math.random() * 900000);
          newUid = `UID-${num}`;
          if (!usedUids.has(newUid)) {
            usedUids.add(newUid);
            break;
          }
        }
        updateStmt.run(newUid, u.id);
        console.log(`[Instant UID Migration] User #${u.id} (${u.email || u.nickname}): "${u.username}" -> "${newUid}"`);
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`[Instant UID Migration] Successfully migrated ${updatedCount} users to UID-xxxxxx format!`);
    }
  } catch (err) {
    console.error("[Instant UID Migration] Error migrating users:", err);
  }
}

// モジュール読み込み時に即時実行
try {
  executeUidMigration();
} catch (e) {}

// 📝 モデレーション処置履歴記録用共通関数
export const recordModerationHistory = (data: {
  postId?: number | string;
  actionType: string;
  actionLabel: string;
  targetName?: string;
  searcherName?: string;
  authorUserId?: number;
  authorUsername?: string;
  message?: string;
  aiReason?: string;
  adminId?: number;
  adminUsername?: string;
  details?: string;
}) => {
  try {
    db.prepare(`
      INSERT INTO moderation_history (
        post_id, action_type, action_label, target_name, searcher_name,
        author_user_id, author_username, message, ai_reason, admin_id, admin_username, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      data.postId ? Number(data.postId) : null,
      data.actionType,
      data.actionLabel,
      data.targetName || null,
      data.searcherName || null,
      data.authorUserId || null,
      data.authorUsername || null,
      data.message || null,
      data.aiReason || null,
      data.adminId || null,
      data.adminUsername || 'Admin',
      data.details || null
    );
  } catch (err) {
    console.error("Failed to record moderation history:", err);
  }
};
