import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Heart,
  HelpCircle, Lock, Mail, MapPin, Send, Shield, ShieldCheck,
  Sparkles, User, AlertTriangle, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNgFilter } from '../../contexts/AuthContext';
import { formatEraLabel, formatBirthYearLabel, PREFECTURES } from '../../lib/utils';
import { BottleLoader, BackToHomeButton, GoogleSearchResultPreview } from '../../components/SharedComponents';

export const PostDetailPage = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { check: checkNg } = useNgFilter();

  // URLパラメータまたはクエリパラメータまたはstateからIDを確実に解決
  const queryId = searchParams.get('id');
  const previewData = location.state?.postPreview;
  const resolvedId = id || queryId || (previewData?.id ? String(previewData.id) : null);

  const [post, setPost] = useState<any>(previewData || null);
  const [loading, setLoading] = useState(!previewData);
  const [error, setError] = useState<string | null>(null);

  // 再会希望エピソード送信モーダル
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [applicantName, setApplicantName] = useState(user?.fullName || user?.nickname || '');
  const [applicantContactType, setApplicantContactType] = useState('LINE');
  const [applicantContactId, setApplicantContactId] = useState(user?.contact_id || '');
  const [episode, setEpisode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // 投稿完了直後のバナー
  const justPosted = Boolean(location.state?.justPosted);

  useEffect(() => {
    const fetchPost = async () => {
      if (!resolvedId) {
        setLoading(false);
        setError('該当する手紙（目印）のIDが指定されていません。');
        return;
      }
      try {
        if (!post) setLoading(true);
        const res = await fetch(`/api/posts/${resolvedId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          setError(null);
        } else {
          if (!post) setError('該当する手紙（目印）が見つかりませんでした。');
        }
      } catch (err) {
        console.error(err);
        if (!post) setError('手紙の読み込み中に通信エラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [resolvedId]);

  const handleSendReunionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      setRequestError('お名前（または当時の呼び名）を入力してください。');
      return;
    }
    if (!episode.trim() || episode.trim().length < 10) {
      setRequestError('相手の方が思い出せるよう、当時のエピソードを10文字以上でご記入ください。');
      return;
    }

    const ngError = checkNg(`${applicantName} ${episode} ${applicantContactId}`);
    if (ngError) {
      setRequestError(ngError);
      return;
    }

    setIsSending(true);
    setRequestError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/posts/${id}/reunion-request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          applicantName: applicantName.trim(),
          applicantContactType,
          applicantContactId: applicantContactId.trim(),
          episode: episode.trim()
        })
      });

      if (res.ok) {
        setRequestSuccess(true);
      } else {
        const err = await res.json();
        setRequestError(err.error || '送信に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      setRequestError('通信エラーが発生しました。');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <BottleLoader />;

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <AlertTriangle size={36} className="text-amber-500" />
        <h2 className="text-xl font-bold text-slate-850">{error || '手紙が見つかりませんでした'}</h2>
        <BackToHomeButton />
      </div>
    );
  }

  const postFullName = post.searcher_full_name || post.searcher_name || post.target_name || 'お名前';
  const postMaidenName = post.searcher_maiden_name || post.maiden_name || '';
  const postLocation = post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : '全国';
  const postBirthYear = post.birth_year ? formatBirthYearLabel(post.birth_year) : (post.era ? formatEraLabel(post.era) : '');

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12 text-slate-800 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <BackToHomeButton />

        {/* 投稿直後バナー */}
        {justPosted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-300">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">手紙を書きました！</strong>
              <span>あなたを探す誰かがGoogleやサイト内で検索した際、この手紙が見つかります。</span>
            </div>
          </div>
        )}

        {/* ===================================================
            1. エモーショナルな手紙デザイン（上部カード）
        =================================================== */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30 border-2 border-teal-300/80 p-6 sm:p-10 shadow-lg text-left space-y-6 overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

          {/* ヘッダー情報 */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                {postLocation}
              </span>
              {postBirthYear && (
                <span className="text-xs font-bold bg-sky-100 text-sky-900 px-3 py-1 rounded-full font-mono">
                  {postBirthYear}
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                #{post.id}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {Boolean(post.is_ekyc_verified) && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-sky-50 to-teal-50 border border-teal-300 px-2.5 py-1 rounded-full shadow-2xs">
                  <div className="w-5 h-5 rounded-full seal-rainbow flex items-center justify-center text-white shadow-xs">
                    <ShieldCheck size={11} />
                  </div>
                  <span className="text-[11px] font-black text-teal-950 font-sans">
                    公的本人確認済
                  </span>
                </div>
              )}
              <span className="text-xs font-bold text-teal-700 bg-white/90 border border-teal-200 px-3 py-1 rounded-full shadow-2xs">
                💌 私を探すあなたへ
              </span>
            </div>
          </div>

          {/* 氏名・旧姓 ＆ eKYC公的証明バナー */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xs font-bold text-slate-500 font-sans">手紙を書いた人</span>
              {Boolean(post.is_ekyc_verified) && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-sans">
                  ✓ 氏名・生まれ年 公的確認済み
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-wide flex items-center gap-2 flex-wrap">
              <span>{postFullName}</span>
              {postMaidenName && (
                <span className="text-sm sm:text-base font-normal text-slate-500 font-sans">
                  （旧姓: {postMaidenName}）
                </span>
              )}
            </h1>

            {/* 🛡️ 公的本人確認（eKYC）済みの安心解説バナー */}
            {Boolean(post.is_ekyc_verified) && (
              <div className="p-3 bg-gradient-to-r from-teal-50/90 via-sky-50/70 to-emerald-50/80 rounded-2xl border border-teal-200/90 flex items-start gap-2.5 text-xs text-teal-950 font-sans">
                <ShieldCheck size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold block text-teal-900">【公的本人確認（eKYC）完了済みのお手紙です】</strong>
                  差出人は運転免許証・マイナンバーカード等による身元確認（本名・実在・生まれ年の一致）を完了しています。なりすまし等の心配なく、安心して再会希望をお送りいただけます。
                </div>
              </div>
            )}
          </div>

          {/* メッセージ本文 */}
          <div className="p-6 sm:p-8 bg-white/95 rounded-2xl border border-slate-200 shadow-inner space-y-3 font-serif">
            <span className="text-xs text-teal-700 font-bold block uppercase tracking-widest font-sans">
              MESSAGE
            </span>
            <p className="text-sm sm:text-base md:text-lg text-slate-800 leading-relaxed sm:leading-loose whitespace-pre-wrap">
              {post.message || post.content || '昔の仲間や知人へ。もし私の名前を見つけたら、ぜひご連絡ください。'}
            </p>
          </div>

          {/* ===================================================
              2. メインCTA: 「この人に再会を希望する」
          =================================================== */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-teal-100">
            <div className="text-xs text-slate-600 font-sans space-y-0.5 text-center sm:text-left">
              <span className="font-bold text-slate-800 block">この人に心当たりはありませんか？</span>
              <span>当時のエピソードを添えて、再会希望を申請できます。</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 whitespace-nowrap"
            >
              <Send size={16} className="text-teal-200" />
              <span>この人に再会を希望する</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* ===================================================
            3. 安心解説: 相互承認制・eKYC本人確認の仕組み図解
        =================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold text-teal-700 tracking-[0.25em] uppercase font-sans">
              SAFETY & PRIVACY
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
              安心・安全の相互承認フロー
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              一方的な連絡先開示や悪用を防ぐため、完全な相互合意制を採用しています。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-sans text-xs">
            <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-700 font-mono block">STEP 1</span>
              <strong className="text-slate-900 block">エピソード送信</strong>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                当時の思い出を添えて申請。相手に通知が届きます。
              </p>
            </div>

            <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-1.5">
              <span className="text-[10px] font-bold text-sky-700 font-mono block">STEP 2</span>
              <strong className="text-slate-900 block">相手が確認＆仮承認</strong>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                手紙の主がエピソードを読み、「あいつだ！」と承認します。
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 font-mono block">STEP 3</span>
              <strong className="text-slate-900 block">eKYC確認 ＆ 開示</strong>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                公的本人確認を経て双方の連絡先を安全に開示します。
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            4. サブCTA: 「あなたも手紙を書きませんか？」
        =================================================== */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-serif font-bold">
              あなたも大切な人に向けて、手紙を書きませんか？
            </h3>
            <p className="text-xs text-teal-100 font-sans">
              お名前とゆかりの地を登録しておくだけで、探している知人が見つけられます。
            </p>
          </div>
          <Link
            to="/create"
            className="px-6 py-3 bg-white text-teal-800 hover:bg-teal-50 font-bold rounded-2xl text-xs sm:text-sm shadow-sm transition-all whitespace-nowrap"
          >
            手紙を書く
          </Link>
        </div>
      </div>

      {/* ===================================================
          再会希望エピソード送信モーダル
      =================================================== */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 relative text-left"
            >
              <button
                type="button"
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestSuccess(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>

              {requestSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    再会希望のエピソードをお届けしました！
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-sm mx-auto">
                    「{postFullName}」様宛てに通知を発行いたしました。<br />
                    お相手が内容を確認して承認されると、マイページに通知が届きます。
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendReunionRequest} className="space-y-4 font-sans">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 uppercase">
                      <Send size={12} />
                      <span>Reunion Request</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">
                      「{postFullName}」様へ再会希望を送信
                    </h3>
                    <p className="text-xs text-slate-500">
                      当時の思い出のエピソードを添えて送信してください。
                    </p>
                  </div>

                  {requestError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                      <span>{requestError}</span>
                    </div>
                  )}

                  {/* あなたのお名前 */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      あなたのお名前（または当時の呼び名） <span className="text-rose-600 text-[10px] font-bold">※必須</span>
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="例：田中 健二（たなけん）"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-teal-600 focus:bg-white outline-none"
                    />
                  </div>

                  {/* 当時のエピソード */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>当時の思い出のエピソード <span className="text-rose-600 text-[10px] font-bold">※必須</span></span>
                      <span className="text-slate-400 text-[10px] font-mono">{episode.length}文字</span>
                    </label>
                    <textarea
                      rows={4}
                      value={episode}
                      onChange={(e) => setEpisode(e.target.value)}
                      placeholder="例：〇〇高校のサッカー部で一緒にMFをやっていた田中です。卒業旅行で京都に行ったときの思い出や、あのときの約束を覚えていますか？久しぶりに話したいです。"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-teal-600 focus:bg-white outline-none leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400">
                      ※相手の方が「あいつだ！」と思い出せる具体的なエピソードをご記入ください（直接の連絡先は記入不要です）。
                    </p>
                  </div>

                  {/* あなたの連絡先（承認後に開示） */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Lock size={13} className="text-teal-700" />
                      <span>再会承認時にお渡しする連絡先</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={applicantContactType}
                        onChange={(e) => setApplicantContactType(e.target.value)}
                        className="px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="LINE">LINE ID</option>
                        <option value="EMAIL">メール</option>
                        <option value="PHONE">電話番号</option>
                      </select>
                      <input
                        type="text"
                        value={applicantContactId}
                        onChange={(e) => setApplicantContactId(e.target.value)}
                        placeholder="例：@my_line_id"
                        className="col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <Send size={15} className="text-teal-200" />
                      <span>{isSending ? '送信中...' : '再会希望エピソードを送信'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default PostDetailPage;
