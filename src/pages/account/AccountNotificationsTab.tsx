import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, Heart, Mail, ShieldAlert, Sparkles, CheckCircle2, Clock, Trash2, 
  CheckSquare, RefreshCw, X, ShieldCheck, ArrowRight, MessageCircle, Key,
  Search, Send
} from "lucide-react";
import { getPostUrl } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { BottleLoader } from "../../components/SharedComponents";

export const AccountNotificationsTab = (props: any) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifyAlertEnabled, setNotifyAlertEnabled] = useState<boolean>(true);
  const [isUpdatingNotifyAlert, setIsUpdatingNotifyAlert] = useState<boolean>(false);

  const {
    accountNotifications = [],
    actionLogs = [],
    unreadNotifsCount = 0,
    notificationLoading = false,
    markingAllAsRead = false,
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
    handleDeleteAlert,
    handleTabChange = (tab: string) => navigate(`/account?tab=${tab}`)
  } = props;

  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

  const notifications = accountNotifications;
  const notificationsLoading = notificationLoading;
  const handleMarkAllAsRead = handleMarkAllNotificationsAsRead;
  const handleMarkAsRead = handleSingleNotificationClick || (() => {});
  const handleDelete = handleDeleteSingleNotification || (() => {});

  const handleToggleNotifyAlert = () => {
    setIsUpdatingNotifyAlert(true);
    setTimeout(() => {
      setNotifyAlertEnabled(prev => !prev);
      setIsUpdatingNotifyAlert(false);
    }, 300);
  };

  const formatNotificationDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const handleNotificationClick = async (n: any) => {
    setSelectedNotification(n);
    if (!n.is_read) {
      await handleMarkAsRead(n.id);
    }
  };

  // 通知タイプに応じた表示設定（バッジ、アイコン、アクション文言、スタイル）
  const getNotificationConfig = (type: string) => {
    switch (type) {
      case "reunion_request":
        return {
          icon: Mail,
          badgeText: "💌 再会希望の受信",
          colorClasses: "bg-teal-100 text-teal-900 border-teal-300",
          actionText: "エピソードを確認・承認する",
          defaultLink: "/account?tab=received"
        };
      case "reunion_approved":
        return {
          icon: Sparkles,
          badgeText: "🎉 再会希望が承認されました",
          colorClasses: "bg-emerald-100 text-emerald-900 border-emerald-300",
          actionText: "本人確認・決済へ進む",
          defaultLink: "/account?tab=sent"
        };
      case "reunion_rejected":
        return {
          icon: Clock,
          badgeText: "🕊️ 申請見送り",
          colorClasses: "bg-slate-100 text-slate-700 border-slate-300",
          actionText: "申請状況を確認",
          defaultLink: "/account?tab=sent"
        };
      case "reunion_completed":
      case "reunion_reveal":
      case "contact_opened":
        return {
          icon: CheckCircle2,
          badgeText: "🎊 連絡先開示完了",
          colorClasses: "bg-amber-100 text-amber-900 border-amber-300",
          actionText: "開示された連絡先を見る",
          defaultLink: "/account?tab=sent"
        };
      case "match":
      case "auto_match":
        return {
          icon: Search,
          badgeText: "🔍 あなた宛てメッセージ検知",
          colorClasses: "bg-sky-100 text-sky-900 border-sky-300",
          actionText: "メッセージを見に行く",
          defaultLink: "/search"
        };
      case "admin_broadcast":
      case "broadcast":
      case "system":
      default:
        return {
          icon: Bell,
          badgeText: "📢 事務局からのお知らせ",
          colorClasses: "bg-indigo-100 text-indigo-900 border-indigo-300",
          actionText: "詳細を開く",
          defaultLink: null
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-black font-sans">
      {/* 1. あなた宛て新着メッセージのメール通知（プロファイル連動・ワンタップON/OFF） */}
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
              <span>📬 あなた宛て新着メッセージの入荷メール通知</span>
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-xl">
              あなたのお名前（本名・旧姓・愛称）宛てに新しいメッセージが公開された瞬間、ご登録のメールアドレスへ即座にお知らせします。
            </p>
          </div>

          {/* ワンタップON/OFFスイッチ */}
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-teal-200/80 shadow-xs shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold block text-slate-800">
                {notifyAlertEnabled ? '自動通知 ON' : '自動通知 OFF'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {notifyAlertEnabled ? 'メッセージをリアルタイム検知' : '通知を一時停止中'}
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
            <span>※ 本名・旧姓・ニックネームは「マイアカウント」上部の編集ボタンからいつでも変更いただけます。</span>
            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className="text-teal-700 hover:text-teal-900 font-bold cursor-pointer hover:underline flex items-center gap-1 shrink-0"
            >
              <span>公的本人確認を確認する</span>
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 事務局・システムからの受信通知ログ */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <Bell size={20} className="text-teal-700" />
              <span>🔔 通知ログ・履歴一覧</span>
              {notifications.filter((n: any) => !n.is_read).length > 0 && (
                <span className="text-xs bg-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold font-sans shadow-2xs">
                  未読 {notifications.filter((n: any) => !n.is_read).length}件
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              再会希望の届き、承認状況、連絡先開示、および事務局からの重要なお知らせがここに届きます。
            </p>
          </div>
          {notifications.filter((n: any) => !n.is_read).length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl transition-all font-bold cursor-pointer font-sans flex items-center gap-1.5 shadow-2xs active:scale-95 shrink-0"
            >
              <CheckSquare size={13} />
              <span>すべて既読にする</span>
            </button>
          )}
        </div>

        {notificationsLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <BottleLoader />
            <p className="text-xs text-slate-400 font-sans animate-pulse">通知情報を同期しています...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl p-6 bg-white/50 space-y-3">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto border border-teal-100 text-teal-600">
              <Bell size={24} className="animate-pulse" />
            </div>
            <p className="text-xs font-serif font-bold text-slate-700">現在、届いている通知はありません</p>
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed max-w-md mx-auto">
              お相手からの再会希望エピソードの受信、承認・連絡先開示の進捗、あなた宛てメッセージの自動検知通知が届くと、ここにリアルタイムで表示されます。
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {notifications.map((n: any) => {
              const config = getNotificationConfig(n.type);
              const IconComponent = config.icon;
              const targetLink = n.link || config.defaultLink;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer hover:shadow-md hover:scale-[1.003] group ${
                    !n.is_read
                      ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-200/80'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        !n.is_read ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                      {!n.is_read && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${config.colorClasses}`}>
                          {config.badgeText}
                        </span>
                        {!n.is_read && (
                          <span className="text-[9px] font-extrabold bg-rose-600 text-white px-1.5 py-0.2 rounded-md">
                            NEW
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatNotificationDate(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed group-hover:text-slate-950 font-sans">
                        {n.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {targetLink ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(n);
                          navigate(targetLink);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <span>{config.actionText}</span>
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(n);
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>詳細を見る</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('この通知を削除してもよろしいですか？')) {
                          await handleDelete(n.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="通知を削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📖 お知らせ・通知詳細ポップアップモーダル */}
      {selectedNotification && (() => {
        const config = getNotificationConfig(selectedNotification.type);
        const IconComponent = config.icon;
        const targetLink = selectedNotification.link || config.defaultLink;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans"
            onClick={() => setSelectedNotification(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden space-y-5 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                  <IconComponent size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${config.colorClasses}`}>
                      {config.badgeText}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatNotificationDate(selectedNotification.created_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 font-serif mt-0.5">
                    通知の詳細内容
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  MESSAGE
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedNotification.content}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('この通知を削除してもよろしいですか？')) {
                      const id = selectedNotification.id;
                      setSelectedNotification(null);
                      await handleDelete(id);
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>通知を削除</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    閉じる
                  </button>
                  {targetLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNotification(null);
                        navigate(targetLink);
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-teal-700 to-indigo-700 hover:from-teal-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>{config.actionText}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AccountNotificationsTab;
