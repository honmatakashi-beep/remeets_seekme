import React, { useState, useEffect } from "react";
import { Edit3, Lock, CheckCircle2, RotateCcw, MapPin } from "lucide-react";
import { PREFECTURES } from "../../lib/utils";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  token: string | null;
  updateUser: (updatedData: any) => void;
  getAgeFromBirthdate: (birthdate?: string) => number | null;
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  token,
  updateUser,
  getAgeFromBirthdate,
  onSuccess
}) => {
  const [editingHometown, setEditingHometown] = useState((user as any)?.hometown || "");
  const [editingMaidenName, setEditingMaidenName] = useState((user as any)?.maiden_name || "");
  const [editingMaidenNameKana, setEditingMaidenNameKana] = useState((user as any)?.maiden_name_kana || "");
  const [editingGender, setEditingGender] = useState<string>((user as any)?.gender || "");
  const [editingEmailNotifications, setEditingEmailNotifications] = useState<boolean>(true);
  const [editingContactType, setEditingContactType] = useState<string>(() => localStorage.getItem("remeets_default_contact_type") || "LINE");
  const [editingContactId, setEditingContactId] = useState<string>(() => localStorage.getItem("remeets_default_contact_id") || (user as any)?.contact_id || "");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditingHometown((user as any)?.hometown || "");
      setEditingMaidenName((user as any)?.maiden_name || "");
      setEditingMaidenNameKana((user as any)?.maiden_name_kana || "");
      setEditingGender((user as any)?.gender || "");
      setEditingContactId((user as any)?.contact_id || localStorage.getItem("remeets_default_contact_id") || "");
      setEditingContactType(localStorage.getItem("remeets_default_contact_type") || (user as any)?.contact_type || "LINE");
    }
  }, [user, isOpen]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess(false);

    try {
      localStorage.setItem("remeets_default_contact_type", editingContactType);
      localStorage.setItem("remeets_default_contact_id", editingContactId);

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          hometown: editingHometown,
          maiden_name: editingMaidenName,
          maiden_name_kana: editingMaidenNameKana,
          gender: editingGender,
          contact_type: editingContactType,
          contact_id: editingContactId,
          email_notifications: editingEmailNotifications
        })
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user || {
          ...user,
          hometown: editingHometown,
          maiden_name: editingMaidenName,
          maiden_name_kana: editingMaidenNameKana,
          gender: editingGender,
          contact_type: editingContactType,
          contact_id: editingContactId
        });
        setUpdateSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setUpdateSuccess(false);
          onClose();
        }, 1200);
      } else {
        const err = await res.json();
        setUpdateError(err.error || "プロフィールの更新に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      setUpdateError("通信エラーが発生しました。");
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      data-modal-overlay
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain p-6 md:p-8 shadow-2xl border border-slate-200 relative my-auto space-y-6 font-sans text-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-slate-900">
                登録内容・SNS IDの変更
              </h3>
              <p className="text-xs text-slate-500">
                アカウントの表示情報や開示用SNS IDを設定・変更できます。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {updateError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
            {updateError}
          </div>
        )}

        {updateSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>プロフィールおよびSNS ID設定を正常に更新・保存しました！</span>
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="bg-slate-50/90 rounded-2xl p-4 md:p-5 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" />
                <span>🔒 変更できない項目（セキュア保護）</span>
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded font-mono">
                システム固定情報
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  お名前（公的氏名）
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.fullName || "名前未設定"}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                  />
                  <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ※本人確認書類およびStripe決済名義と一致させるため変更不可
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  ユーザーID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.username || ""}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-800/80 cursor-not-allowed select-none"
                  />
                  <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ※システム自動付番のため変更不可
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  生年月日（満年齢）
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      user?.birthdate
                        ? `${user.birthdate.replace(/-/g, "/")} (満${getAgeFromBirthdate(user.birthdate)}歳)`
                        : "18歳以上確認済（生年月日未登録）"
                    }
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed select-none"
                  />
                  <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ※18歳以上利用規約および本人認証データのため変更不可
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  アカウント権限
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.role === "super_admin" ? "管理者アカウント" : "一般メンバー"}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                  />
                  <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  メールアドレス
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.email || "メール未設定"}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-700 cursor-not-allowed select-none"
                  />
                  <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ※SNS連携・セキュリティ保護のため変更不可
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  本人確認（eKYC）ステータス
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      (user?.is_ekyc_verified || localStorage.getItem("ekyc_verified") === "true")
                        ? "🛡️ 公的本人確認完了済み"
                        : "📝 自己誓約のみ（未申請）"
                    }
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed select-none"
                  />
                  <Lock size={13} className="absolute right-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Edit3 size={13} className="text-indigo-600" />
              <span>✏️ 変更できる項目</span>
            </span>

            {/* ゆかりの地（出身地・都道府県） */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-teal-600" />
                  <span>ゆかりの地（出身地・都道府県）</span>
                </span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  メッセージ作成時にも自動連動
                </span>
              </label>
              <select
                value={editingHometown}
                onChange={(e) => setEditingHometown(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 transition-all cursor-pointer"
              >
                <option value="">都道府県を選択してください</option>
                {PREFECTURES.map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                ※あなたの出身地や学生時代を過ごしたゆかりの地を設定できます。
              </p>
            </div>

            {/* 旧姓・当時の苗字 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>旧姓・当時の苗字（漢字）</span>
                  <span className="text-[10px] text-slate-400 font-normal">任意</span>
                </label>
                <input
                  type="text"
                  value={editingMaidenName}
                  onChange={(e) => setEditingMaidenName(e.target.value)}
                  placeholder="例: 鈴木（旧姓がある場合のみ）"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>旧姓フリガナ（カタカナ）</span>
                  <span className="text-[10px] text-slate-400 font-normal">任意</span>
                </label>
                <input
                  type="text"
                  value={editingMaidenNameKana}
                  onChange={(e) => setEditingMaidenNameKana(e.target.value)}
                  placeholder="例: スズキ"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>性別</span>
                <span className="text-[10px] text-slate-400 font-normal">任意</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "男性", label: "👨 男性", activeClass: "bg-blue-50 border-blue-500 text-blue-900 shadow-xs" },
                  { id: "女性", label: "👩 女性", activeClass: "bg-pink-50 border-pink-500 text-pink-900 shadow-xs" },
                  { id: "その他・回答しない", label: "👤 その他 / 未回答", activeClass: "bg-slate-100 border-slate-500 text-slate-900 shadow-xs" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEditingGender(opt.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer text-center ${
                      editingGender === opt.id
                        ? opt.activeClass
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ※サービス改善や統計分析のために利用されます（相手に強制開示されることはありません）。
              </p>
            </div>

            <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 mb-1">
                  再会時の開示連絡先（想い出照合・開通時）
                </label>
                <p className="text-[10px] text-teal-800/80 mb-3">
                  お相手と思い出クイズが一致して開通となった際に、相手に安全に引き渡す（開示する）連絡先です。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-teal-900 mb-1">
                    サービス種別
                  </label>
                  <select
                    value={editingContactType}
                    onChange={(e) => setEditingContactType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs font-bold text-teal-900 focus:ring-2 focus:ring-teal-200 cursor-pointer"
                  >
                    <option value="LINE">LINE ID</option>
                    <option value="Instagram">Instagram</option>
                    <option value="X">X (Twitter)</option>
                    <option value="Email">メールアドレス</option>
                    <option value="Phone">電話番号 / SMS</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-teal-900 mb-1">
                    アカウントID / 連絡先情報
                  </label>
                  <input
                    type="text"
                    value={editingContactId}
                    onChange={(e) => setEditingContactId(e.target.value)}
                    placeholder="例: line_id_1234 や @username"
                    className="w-full px-3.5 py-2 bg-white border border-teal-300 rounded-xl text-xs font-mono font-medium text-teal-950 focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  メール通知の受け取り
                </div>
                <div className="text-[10px] text-slate-500">
                  メッセージの開封や大切なお知らせをメールで受け取る
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingEmailNotifications}
                  onChange={(e) => setEditingEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {updating && <RotateCcw size={13} className="animate-spin" />}
              <span>{updating ? "保存中..." : "変更内容を保存する"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
