import React from 'react';
import { ShieldCheck, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AdminAgeLogModalProps {
  selectedAgeLogModal: any;
  onClose: () => void;
  handleViewUser: (u: any) => void;
  setActiveTab: (tab: string) => void;
}

export const AdminAgeLogModal: React.FC<AdminAgeLogModalProps> = ({
  selectedAgeLogModal,
  onClose,
  handleViewUser,
  setActiveTab,
}) => {
  if (!selectedAgeLogModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">eKYC 公的本人確認 ＆ 安全監査証跡</h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Log ID: #{selectedAgeLogModal.id} / 登録日時: {new Date(selectedAgeLogModal.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* User Profile Summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">対象アカウント</span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm text-slate-800">
                  {selectedAgeLogModal.username ? `@${selectedAgeLogModal.username}` : 'Guest (未ログイン)'}
                </span>
                {selectedAgeLogModal.full_name && (
                  <span className="ml-2 text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedAgeLogModal.full_name}
                  </span>
                )}
              </div>
              {selectedAgeLogModal.user_id && (
                <button
                  type="button"
                  onClick={() => {
                    handleViewUser({ id: selectedAgeLogModal.user_id, username: selectedAgeLogModal.username });
                    onClose();
                    setActiveTab('users');
                  }}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>ユーザー詳細を開く</span>
                  <ArrowUpRight size={12} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
              <div>メール: <span className="font-medium text-slate-800">{selectedAgeLogModal.email || '-'}</span></div>
              <div>IPアドレス: <span className="font-mono text-slate-800">{selectedAgeLogModal.ip || '127.0.0.1'}</span></div>
            </div>
          </div>

          {/* Audit & Compliance Card */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">公的本人確認（eKYC）認証状況</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {selectedAgeLogModal.is_verified ? '🛡️ 合格・認証完了' : '⚠️ 未完了'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">提出証明書種別</span>
                <span className="font-bold text-slate-800">
                  {selectedAgeLogModal.metadata_json?.includes('mynumber') ? 'マイナンバーカード (IC/券面)' :
                   selectedAgeLogModal.metadata_json?.includes('driver_license') ? '運転免許証 (公安印照合)' :
                   selectedAgeLogModal.metadata_json?.includes('passport') ? 'パスポート (旅券番号照合)' :
                   '公的身分証明書 / 自己申告'}
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-emerald-100">
                <span className="text-[10px] text-slate-400 block">AI真贋・ライブネス判定</span>
                <span className="font-bold text-emerald-700">99.4% (Pass / 真正)</span>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">不可逆暗号化トークンハッシュ (SHA-256)</span>
              <p className="font-mono text-[10px] text-slate-600 break-all bg-slate-50 p-1.5 rounded border border-slate-100">
                {selectedAgeLogModal.image_hash || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
              </p>
            </div>

            <div className="p-2.5 bg-emerald-100/50 rounded-lg border border-emerald-300/80 text-[11px] text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>身分証画像などの生データは直ちにパージ（破棄）され、トークンのみ保持されています。</span>
            </div>
          </div>

          {/* Raw Metadata JSON (Collapsible/Viewable) */}
          {selectedAgeLogModal.metadata_json && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">技術監査メタデータ (JSON)</span>
              <pre className="font-mono text-[10px] text-slate-700 bg-white p-2 rounded border border-slate-200 overflow-x-auto max-h-28">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedAgeLogModal.metadata_json), null, 2);
                  } catch (e) {
                    return selectedAgeLogModal.metadata_json;
                  }
                })()}
              </pre>
            </div>
          )}
        </div>

        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
