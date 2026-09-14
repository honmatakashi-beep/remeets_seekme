import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, Lock, ArrowRight, AlertTriangle, Send, User, CreditCard, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const AccountSentTab = (props: any) => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingRequestId, setPayingRequestId] = useState<number | null>(null);
  const [contactType, setContactType] = useState("LINE");
  const [contactId, setContactId] = useState(user?.contact_id || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSentRequests = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch("/api/posts/reunion-requests/sent", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch sent reunion requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, [token]);

  const handlePayAndUnlock = async (requestId: number) => {
    if (!contactId.trim()) {
      alert("再会相手にお渡しするあなたの連絡先（LINE IDまたはメールアドレス）を入力してください。");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/posts/reunion-requests/${requestId}/pay-and-unlock`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contactType,
          contactId: contactId.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert("決済および連絡先の開示が完了しました！");
        setPayingRequestId(null);
        fetchSentRequests();
      } else {
        const err = await res.json();
        alert(err.error || "開示処理に失敗しました。");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラーが発生しました。");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
          <span>送信した再会申請</span>
          {requests.length > 0 && (
            <span className="text-xs bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-bold font-sans">
              {requests.length}件
            </span>
          )}
        </h2>
        <button
          onClick={fetchSentRequests}
          className="text-xs text-teal-700 hover:underline font-bold cursor-pointer"
        >
          更新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-400">読み込み中...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl p-6 bg-white/50 space-y-3">
          <p className="text-xs font-serif text-slate-500">送信した再会申請はまだありません。</p>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            メッセージの検索画面から気になる人を探し、エピソードを添えて再会希望を送信しましょう。
          </p>
          <div className="pt-2">
            <Link to="/search" className="text-xs font-bold text-teal-700 hover:underline">
              メッセージを探しに行く →
            </Link>
          </div>
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
                      <span>「{req.searcher_full_name || req.searcher_name}」様宛ての申請</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(req.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  <div>
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        お相手の承認待ち
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                        🎉 お相手が承認しました！
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>連絡先開示完了</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        見送り
                      </span>
                    )}
                  </div>
                </div>

                {/* 送信したエピソード */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                    送信したエピソード
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif whitespace-pre-wrap">
                    “{req.episode}”
                  </p>
                </div>

                {/* 承認済みの場合の決済・開示アクション */}
                {isApproved && (
                  <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-sky-50 rounded-2xl border-2 border-emerald-300 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-600" />
                        <span>お相手があなたの申請を承認しました！</span>
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        本人確認（eKYC）と決済（1,200円: 開封料600円+eKYC料600円）を完了すると、お相手の連絡先（LINE ID等）が即時開示されます。
                      </p>
                    </div>

                    {payingRequestId === req.id ? (
                      <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 block">
                            あなたのお相手にお渡しする連絡先
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={contactType}
                              onChange={(e) => setContactType(e.target.value)}
                              className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                            >
                              <option value="LINE">LINE ID</option>
                              <option value="EMAIL">メール</option>
                              <option value="PHONE">電話番号</option>
                            </select>
                            <input
                              type="text"
                              value={contactId}
                              onChange={(e) => setContactId(e.target.value)}
                              placeholder="例：@my_line_id"
                              className="col-span-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setPayingRequestId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                          >
                            キャンセル
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handlePayAndUnlock(req.id)}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard size={14} />
                            <span>{isProcessing ? "処理中..." : "1,200円を決済して連絡先を開示"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setPayingRequestId(req.id)}
                          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard size={14} />
                          <span>本人確認・決済へ進む（1,200円）</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 決済完了・開示済みの場合の相手連絡先カード */}
                {isCompleted && (
                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-teal-700 text-white font-extrabold text-[10px] rounded-md uppercase">
                          「{req.searcher_name}」様の連絡先 ({req.author_contact_type || "LINE"})
                        </span>
                        <span className="font-mono text-sm font-bold text-slate-900 select-all">
                          {req.author_contact_id || `@${req.author_username || "seekme_user"}`}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const idText = req.author_contact_id || `@${req.author_username || "seekme_user"}`;
                          navigator.clipboard.writeText(idText);
                          alert(`連絡先（${idText}）をコピーしました！`);
                        }}
                        className="px-3 py-1 text-xs font-bold text-teal-900 bg-white hover:bg-teal-100 border border-teal-300 rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        コピー
                      </button>
                    </div>
                    {req.author_contact_note && (
                      <p className="text-[11px] text-teal-800 font-sans">
                        メッセージ: {req.author_contact_note}
                      </p>
                    )}
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
export default AccountSentTab;
