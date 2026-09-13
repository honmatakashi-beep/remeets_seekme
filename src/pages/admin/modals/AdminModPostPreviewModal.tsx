import React from 'react';
import { Bot, X, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';

interface AdminModPostPreviewModalProps {
  selectedModPostModal: any | null;
  onClose: () => void;
  handleApproveModPost: (id: number) => void;
  triggerDeletePost: (id: number) => void;
}

export const AdminModPostPreviewModal: React.FC<AdminModPostPreviewModalProps> = ({
  selectedModPostModal,
  onClose,
  handleApproveModPost,
  triggerDeletePost,
}) => {
  if (!selectedModPostModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI検知ボトル 詳細プレビュー ＆ リスク監査</h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Post ID: #{selectedModPostModal.id} / 投函日時: {new Date(selectedModPostModal.created_at).toLocaleString()}
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
          {/* Header info */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">宛先のお名前</span>
              <span className="text-sm font-extrabold text-slate-900">{selectedModPostModal.target_name || '無題'} 様宛</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">差出人（ニックネーム・年代）</span>
              <span className="text-sm font-bold text-slate-800">{selectedModPostModal.searcher_name}（{selectedModPostModal.era || '年代不明'}）</span>
            </div>
          </div>

          {/* AI Warning Box */}
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert size={16} className="text-rose-600" />
              <span>AI自動検閲判定理由</span>
            </div>
            <p className="text-rose-950 font-medium text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-rose-100">
              {selectedModPostModal.ai_reason || 'ストーキング・不適切表現・連絡先記載の疑いにより自動隔離中'}
            </p>
          </div>

          {/* Message Body */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-700 block">手紙の本文:</span>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">
              {selectedModPostModal.message || selectedModPostModal.content}
            </div>
          </div>

          {/* Secret Question */}
          {selectedModPostModal.secret_question && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">秘密の質問</span>
              <p className="font-bold text-slate-800 text-xs">{selectedModPostModal.secret_question}</p>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            閉じる
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const id = selectedModPostModal.id;
                onClose();
                handleApproveModPost(id);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>✅ 承認して通常公開する</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const id = selectedModPostModal.id;
                onClose();
                triggerDeletePost(id);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              <span>🗑️ 手紙を削除する</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
