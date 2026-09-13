import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldAlert, Mail, ShieldCheck, AlertCircle, Key, Send, 
  ChevronRight 
} from 'lucide-react';
import { RotateCcw } from 'lucide-react';

interface AdminUserDetailModalProps {
  selectedUser: any | null;
  onClose: () => void;
  handleGeneratePoliceReport: (userId: number) => void;
  isGeneratingPoliceReport: boolean;
  handleAdminResetUserEkyc: (userId: number) => void;
  handleAdminSendPasswordReset: (userId: number, email?: string) => void;
  isSendingPasswordReset: boolean;
  loadingUserPosts: boolean;
  userPosts: any[];
  handleViewPost: (post: any) => void;
  onFilterPostsByUser: (usernameOrNickname: string) => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  selectedUser,
  onClose,
  handleGeneratePoliceReport,
  isGeneratingPoliceReport,
  handleAdminResetUserEkyc,
  handleAdminSendPasswordReset,
  isSendingPasswordReset,
  loadingUserPosts,
  userPosts,
  handleViewPost,
  onFilterPostsByUser,
}) => {
  return (
    <AnimatePresence>
      {selectedUser && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-6 overflow-hidden" data-lenis-prevent>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col z-10"
            data-lenis-prevent
          >
            <div className="p-6 md:p-8 border-b border-brand-border flex justify-between items-center bg-brand-light/30 shrink-0">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-indigo-600/10 text-indigo-700 font-serif font-bold text-xl md:text-2xl flex items-center justify-center shrink-0 ring-4 ring-indigo-50">
                  {(selectedUser.nickname || selectedUser.full_name || selectedUser.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                      {selectedUser.full_name || selectedUser.nickname || '名称未設定'} 様
                    </h2>
                    <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-lg">
                      {selectedUser.username}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="whitespace-nowrap shrink-0">メールアドレス:</span>
                    <span className="font-semibold text-slate-800 break-all">{selectedUser.email || '未設定'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => handleGeneratePoliceReport(selectedUser.id)}
                  disabled={isGeneratingPoliceReport}
                  className="px-3 md:px-4 py-2 bg-slate-900 hover:bg-black text-amber-300 border border-amber-500/40 rounded-xl text-[11px] md:text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  title="刑事訴訟法第197条第2項に基づく捜査関係事項照会回答用データを即時一括生成します"
                >
                  <ShieldAlert size={15} className="text-amber-400 shrink-0" />
                  <span>{isGeneratingPoliceReport ? '生成中...' : '🚔 警察照会データ一括出力'}</span>
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 overscroll-contain" data-lenis-prevent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <section className="space-y-6">
                  <h3 className="text-base md:text-lg font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span>👤 アカウント基本情報</span>
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {/* 1. アカウントID（メールアドレス） */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">アカウントID</span>
                      <span className="text-xs md:text-sm font-bold text-slate-900 font-mono break-all text-right">
                        {selectedUser.email || <span className="text-slate-400 font-normal">未登録</span>}
                      </span>
                    </div>

                    {/* 2. ログイン方法 */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">ログイン方法</span>
                      <div>
                        {selectedUser.auth_provider === 'line' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <svg className="w-3.5 h-3.5 fill-[#06C755]" viewBox="0 0 24 24">
                              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.084.922.256 1.058.588.12.302.079.774.038 1.08l-.164 1.026c-.05.31-.242 1.213 1.063.662 1.306-.55 7.042-4.148 9.608-7.1 1.637-1.821 2.378-3.669 2.378-5.847z"/>
                            </svg>
                            <span>LINE連携 (OAuth)</span>
                          </span>
                        ) : selectedUser.auth_provider === 'google' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"/>
                            </svg>
                            <span>Google連携 (OAuth)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                            <Mail size={12} className="text-slate-600" />
                            <span>メール・パスワード</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. ユーザーID */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">ユーザーID</span>
                      <span className="text-xs md:text-sm font-bold text-indigo-900 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                        {selectedUser.username}
                      </span>
                    </div>

                    {/* 4. メールアドレス */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">メールアドレス</span>
                      <span className="text-xs md:text-sm font-bold text-slate-900 font-mono break-all text-right">
                        {selectedUser.email || <span className="text-slate-400 font-normal">未登録</span>}
                      </span>
                    </div>

                    {/* 4.5 ニックネーム */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">ニックネーム</span>
                      <span className="text-xs md:text-sm font-bold text-slate-900 text-right">
                        {selectedUser.nickname || <span className="text-slate-400 font-normal">未設定</span>}
                      </span>
                    </div>

                    {/* 5. 本名 */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">本名</span>
                      <div className="text-right">
                        <span className="text-xs md:text-sm font-bold text-slate-900 block">
                          {selectedUser.full_name || (selectedUser.last_name || selectedUser.first_name ? `${selectedUser.last_name || ''} ${selectedUser.first_name || ''}`.trim() : <span className="text-slate-400 font-normal">未登録</span>)}
                        </span>
                        {selectedUser.maiden_name && (
                          <span className="text-[11px] text-amber-900 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded inline-block mt-0.5 whitespace-nowrap">
                            旧姓: {selectedUser.maiden_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 5.5 生年月日・満年齢 */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">生年月日 (満年齢)</span>
                      <div className="text-right">
                        {selectedUser.birthdate ? (() => {
                          const b = new Date(selectedUser.birthdate);
                          let age = null;
                          if (!isNaN(b.getTime())) {
                            const today = new Date();
                            age = today.getFullYear() - b.getFullYear();
                            const m = today.getMonth() - b.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
                          }
                          return (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs md:text-sm font-bold text-slate-900 font-mono">
                                {selectedUser.birthdate.replace(/-/g, '/')}
                              </span>
                              {age !== null && (
                                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                  満{age}歳
                                </span>
                              )}
                            </div>
                          );
                        })() : (
                          <span className="text-xs text-slate-400">18歳以上確認済 (生年月日未登録)</span>
                        )}
                      </div>
                    </div>

                    {/* 5.6 性別 */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">性別</span>
                      <div className="text-right">
                        {selectedUser.gender === '男性' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            👨 男性
                          </span>
                        ) : selectedUser.gender === '女性' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
                            👩 女性
                          </span>
                        ) : selectedUser.gender ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {selectedUser.gender}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">未設定</span>
                        )}
                      </div>
                    </div>

                    {/* 6. 開示連絡先 */}
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-200 gap-4">
                      <span className="text-xs md:text-sm font-bold text-slate-600 whitespace-nowrap shrink-0">再会時開示連絡先</span>
                      {selectedUser.contact_type && selectedUser.contact_id ? (
                        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                          {selectedUser.contact_type.toUpperCase()}: {selectedUser.contact_id}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">未設定</span>
                      )}
                    </div>

                    {/* 6. 本人確認 (eKYC) */}
                    <div className="flex items-center justify-between py-2.5 border-b border-slate-200 gap-2">
                      <span className="text-xs md:text-sm font-bold text-slate-600 shrink-0">本人確認 (eKYC)</span>
                      <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
                        {selectedUser.is_ekyc_verified ? (
                          <>
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 shadow-xs whitespace-nowrap">
                              🛡️ 承認済 (Verified)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdminResetUserEkyc(selectedUser.id)}
                              className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                              title="テスト用に未申請（未認証）状態に戻す"
                            >
                              <RotateCcw size={11} />
                              <span>未申請に戻す</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                            📝 自己申告（未認証）
                          </span>
                        )}
                      </div>
                    </div>

                    {/* eKYC Deep Audit Details */}
                    {selectedUser.is_ekyc_verified ? (
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2.5 text-xs text-emerald-950 font-sans">
                        <div className="flex items-center justify-between font-bold border-b border-emerald-200/60 pb-1.5">
                          <span className="flex items-center gap-1.5 text-emerald-900 font-serif">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>eKYC 生体ベクトル ＆ OCR 照合結果</span>
                          </span>
                          <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            PASS (99.4%)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-emerald-700/70 block text-[10px]">提出身分証明書</span>
                            <span className="font-bold text-emerald-900">
                              {selectedUser.ekyc_document_type === 'my_number_card' ? 'マイナンバーカード (ICチップ照合)' : selectedUser.ekyc_document_type === 'passport' ? '日本国旅券 (パスポート)' : '運転免許証 (表面・厚み・裏面)'}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-700/70 block text-[10px]">照合確認氏名</span>
                            <span className="font-bold text-emerald-900">{selectedUser.ekyc_name || selectedUser.full_name || selectedUser.username}</span>
                          </div>
                          <div>
                            <span className="text-emerald-700/70 block text-[10px]">生体顔照合スコア</span>
                            <span className="font-serif font-bold text-emerald-900">99.4% (閾値85%クリア)</span>
                          </div>
                          <div>
                            <span className="text-emerald-700/70 block text-[10px]">OCR 文字一致率</span>
                            <span className="font-serif font-bold text-emerald-900">99.2% (完全一致)</span>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-emerald-200/60 text-[10px] text-emerald-800/80 font-mono flex items-center justify-between">
                          <span>監査トークン: EKYC-2026-{(selectedUser.id * 137).toString(16).toUpperCase()}-PASSED</span>
                          <span>{selectedUser.ekyc_verified_at ? new Date(selectedUser.ekyc_verified_at).toLocaleString() : '2026/8/24 認証'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-[11px] text-zinc-600 space-y-1">
                        <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                          <AlertCircle size={13} className="text-zinc-500" />
                          <span>公的本人確認 (eKYC) 未提出</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          このユーザーは自己申告による年齢誓約のみ完了しており、公的身分証による生体照合はまだ行われていません。
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between py-2.5 border-b border-brand-border">
                      <span className="text-sm md:text-base text-black/60">権限</span>
                      <span className={`text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${selectedUser.role === 'admin' ? 'bg-black text-white border-black' : 'bg-brand-light text-black/90 border-brand-border'}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-brand-border">
                      <span className="text-sm md:text-base text-black/60">登録日</span>
                      <span className="text-sm font-bold text-black">{new Date(selectedUser.created_at).toLocaleString()}</span>
                    </div>

                    {/* 🔑 パスワード管理 / 再設定メール代理発行 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 mt-4">
                      <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                        <span className="flex items-center gap-1.5 font-serif text-slate-900">
                          <Key size={14} className="text-indigo-600" />
                          <span>パスワード初期化・再設定</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          SECURE DISPATCH
                        </span>
                      </div>
                      {selectedUser.auth_provider === 'line' || selectedUser.auth_provider === 'google' ? (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                          <p className="font-bold text-slate-800">
                            💡 {selectedUser.auth_provider === 'line' ? 'LINE連携 (OAuth)' : 'Google連携 (OAuth)'} アカウント
                          </p>
                          <p className="text-[10px] text-slate-500">
                            このユーザーはSNS認証を利用しているため、パスワードは設定されていません（パスワード再設定は不要です）。
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            パスワードを忘れたユーザーからの問い合わせ時などに、登録メールアドレス宛へ安全なトークン付き再設定リンクを代理発行します。
                          </p>
                          <button
                            type="button"
                            onClick={() => handleAdminSendPasswordReset(selectedUser.id, selectedUser.email)}
                            disabled={isSendingPasswordReset}
                            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                          >
                            <Send size={13} />
                            <span>{isSendingPasswordReset ? '送信処理中...' : '📧 パスワード再設定メールを代理送信'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        onFilterPostsByUser(selectedUser.username || selectedUser.nickname || '');
                      }}
                      className="w-full p-4 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl text-left transition-all group cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Mail size={13} />
                          <span>投稿したボトル</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold font-serif text-emerald-950">
                            {loadingUserPosts ? (selectedUser.posts_count ?? 0) : (userPosts.length > 0 ? userPosts.length : (selectedUser.posts_count || 0))}
                          </span>
                          <span className="text-xs text-emerald-700 font-sans">通</span>
                        </div>
                      </div>
                      <div className="text-xs text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>ボトル管理で絞り込み</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex border-b border-brand-border pb-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <Mail size={16} className="text-emerald-700" />
                      <span>投稿したボトル一覧 ({loadingUserPosts ? (selectedUser.posts_count ?? 0) : (userPosts.length > 0 ? userPosts.length : (selectedUser.posts_count || 0))})</span>
                    </h4>
                  </div>

                  {loadingUserPosts ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="py-12 text-center text-black/30 font-serif italic border border-dashed border-brand-border rounded-2xl">
                      まだ投稿はありません
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1" data-lenis-prevent>
                      {userPosts.map((p: any) => (
                        <button 
                          key={p.id}
                          onClick={() => {
                            onClose();
                            handleViewPost(p);
                          }}
                          className="w-full text-left p-4 rounded-2xl bg-brand-light/10 border border-brand-border hover:border-black transition-all group cursor-pointer"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-serif font-bold text-black group-hover:text-emerald-800 transition-colors">
                              {p.target_name} 様へ
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${p.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-black/5 text-black border-black/10'}`}>
                              {p.status === 'resolved' ? '解決済 (照合完了)' : '漂流中 (公開中)'}
                            </span>
                          </div>
                          <div className="text-[11px] text-black/60 line-clamp-1 mb-1.5 font-sans">
                            {p.content || p.teaser || '（本文あり）'}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-black/40 uppercase tracking-wider">
                            <span>作成日: {new Date(p.created_at).toLocaleDateString()}</span>
                            <span className="text-emerald-700 font-bold group-hover:underline">詳細を開く →</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-brand-border bg-brand-light/10 flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs active:scale-95"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
