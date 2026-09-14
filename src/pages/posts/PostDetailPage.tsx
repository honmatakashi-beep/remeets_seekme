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
import { EkycExplanationModal } from '../../components/posts/EkycExplanationModal';

export const PostDetailPage = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { check: checkNg } = useNgFilter();

  // URLパラメータまたはクエリパラメータまたはstateからIDを確実に解決（/posts/123/xxx のスラッグ対応）
  const queryId = searchParams.get('id');
  const rawParamId = id ? (id.includes('-') ? id.split('-')[0] : id) : null;
  const previewData = location.state?.postPreview;
  const resolvedId = rawParamId || queryId || (previewData?.id ? String(previewData.id) : null);

  const [post, setPost] = useState<any>(previewData || null);
  const [loading, setLoading] = useState(!previewData);
  const [error, setError] = useState<string | null>(null);

  // 公認バッジ証明内容モーダル
  const [showEkycExplanationModal, setShowEkycExplanationModal] = useState(false);

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
        setError('該当するメッセージのIDが指定されていません。');
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
          if (!post) setError('該当するメッセージが見つかりませんでした。');
        }
      } catch (err) {
        console.error(err);
        if (!post) setError('メッセージの読み込み中に通信エラーが発生しました。');
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
        <h2 className="text-xl font-bold text-slate-850">{error || 'メッセージが見つかりませんでした'}</h2>
        <BackToHomeButton />
      </div>
    );
  }

  const postFullName = (post.searcher_full_name || post.searcher_name || post.target_name || 'お名前').trim();
  const rawKana = post.target_name_kana || post.searcher_name_kana || ((post.target_last_name_kana || post.target_first_name_kana) ? `${post.target_last_name_kana || ''} ${post.target_first_name_kana || ''}` : '') || '';
  const postKana = rawKana.replace(/undefined/g, '').trim();
  const postMaidenName = (post.searcher_maiden_name || post.maiden_name || '').replace(/undefined/g, '').trim();
  const rawMaidenKana = post.target_maiden_name_kana || post.searcher_maiden_name_kana || '';
  const postMaidenNameKana = rawMaidenKana.replace(/undefined/g, '').trim();
  const postLocation = post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : '全国';
  const postBirthYear = post.birth_year ? formatBirthYearLabel(post.birth_year) : (post.era ? formatEraLabel(post.era) : '');

  const isAuthor = user && (user.id === post.user_id || user.email === post.email);

  return (
    <div className="min-h-screen bg-transparent py-6 sm:py-10 text-slate-800 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
        
        {/* 上部ナビゲーション（トップに戻る ＆ マイアカウントに戻る） */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-slate-500" />
              <span>トップに戻る</span>
            </Link>
            {user && (
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50/90 hover:bg-teal-100 border border-teal-200/90 shadow-2xs transition-all cursor-pointer"
              >
                <User size={13} className="text-teal-600" />
                <span>マイアカウントに戻る</span>
              </Link>
            )}
          </div>
        </div>

        {/* オーナー（作成者本人）閲覧時のスマートプレビューバナー */}
        {isAuthor && (
          <div className="p-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-teal-950 text-xs sm:text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>あなたが公開中のメッセージです（Google検索対象・一般の方にはこのように見えます）</span>
            </div>
          </div>
        )}

        {/* 投稿直後バナー */}
        {justPosted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-300">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div>
              <strong className="block font-bold">メッセージを届けました！</strong>
              <span>あなたを探す誰かがGoogleやサイト内で検索した際、このメッセージが見つかります。</span>
            </div>
          </div>
        )}

        {/* ===================================================
            1. メイン公開メッセージカード（作成プレビューと100%同一）
        =================================================== */}
        <div className={`relative rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-sky-50/30 border-2 p-6 sm:p-10 shadow-lg text-left space-y-6 overflow-hidden transition-all ${
          post.is_ekyc_verified
            ? 'border-amber-400/90 shadow-[0_10px_35px_rgba(251,191,36,0.18)]'
            : 'border-slate-300 shadow-md'
        }`}>
          {/* メッセージヘッダー */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-teal-100 pb-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-teal-800 tracking-wider font-sans bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>✉️</span>
                  <span>想い出再会プラットフォーム ReMEETs SEEKME 公開メッセージ</span>
                </span>
                <span className="text-[11px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-mono">
                  {postLocation}
                </span>
                {postBirthYear && (
                  <span className="text-[11px] font-bold bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full font-mono">
                    {postBirthYear}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 leading-snug">
                  <span>{postFullName || 'お名前'} 様から貴方へのメッセージです。</span>
                  {postMaidenName && (
                    <span className="text-xs sm:text-sm font-normal text-slate-500 font-sans ml-1">
                      （旧姓: {postMaidenName}{postMaidenNameKana ? ` / ${postMaidenNameKana}` : ''}）
                    </span>
                  )}
                </h2>
                {Boolean(post.is_ekyc_verified) && (
                  <button
                    type="button"
                    onClick={() => setShowEkycExplanationModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 group shrink-0"
                    title="クリックして公的本人確認（eKYC）の証明内容を確認"
                  >
                    <div className="w-4 h-4 rounded-full seal-rainbow flex items-center justify-center text-white shadow-2xs shrink-0">
                      <ShieldCheck size={10} />
                    </div>
                    <span className="font-bold text-[11px]">公的本人確認済</span>
                    <span className="text-[9.5px] font-medium text-rose-700 bg-white/90 border border-rose-200 px-1.5 py-0.2 rounded-full group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      詳細を見る 🔍
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* 右側：公開ステータス ＆ eKYC大型封蝋バッジ */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-teal-100/60 sm:border-none">
              <span className="text-xs text-slate-500 font-sans whitespace-nowrap">公開中（Google検索対象）</span>
              {Boolean(post.is_ekyc_verified) && (
                <div className="relative group sm:mt-1">
                  <button
                    type="button"
                    onClick={() => setShowEkycExplanationModal(true)}
                    className="w-12 h-12 rounded-full seal-rainbow flex flex-col items-center justify-center text-white shadow-md hover:shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-300 shrink-0"
                    title="クリックして公的本人確認の証明内容を確認"
                  >
                    <ShieldCheck size={18} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] group-hover:rotate-6 transition-transform" />
                    <span className="text-[6px] font-black tracking-tighter uppercase -mt-0.5 text-white drop-shadow-xs">eKYC済</span>
                  </button>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8.5px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded-full whitespace-nowrap pointer-events-none font-sans">
                    詳細 👆
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* メッセージメタデータ（大きめ・見やすい文字サイズ・高コントラスト） */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 font-sans shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">メッセージを書いた人</span>
              <div className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                <span>{postFullName || '未設定'}</span>
                {postKana && (
                  <span className="text-xs font-normal text-slate-600 ml-1">
                    （{postKana}）
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">旧姓</span>
              <div className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                <span>{postMaidenName || 'なし'}</span>
                {postMaidenNameKana && (
                  <span className="text-xs font-normal text-slate-600 ml-1">
                    （{postMaidenNameKana}）
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">ゆかりの地</span>
              <div className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                {postLocation || '未設定'}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">生まれ年</span>
              <div className="text-base sm:text-lg font-bold text-slate-950 font-sans">
                {postBirthYear || '非公開'}
              </div>
            </div>
          </div>

          {/* メッセージ本文（高コントラスト・くっきり濃い文字） */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b-2 border-teal-100 pb-2">
              <span className="text-xs sm:text-sm font-extrabold text-teal-900 font-sans flex items-center gap-1.5">
                <span className="text-base">✉️</span>
                <span>メッセージ本文</span>
              </span>
              <span className="text-xs font-medium text-slate-600 font-sans">
                当時の想い出・メッセージ
              </span>
            </div>
            <div className="bg-white p-6 sm:p-7 rounded-2xl border-2 border-slate-300/90 shadow-sm">
              <p className="text-sm sm:text-base md:text-lg font-medium font-sans text-slate-950 leading-relaxed sm:leading-loose whitespace-pre-wrap">
                {post.message || post.content || (
                  <span className="text-slate-400 italic">（メッセージが入力されていません）</span>
                )}
              </p>
            </div>
          </div>

          {/* メインCTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-teal-100">
            <div className="text-xs text-slate-600 font-sans space-y-0.5 text-center sm:text-left">
              <span className="font-bold text-slate-800 block">
                {isAuthor ? 'あなたのメッセージが正常に公開されています' : 'この人に心当たりはありませんか？'}
              </span>
              <span>
                {isAuthor ? '心当たりのある方からの再会希望が届くと通知されます。' : '当時のエピソードを添えて、再会希望を申請できます。'}
              </span>
            </div>

            {isAuthor ? (
              <Link
                to="/account"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <span>マイアカウントで管理・修正</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-95 whitespace-nowrap font-sans"
              >
                <Send size={16} className="text-teal-200" />
                <span>{postFullName ? `${postFullName}さんに再会を希望する` : 'この人に再会を希望する'}</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            2. 連絡先がわからなくなってしまった貴方へ（安心ガイド）
        =================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5 text-left font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-teal-700 tracking-widest uppercase font-sans flex items-center gap-1">
                <span>ABOUT THIS MESSAGE</span>
                <span>・</span>
                <span>メッセージに込められた想いと安心の仕組み</span>
              </span>
              <h3 className="text-base sm:text-lg font-bold font-sans text-slate-900 flex items-center gap-2 flex-wrap">
                <span>🕊️ 連絡先がわからなくなってしまった貴方へ</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                「もう一度つながるきっかけ」として、当時の大切な想い出と共に届けられたメッセージです。
              </p>
            </div>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-auto shadow-2xs">
              🔒 登録・返信無料 ／ 完全相互合意制
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* 1. メッセージの目的 */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50/70 to-emerald-50/30 rounded-2xl border border-teal-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  1
                </div>
                <strong className="text-slate-900 text-xs sm:text-sm font-bold block font-sans">
                  メッセージに込められた想い
                </strong>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                引っ越しや環境の変化で連絡先が途絶えた大切な人に向けて、差出人が<strong>「もう一度話したい、元気か知りたい」</strong>という想いを込めて届けているメッセージです。
              </p>
            </div>

            {/* 2. 心当たりがある時 */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-50/70 to-blue-50/30 rounded-2xl border border-sky-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  2
                </div>
                <strong className="text-slate-900 text-xs sm:text-sm font-bold block font-sans">
                  心当たりがある時は
                </strong>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                「自分宛てかもしれない」と思ったら、メッセージ下のボタンから<strong>当時の呼び名や想い出のエピソードを添えて返信</strong>できます（登録・申請は無料）。
              </p>
            </div>

            {/* 3. 安心の相互承認 */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/30 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  3
                </div>
                <strong className="text-slate-900 text-xs sm:text-sm font-bold block font-sans">
                  安心の相互合意システム
                </strong>
              </div>
              <p className="text-slate-600 text-[11.5px] leading-relaxed">
                差出人がエピソードを読み<strong>『確かにあの頃の仲間だ！』と双方が納得した場合のみ</strong>連絡先が開示されます。第三者には一切公開されません。
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11.5px] text-slate-600 leading-relaxed flex items-center gap-2">
            <span className="text-base">✨</span>
            <span>一方的な連絡先開示や悪用はAIと相互承認システムで100%遮断されています。安心してお気持ちをお伝えください。</span>
          </div>
        </div>

        {/* ===================================================
            3. サブCTA: 「あなたもメッセージを届けませんか？」
        =================================================== */}
        {!isAuthor && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold font-sans">
                あなたも大切な人に向けて、メッセージを届けませんか？
              </h3>
              <p className="text-xs text-teal-100 font-sans">
                お名前とゆかりの地を登録しておくだけで、探している知人が見つけられます。
              </p>
            </div>
            <Link
              to="/create"
              className="px-6 py-3 bg-white text-teal-800 hover:bg-teal-50 font-bold rounded-2xl text-xs sm:text-sm shadow-sm transition-all whitespace-nowrap"
            >
              メッセージを届ける
            </Link>
          </div>
        )}
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

      {/* 🔍 公的本人確認（公認バッジ）証明内容モーダル */}
      <EkycExplanationModal
        isOpen={showEkycExplanationModal}
        onClose={() => setShowEkycExplanationModal(false)}
        senderName={postFullName}
        senderKana={postKana || undefined}
        birthYear={post?.birth_year ? formatBirthYearLabel(post.birth_year) : undefined}
        hometownPref={post?.hometown_pref || post?.target_hometown}
        mode="general"
      />
    </div>
  );
};
export default PostDetailPage;
