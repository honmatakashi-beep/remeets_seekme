import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";

interface AccountAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAlert: any;
  setEditingAlert: React.Dispatch<React.SetStateAction<any>>;
  handleSaveAlertModal: (e: React.FormEvent) => Promise<void>;
  alertModalError: string;
  isAlertSaving: boolean;
}

export const AccountAlertModal: React.FC<AccountAlertModalProps> = ({
  isOpen,
  onClose,
  editingAlert,
  setEditingAlert,
  handleSaveAlertModal,
  alertModalError,
  isAlertSaving
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans" data-lenis-prevent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative text-left"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
              aria-label="閉じる"
            >
              <X size={16} />
            </button>

            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/80 shadow-2xs">
                  <Bell size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {editingAlert.id ? "Edit Alert" : "New Alert"}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 mt-0.5">
                    {editingAlert.id ? "入荷通知アラートの条件変更" : "新しい入荷通知アラートの登録"}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                該当する新着ボトルメールが投函された際、登録メールアドレス宛てに即時自動でお知らせします。お相手にメールアドレスが開示されることはありません。
              </p>

              <form onSubmit={handleSaveAlertModal} className="space-y-4 text-left font-sans">
                {/* 1. お名前（姓名別） */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">
                    探したい人のお名前（あなたなど） <span className="text-rose-500 font-bold">*必須</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="text" 
                        placeholder="姓（例：山田）"
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.target_last_name}
                        onChange={e => {
                          const l = e.target.value;
                          setEditingAlert(prev => ({ 
                            ...prev, 
                            target_last_name: l,
                            target_name: `${l} ${prev.target_first_name}`.trim()
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="名（例：太郎）"
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                        value={editingAlert.target_first_name}
                        onChange={e => {
                          const f = e.target.value;
                          setEditingAlert(prev => ({ 
                            ...prev, 
                            target_first_name: f,
                            target_name: `${prev.target_last_name} ${f}`.trim()
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. 旧姓 ＆ 当時のニックネーム（愛称） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block flex items-center justify-between">
                      <span>旧姓・旧姓の姓（任意）</span>
                      <span className="text-[10px] text-slate-400 font-normal">同窓生からの照合用</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="例：佐藤（結婚前の苗字）"
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                      value={editingAlert.target_maiden_name}
                      onChange={e => setEditingAlert(prev => ({ ...prev, target_maiden_name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block flex items-center justify-between">
                      <span>当時の愛称・あだ名（任意）</span>
                      <span className="text-[10px] text-slate-400 font-normal">部活や呼び名</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="例：タッちゃん、部長"
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                      value={editingAlert.target_nickname}
                      onChange={e => setEditingAlert(prev => ({ ...prev, target_nickname: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 3. 通知先メールアドレス */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">
                    通知先メールアドレス <span className="text-rose-500 font-bold">*必須</span>
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="your-email@example.com"
                    className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                    value={editingAlert.email}
                    onChange={e => setEditingAlert(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">ゆかりの地（任意）</label>
                    <input 
                      type="text" 
                      placeholder="例：神奈川県横浜市"
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                      value={editingAlert.target_hometown}
                      onChange={e => setEditingAlert(prev => ({ ...prev, target_hometown: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">年代（任意）</label>
                    <select
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-neutral-800 focus:bg-white focus:border-brand-primary outline-none transition-all"
                      value={editingAlert.era}
                      onChange={e => setEditingAlert(prev => ({ ...prev, era: e.target.value }))}
                    >
                      <option value="">指定なし</option>
                      <option value="60">1960年代</option>
                      <option value="70">1970年代</option>
                      <option value="80">1980年代</option>
                      <option value="90">1990年代</option>
                      <option value="00">2000年代以降</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 block">関係性（任意）</label>
                    <select
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-neutral-800 focus:bg-white focus:border-brand-primary outline-none transition-all"
                      value={editingAlert.category}
                      onChange={e => setEditingAlert(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">指定なし</option>
                      <option value="friend">同級生・友人</option>
                      <option value="love">初恋・元恋人</option>
                      <option value="work">元同僚・仕事仲間</option>
                      <option value="other">その他</option>
                    </select>
                  </div>
                </div>

                {alertModalError && (
                  <div className="p-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {alertModalError}
                  </div>
                )}

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button 
                    type="submit" 
                    disabled={isAlertSaving}
                    className="flex-1 py-3 text-xs font-bold bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl shadow-md transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAlertSaving ? "保存処理中..." : editingAlert.id ? "条件を更新して保存する" : "新着通知を登録する ✨"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
