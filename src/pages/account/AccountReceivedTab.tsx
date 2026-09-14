import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, X, AlertTriangle, Send, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const AccountReceivedTab = (props: any) => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchReceivedRequests = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/posts/reunion-requests/received", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch received reunion requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedRequests();
  }, [token]);

  const handleApprove = async (requestId: number) => {
    if (!window.confirm("この方の再会希望エピソードを承認しますか？承認後、お相手に通知が届き、本人確認・決済を経て双方の連絡先が開示されます。")) {
      return;
    }
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/posts/reunion-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        alert("再会希望を承認しました！お相手が本人確認と決済を完了すると連絡先が開示されます。");
        fetchReceivedRequests();
      } else {
        const err = await res.json();
        alert(err.error || "承認処理に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!window.confirm("この再会希望を見送りますか？（見送り後もお相手への誹謗等は行われません）")) {
      return;
    }
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/posts/reunion-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: "思い当たるエピソードではありませんでした" })
      });
      if (res.ok) {
        alert("再会希望を見送りました。");
        fetchReceivedRequests();
      } else {
        const err = await res.json();
        alert(err.error || "見送り処理に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
          <span>届いた再会希望エピソード</span>
          {requests.length > 0 && (
            <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold font-sans">
              {requests.length}件
            </span>
          )}
        </h2>
        <button
          onClick={fetchReceivedRequests}
          className="text-xs text-teal-700 hover:underline font-bold cursor-pointer"
        >
          更新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">読み込み中...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl p-6 bg-white/50 space-y-3">
          <p className="text-xs font-serif text-slate-500">まだ再会希望のエピソードは届いていません。</p>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            あなたを探している知人がメッセージを見つけ、当時の思い出エピソードを添えて申請するとここに表示されます。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === "pending";
            const isApproved = req.status === "approved";
            const isCompleted = req.status === "completed" || req.status === "paid";
            const isRejected = req.status === "rejected";

            return (
              <div
                key={req.id}
                className="p-6 border border-slate-200 bg-white rounded-3xl space-y-4 shadow-sm text-left relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <User size={14} className="text-teal-600" />
                      <span>{req.applicant_name} 様からの再会希望</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  {/* ステータスバッジ */}
                  <div>
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        承認待ち
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        承認済み（お相手の決済待ち）
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>再会成立・連絡先開示済み</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        見送り
                      </span>
                    )}
                  </div>
                </div>

                {/* エピソード本文 */}
                <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-100/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block font-mono">
                    当時の思い出・エピソード
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                    “{req.episode}”
                  </p>
                </div>

                {/* 開示された連絡先（再会成立時） */}
                {isCompleted && req.applicant_contact_id && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-extrabold text-[10px] rounded-md uppercase">
                          お相手の連絡先 ({req.applicant_contact_type || "LINE"})
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900 select-all">
                          {req.applicant_contact_id}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(req.applicant_contact_id);
                          alert(`連絡先（${req.applicant_contact_id}）をコピーしました！`);
                        }}
                        className="px-3 py-1 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        コピー
                      </button>
                    </div>
                  </div>
                )}

                {/* アクションボタン（承認待ち時） */}
                {isPending && (
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={actionLoading === req.id}
                      onClick={() => handleReject(req.id)}
                      className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer font-bold"
                    >
                      見送る
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === req.id}
                      onClick={() => handleApprove(req.id)}
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>承認する（連絡先開示へ進む）</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default AccountReceivedTab;
