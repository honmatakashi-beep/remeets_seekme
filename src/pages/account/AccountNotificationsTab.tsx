import React from "react";
import { Link } from "react-router-dom";
import { Bell, Heart, Mail, ShieldAlert, Sparkles, CheckCircle2, Clock, Trash2, CheckSquare, RefreshCw } from "lucide-react";
import { getPostUrl } from "../../lib/utils";

export const AccountNotificationsTab = (props: any) => {
  const {
    accountNotifications = [],
    actionLogs = [],
    unreadNotifsCount = 0,
    notificationLoading,
    markingAllAsRead,
    handleMarkAllNotificationsAsRead,
    handleClearAllNotifications,
    handleSingleNotificationClick,
    handleDeleteSingleNotification,
    isAlertModalOpen,
    setIsAlertModalOpen,
    setEditingAlert,
    searchAlerts = [],
    isAlertsLoading,
    handleToggleAlertActive,
    handleDeleteAlert
  } = props;

  return (
<div className="space-y-10 animate-fade-in text-black font-sans">
                {/* 1. あなた宛て新着手紙のメール通知（プロファイル連動・ワンタップON/OFF） */}
                <div className="bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/60 p-6 md:p-8 rounded-3xl border-2 border-teal-300/80 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-200/70 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-100/90 px-2.5 py-0.5 rounded-full border border-teal-200">
                          Auto Match Alert
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          notifyAlertEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {notifyAlertEnabled ? '✓ メール通知 有効' : '✕ メール通知 停止中'}
                        </span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                        <Bell size={20} className={notifyAlertEnabled ? "text-teal-700 animate-pulse" : "text-slate-400"} />
                        <span>📬 あなた宛て新着手紙の入荷メール通知</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-xl">
                        あなたのお名前（本名・旧姓・愛称）宛てに新しい想い出のボトルメールが海に流された瞬間、ご登録のメールアドレスへ即座にお知らせします。
                      </p>
                    </div>

                    {/* ワンタップON/OFFスイッチ */}
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-teal-200/80 shadow-xs shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold block text-slate-800">
                          {notifyAlertEnabled ? '自動通知 ON' : '自動通知 OFF'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {notifyAlertEnabled ? '手紙をリアルタイム検知' : '通知を一時停止中'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleNotifyAlert}
                        disabled={isUpdatingNotifyAlert}
                        className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer shadow-inner ${
                          notifyAlertEnabled ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                        title={notifyAlertEnabled ? '通知を停止する' : '通知を有効にする'}
                      >
                        <div
                          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                            notifyAlertEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        >
                          {notifyAlertEnabled ? (
                            <CheckCircle2 size={13} className="text-teal-600" />
                          ) : (
                            <X size={13} className="text-slate-400" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 自動照合されるプロファイル連動情報 */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-teal-700" />
                      <span>自動照合されるあなたのアカウント情報（他人の名前による監視を100%防止）</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-sans">
                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-bold block">👤 登録本名（姓名）</span>
                        <span className="text-xs font-extrabold text-slate-900 block truncate">
                          {user?.fullName || user?.username || '未設定'}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-bold block">🌸 旧姓（同窓生照合用）</span>
                        <span className="text-xs font-extrabold text-rose-700 block truncate">
                          {(user as any)?.maiden_name || (user as any)?.maidenName ? `旧姓: ${(user as any)?.maiden_name || (user as any)?.maidenName}` : '未登録（任意）'}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-bold block">✨ 愛称・ニックネーム</span>
                        <span className="text-xs font-extrabold text-indigo-700 block truncate">
                          {user?.nickname ? `@${user.nickname}` : '未登録（任意）'}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
                        <span className="text-[10px] text-slate-400 font-bold block">📧 通知先メール</span>
                        <span className="text-xs font-bold text-teal-800 block truncate">
                          {user?.email || '未設定'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>※ 本名・旧姓・ニックネームは「基本情報」タブからいつでも最新の内容に変更いただけます。</span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('profile')}
                        className="text-teal-700 hover:text-teal-900 font-bold cursor-pointer hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>基本情報を編集する</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. 事務局・システムからの受信通知ログ */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border pb-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-serif font-bold text-brand-dark tracking-widest flex items-center gap-2">
                        <Bell size={20} className="text-rose-600" />
                        <span>🔔 事務局・システムからの受信通知ログ</span>
                        {notifications.filter(n => !n.is_read).length > 0 && (
                          <span className="text-xs bg-rose-500/10 text-rose-700 px-2.5 py-0.5 rounded-full font-bold font-sans">
                            未読 {notifications.filter(n => !n.is_read).length}件
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-brand-dark/50 font-sans">
                        事務局公式の一括配信アナウンス、ボトルメッセージへの回答試行・クイズ正解、想い出照合・連絡先開示通知などが時系列で一元整理されています。
                      </p>
                    </div>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl transition-all font-bold cursor-pointer font-sans flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                      >
                        <CheckSquare size={13} />
                        <span>すべて既読にする</span>
                      </button>
                    )}
                  </div>

                {notificationsLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-3">
                    <BottleLoader />
                    <p className="text-xs text-brand-dark/40 font-sans animate-pulse">通知情報を同期しています...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-brand-border rounded-3xl p-6 bg-white/50 space-y-3">
                    <div className="w-16 h-16 bg-rose-50/50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                      <Bell size={24} className="text-rose-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-serif text-brand-dark/50">現在、通知されたログやメッセージ配信はありません。</p>
                    <p className="text-[11px] text-brand-dark/40 font-sans leading-relaxed max-w-md mx-auto">
                      大切なお便りのクイズ正解通知や、運営事務局からの重要な全体/個別連絡、想い出照合・連絡先開示通知は、ここに綺麗にタイムライン整理されます。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-4xl">
                    {notifications.map((n: any) => {
                      let IconComponent = Bell;
                      let badgeText = "お知らせ";
                      let colorClasses = "bg-rose-50 text-rose-700 border-rose-200/50";
                      let actionText = "詳細を見る";

                      if (n.type === "reunion_reveal" || n.type === "contact_opened" || n.type === "message") {
                        IconComponent = MessageCircle;
                        badgeText = "想い出照合・開通";
                        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200/40";
                        actionText = "お手紙・連絡先を確認";
                      } else if (n.type === "reunion" || n.type === "reunion_success" || n.type === "match") {
                        IconComponent = Key;
                        badgeText = "思い出再会";
                        colorClasses = "bg-amber-50 text-amber-800 border-amber-200/40";
                        actionText = "手紙を確認する";
                      } else if (n.type === "admin_broadcast" || n.type === "system" || n.type === "broadcast") {
                        IconComponent = Sparkles;
                        badgeText = "公式アナウンス";
                        colorClasses = "bg-indigo-50 text-indigo-800 border-indigo-200/40";
                        actionText = "お知らせを開く";
                      }

                      return (
                        <div
                          key={n.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                            !n.is_read ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-zinc-100'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <IconComponent size={18} className="mt-0.5 text-zinc-600 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClasses}`}>
                                  {badgeText}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {formatNotificationDate(n.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-800 font-medium mt-1">{n.content}</p>
                            </div>
                          </div>
                          {n.link && (
                            <button
                              onClick={async () => {
                                if (!n.is_read) await handleMarkAsRead(n.id);
                                navigate(n.link);
                              }}
                              className="px-3 py-1 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 shrink-0"
                            >
                              {actionText}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
  );
};
