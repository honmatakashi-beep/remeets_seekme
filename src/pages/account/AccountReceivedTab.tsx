import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, X, AlertTriangle, Send, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const AccountReceivedTab = (props: any) => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>(props.requests || []);
  const [loading, setLoading] = useState<boolean>(props.requests !== undefined ? false : true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (props.requests !== undefined) {
      setRequests(props.requests);
      setLoading(false);
    }
  }, [props.requests]);

  const fetchReceivedRequests = async () => {
    if (!token) return;
    try {
      if (!props.requests) setLoading(true);
      const res = await fetch("/api/posts/reunion-requests/received", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
        if (props.onRequestsChange) {
          props.onRequestsChange(data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch received reunion requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.requests === undefined) {
      fetchReceivedRequests();
    }
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
        await fetchReceivedRequests();
        if (props.onRefresh) props.onRefresh();
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
        await fetchReceivedRequests();
        if (props.onRefresh) props.onRefresh();
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

      {/* 💡 メッセージ差出人向け: 連絡が届いた際の流れ・安心ガイド */}
      <div className="p-5 bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-sky-50/60 rounded-3xl border border-teal-200/80 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-teal-200/60 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-teal-600 text-white shadow-2xs">
              <Sparkles size={14} />
            </span>
            <h3 className="text-xs sm:text-sm font-bold font-serif text-teal-950">
              お相手から再会希望が届いたときの流れ（あなたのアクション手順）
            </h3>
          </div>
          <span className="text-[10px] font-bold text-teal-800 bg-white/90 border border-teal-300 px-2 py-0.5 rounded-full shadow-2xs">
            🛡️ 承認するまで個人情報は完全非開示
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-white/90 rounded-2xl border border-teal-100 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-teal-700 font-mono block">STEP 1</span>
            <strong className="text-slate-900 block text-xs">📧 通知メールが届く</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              お相手がエピソードを添えて再会希望を送ると、ご登録メールとマイページに即座に通知が届きます。
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-teal-100 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-teal-700 font-mono block">STEP 2</span>
            <strong className="text-slate-900 block text-xs">📖 エピソードを確認</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              届いた「2人だけの当時の思い出エピソード」を読み、探していた本人かどうかを確認します。
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-teal-100 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-teal-700 font-mono block">STEP 3</span>
            <strong className="text-slate-900 block text-xs">✨ 承認して連絡先開示</strong>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              本人であれば「承認する」を押します。公的本人確認・開通後にお互いの連絡先が開示されます。
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">読み込み中...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl p-6 bg-white/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-2xs border border-teal-100">
            <Send size={20} className="rotate-12" />
          </div>
          <p className="text-xs sm:text-sm font-serif font-bold text-slate-700">まだ再会希望のエピソードは届いていません</p>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-md mx-auto">
            あなたを探している知人がメッセージを見つけ、当時の思い出エピソードを添えて申請すると、ここに一覧で届きます。届いた際はご登録のメールアドレス宛てにもお知らせが届きます。
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
