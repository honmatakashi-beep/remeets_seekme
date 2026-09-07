import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle2, FileWarning, Heart, Info, Lock,
  Mail, MessageSquare, Search, Send, Sparkles, X, MapPin,
  AlertCircle, ArrowLeft, ArrowRight, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn, PageHeader, getPostUrl, formatEraLabel, getCategoryText, PREFECTURES } from '../lib/utils';
import { BottleLoader, GoogleSearchResultPreview, BackToHomeButton } from '../components/SharedComponents';
import searchEmptySea from '../assets/images/search_empty_sea_1785869230086.jpg';

export const SearchPage = ({ onOpenOnboarding }: { onOpenOnboarding?: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(qParam);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eraFilter, setEraFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // あなた宛て新着通知スイッチ状態
  const [notifyEnabled, setNotifyEnabled] = useState<boolean>(true);
  const [isUpdatingNotify, setIsUpdatingNotify] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotifyStatus = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/user/notify-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifyEnabled(data.enabled);
        }
      } catch (e) {}
    };
    fetchNotifyStatus();
  }, [token]);

  const handleToggleNotify = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setIsUpdatingNotify(true);
    const nextState = !notifyEnabled;
    setNotifyEnabled(nextState);
    try {
      const res = await fetch('/api/user/notify-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nextState })
      });
      if (!res.ok) setNotifyEnabled(!nextState);
    } catch (e) {
      setNotifyEnabled(!nextState);
    } finally {
      setIsUpdatingNotify(false);
    }
  };
  
  const [alertForm, setAlertForm] = useState({
    email: user?.email || '',
    targetName: qParam || '',
    targetHometown: '',
    era: '',
    category: ''
  });
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    setAlertForm(prev => ({
      ...prev,
      email: prev.email || user?.email || '',
      targetName: query || prev.targetName,
      era: eraFilter,
      category: categoryFilter
    }));
  }, [query, eraFilter, categoryFilter, user?.email]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const url = `/api/posts?q=${encodeURIComponent(query)}&era=${eraFilter}&category=${categoryFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setCurrentPage(1); // 検索・絞り込み実行時は1ページ目にリセット
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [qParam, eraFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const isNullSearch = !query.trim() && !eraFilter && !categoryFilter;
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPosts = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSubmitting(true);
    setAlertMessage(null);
    try {
      const res = await fetch('/api/search-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: alertForm.email,
          target_name: alertForm.targetName,
          target_hometown: alertForm.targetHometown,
          era: alertForm.era,
          category: alertForm.category
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAlertSuccess(true);
        setAlertMessage({ type: 'success', text: data.message });
        setAlertForm(prev => ({ ...prev, email: '' }));
      } else {
        setAlertMessage({ type: 'error', text: data.error || '登録に失敗しました。' });
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: '通信障害が発生しました。再度お試しください。' });
      setAlertSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12 space-y-6 md:space-y-8 animate-fade-in font-sans text-black">
      <BackToHomeButton className="mb-2" />
      {searchParams.get('alert_verified') === 'true' && (
        <div className="bg-green-50 border border-green-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-sm text-green-800 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            メール通知（検索アラート）の認証に成功しました！
          </div>
          <p className="text-xs sm:text-sm text-green-700 font-sans">
            あなたを探しているお相手からの新着ボトルメール（あなたの名前や出身校・ゆかりの地域宛ての手紙）が投函された際、このメールアドレス宛てにすぐに自動通知されます。あなたの個人情報は完全に保護されます。
          </p>
        </div>
      )}
      <PageHeader
        icon={<Search size={24} className="text-teal-600" />}
        iconBoxClassName="bg-teal-50 text-teal-600 border border-teal-100"
        category="Search Directory"
        title="自分宛ての手紙を探す"
        description="ご自身のお名前や、ゆかりの深い地域などで検索し、あなたを探している大切な人から届いているボトルメール（手紙）と出会うことができます。"
      />

      {/* 🔍 上部統合検索 & 絞り込み & 新着通知コントロールカード */}
      <div className="glass-card p-5 sm:p-7 bg-white rounded-3xl border border-brand-border shadow-sm space-y-4 font-sans text-left">
        {/* 検索入力バー */}
        <form onSubmit={handleSearch} className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-800 font-sans">
            あなたのお名前のフルネーム（旧姓・ニックネーム）を入れてください
          </label>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-grow">
              <input 
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="あなたのお名前"
                className="w-full pl-4 sm:pl-5 pr-10 sm:pr-12 py-3 text-xs sm:text-sm border border-brand-border rounded-2xl bg-slate-50/60 focus:bg-white focus:border-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-sans placeholder:text-slate-400 text-black shadow-inner"
              />
              <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
            </div>
            <button type="submit" className="btn-primary px-5 sm:px-7 py-3 text-xs sm:text-sm whitespace-nowrap animate-none shrink-0 rounded-2xl font-bold cursor-pointer">
              検索する
            </button>
          </div>
        </form>

        {/* 絞り込みセレクター */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Info size={13} className="text-teal-600" />
            <span>年代・関係性で絞り込み:</span>
          </span>
          <select 
            value={eraFilter}
            onChange={e => setEraFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs outline-none text-slate-800 focus:border-teal-600 font-sans cursor-pointer shadow-2xs"
          >
            <option value="">すべての年代</option>
            <option value="1950">1950年代</option>
            <option value="1960">1960年代</option>
            <option value="1970">1970年代</option>
            <option value="1980">1980年代</option>
            <option value="1990">1990年代</option>
            <option value="2000">2000年代</option>
            <option value="2010">2010年代</option>
            <option value="2020">2020年代</option>
          </select>
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs outline-none text-slate-800 focus:border-teal-600 font-sans cursor-pointer shadow-2xs"
          >
            <option value="">すべての関係性</option>
            <option value="friend">同級生・友人</option>
            <option value="love">初恋・元恋人</option>
            <option value="work">元同僚・仕事仲間</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* 🔔 新着手紙の自動メール通知ガイド＆設定パネル */}
        <div className="mt-3 p-3.5 sm:p-4 bg-gradient-to-r from-teal-50/90 via-sky-50/50 to-white rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="p-2 bg-teal-600 text-white rounded-xl shrink-0 shadow-2xs mt-0.5 sm:mt-0">
              <Bell size={15} className={notifyEnabled && user ? "animate-pulse" : ""} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-950 text-xs sm:text-sm font-serif">
                  あなた宛て新着手紙の自動メール通知
                </span>
                {user && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    notifyEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {notifyEnabled ? '現在：受信中' : '現在：停止中'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 font-sans mt-0.5 leading-relaxed">
                {user 
                  ? `あなた（${user.fullName || user.username} 様）宛ての手紙が新しく流された際、登録メール宛てにお知らせします。`
                  : 'あなたを探している大切な人からの手紙が届いた際、メールで自動通知を受け取ることができます。'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-end">
            {user ? (
              <button
                type="button"
                onClick={handleToggleNotify}
                disabled={isUpdatingNotify}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                  notifyEnabled
                    ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {isUpdatingNotify ? '更新中...' : notifyEnabled ? '通知を解除する' : 'メール通知を有効化（無料）'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAlertMessage(null);
                  setIsAlertModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white transition-all cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <Mail size={13} />
                <span>通知を受け取る（無料）</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NULL検索（未入力）時の案内バナー */}
      {isNullSearch && !loading && (
        <div className="bg-amber-50/80 border border-amber-200/90 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed font-sans shadow-2xs text-left">
          <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-amber-950">💡 検索方法のアドバイス</p>
            <p className="mt-0.5 text-[11px] text-amber-900/90 leading-relaxed font-sans">
              現在検索条件が未入力のため、<b>最新の漂うボトルメール（新着順）</b>を表示しています。<br />
              ご自身宛ての手紙をお探しの場合は、上の検索ボックスに<b>「あなたのお名前（苗字・旧姓・お名前・ニックネーム）」</b>や<b>「ゆかりの都道府県」「年代」</b>等を入力して検索してください。（※具体的な市区町村や学校名は安全のため非公開となっており、思い出クイズ正解後に開示されます）
            </p>
          </div>
        </div>
      )}

      {/* Results Area */}
      <div className="space-y-6">
        {loading ? (
          <BottleLoader />
        ) : posts.length === 0 ? (
          <div className="space-y-8">
            <div className="text-center py-12 md:py-16 bg-white rounded-3xl border border-brand-border/80 p-6 md:p-10 space-y-4 relative overflow-hidden shadow-sm">
              {/* 背景イラスト（凪いた朝もやの海） */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden select-none">
                <div className="relative w-full h-full opacity-55">
                  <img 
                    src={searchEmptySea} 
                    alt="静かな朝もやの海" 
                    className="w-full h-full object-cover object-center"
                  />
                  {/* 左右グラデーション */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-white" />
                  {/* 上下グラデーション */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent via-50% to-white" />
                </div>
              </div>

              <div className="relative z-10 space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 bg-slate-100/90 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto text-slate-600 shadow-2xs backdrop-blur-xs">
                  <FileWarning size={28} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base md:text-xl font-serif font-bold text-slate-800">
                    該当するボトルメールが見つかりませんでした
                  </h3>
                  <p className="text-xs md:text-sm font-serif text-slate-600 leading-relaxed">
                    まだボトルが届いていないか、異なる表現で投稿されている可能性があります。<br />
                    ひらがな、旧姓、または都道府県のみで再検索をお試しいただくか、<b>「新着通知」</b>をご登録ください。
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAlertMessage(null);
                      setIsAlertModalOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer font-sans active:scale-98"
                  >
                    <Bell size={14} />
                    <span>あなたを探す手紙が届いたらメールで通知を受け取る ✨</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <p className="text-xs text-brand-dark/70 font-serif">
                該当する手紙： <span className="font-bold text-brand-primary text-sm">{posts.length}</span> 通
                <span className="ml-2 text-brand-dark/40 font-sans">
                  ({currentPage} / {totalPages} ページ目 - 1ページ上限20件)
                </span>
              </p>
              <div className="text-[11px] font-sans text-brand-dark/50">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} 〜 {Math.min(currentPage * ITEMS_PER_PAGE, posts.length)} 件目を表示中
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedPosts.map((post: any) => (
                <Link 
                  key={post.id}
                  to={getPostUrl(post)}
                  className="p-6 block hover:-translate-y-1 hover:shadow-xl transition-all border-2 border-slate-300 hover:border-teal-600 duration-300 rounded-3xl space-y-3 bg-white group text-left shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest block bg-brand-primary/5 border border-brand-primary/10 px-2 py-0.5 rounded-full w-fit font-sans">
                          {post.era?.toString().startsWith('19') ? post.era : `19${post.era}`}年代 / {post.category === 'friend' ? '同級生・友人' : post.category === 'love' ? '初恋・他' : 'その他'}
                        </span>
                        {!!post.is_author_ekyc_verified && (
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit font-sans flex items-center gap-0.5">
                            🛡️ 本人確認済
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-serif font-bold text-brand-dark group-hover:text-brand-primary transition-all">
                        {post.target_name} 様
                      </h3>
                    </div>
                    <span className="text-[10px] text-brand-dark/40 font-mono">
                      {new Date(post.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-xs text-brand-dark/70 font-sans leading-relaxed line-clamp-2">
                    ゆかりの地: {post.target_hometown ? (post.target_hometown.match(/.*?[都道府県]/)?.[0] || post.target_hometown) : '未特定'} (市区町村以下は非公開) / 所属：{post.target_school ? (post.category === 'work' ? '関連職場（正解後に開示）' : '関連学校（正解後に開示）') : '未設定'}<br/>
                    差し出し: {post.searcher_name}<br/>
                    「{post.searcher_profile}」
                  </p>
                </Link>
              ))}
            </div>

            {/* 50件超過時のページネーションコントロール */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div className="text-xs text-brand-dark/60">
                  全 {posts.length} 件中 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, posts.length)} 件を表示
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 border border-brand-border bg-white rounded-xl text-xs font-bold text-brand-dark hover:bg-brand-light/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
                  >
                    ← 前へ
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                      <button
                        key={pNum}
                        onClick={() => {
                          setCurrentPage(pNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pNum
                            ? 'bg-[#3B627F] text-white shadow-xs'
                            : 'bg-white border border-brand-border text-brand-dark hover:bg-brand-light/20'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 border border-brand-border bg-white rounded-xl text-xs font-bold text-brand-dark hover:bg-brand-light/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
                  >
                    次へ →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔔 新着通知（入荷アラート）登録モーダル */}
      <AnimatePresence>
        {isAlertModalOpen && (
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
                onClick={() => setIsAlertModalOpen(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>

              <div className="p-6 md:p-8 space-y-5">
                {alertSuccess ? (
                  <div className="text-center py-4 space-y-5 font-sans">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-inner">
                      <CheckCircle2 size={36} />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wider font-sans">
                        ✓ 登録完了
                      </span>
                      <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900">
                        新着手紙のメール通知を登録しました！
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                        探したい人【<span className="font-bold text-teal-800">{alertForm.targetName || 'あなた'}</span>】宛ての新着ボトルメールが海に流された際、ご登録のメールアドレス宛てに自動でお知らせいたします。
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-left space-y-1.5 text-xs text-slate-700 font-sans">
                      <p className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">🔔 通知条件:</span>
                        <span>{alertForm.targetName || '指定なし'} {alertForm.targetHometown ? `(${alertForm.targetHometown})` : ''}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        ※ 登録内容はマイアカウント（`/account`）の「通知・受信ログ」からいつでも確認・解除できます。
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAlertModalOpen(false);
                          setAlertSuccess(false);
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                      >
                        <span>閉じて検索を続ける</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/80">
                        <Bell size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-sans">
                          Email Alert
                        </span>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 mt-0.5">
                          新着手紙のメール通知（入荷アラート）
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      あなたのお名前やゆかりの地域に該当する新着ボトルメールが投函された際、システムから自動メールでお知らせします。お相手にメールアドレスが開示されることはありません。
                    </p>

                    <form onSubmit={handleAlertSubmit} className="space-y-4 text-left font-sans">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-700 block">探したい人のお名前（あなたなど / 必須）</label>
                          <input 
                            type="text" 
                            required
                            placeholder="例：山田 太郎"
                            className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                            value={alertForm.targetName}
                            onChange={e => setAlertForm(prev => ({ ...prev, targetName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-700 block">通知先メールアドレス（必須）</label>
                          <input 
                            type="email" 
                            required
                            placeholder="your-email@example.com"
                            className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                            value={alertForm.email}
                            onChange={e => setAlertForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-700 block">ゆかりの地（任意）</label>
                          <input 
                            type="text" 
                            placeholder="例：神奈川県横浜市"
                            className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-black focus:bg-white focus:border-brand-primary outline-none transition-all"
                            value={alertForm.targetHometown}
                            onChange={e => setAlertForm(prev => ({ ...prev, targetHometown: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-700 block">年代（任意）</label>
                          <select
                            className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-xs bg-slate-50 text-neutral-800 focus:bg-white focus:border-brand-primary outline-none transition-all"
                            value={alertForm.era}
                            onChange={e => setAlertForm(prev => ({ ...prev, era: e.target.value }))}
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
                            value={alertForm.category}
                            onChange={e => setAlertForm(prev => ({ ...prev, category: e.target.value }))}
                          >
                            <option value="">指定なし</option>
                            <option value="friend">同級生・友人</option>
                            <option value="love">初恋・元恋人</option>
                            <option value="work">元同僚・仕事仲間</option>
                            <option value="other">その他</option>
                          </select>
                        </div>
                      </div>

                      {alertMessage && (
                        <div className={`p-3.5 rounded-xl text-xs font-bold ${alertMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {alertMessage.text}
                        </div>
                      )}

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAlertModalOpen(false)}
                          className="px-5 py-3 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                        >
                          キャンセル
                        </button>
                        <button 
                          type="submit" 
                          disabled={alertSubmitting}
                          className="flex-1 py-3 text-xs font-bold bg-gradient-to-r from-teal-700 to-indigo-800 hover:from-teal-800 hover:to-indigo-900 text-white rounded-xl shadow-md transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {alertSubmitting ? '登録処理中...' : 'メール通知を登録する ✨'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SuccessStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPost?: any;
  initialRole?: 'sender' | 'receiver' | 'general';
  onSuccess?: () => void;
}

export const SuccessStoryModal = ({
  isOpen,
  onClose,
  initialPost,
  initialRole = 'general',
  onSuccess
}: SuccessStoryModalProps) => {
  const { user, token } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<'sender' | 'receiver' | 'general'>(initialRole);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [era, setEra] = useState('');
  const [gender, setGender] = useState('');
  const [consent, setConsent] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPost) {
        const postEra = initialPost.era ? (initialPost.era.toString().startsWith('19') ? initialPost.era : `19${initialPost.era}`) : '';
        setEra(postEra);
        setRole(initialRole || (user?.id === initialPost.user_id ? 'sender' : 'receiver'));
        if (initialPost.target_name) {
          setTitle(`【再会報告】${initialPost.target_name} 様との再会`);
        }
      } else {
        setRole(initialRole || 'general');
      }
      setSubmitted(false);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, initialPost, initialRole, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message,
          era: era || null,
          gender: gender || null,
          consent: isPublic ? (consent ? 1 : 0) : 0,
          post_id: initialPost?.id || null,
          role,
          title: title.trim() || null,
          target_name: initialPost?.target_name || null
        })
      });
      if (res.ok) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        const data = await res.json();
        alert(data.error || '送信に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。接続を確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[1000] flex items-start justify-center p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs font-sans"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-[32px] my-4 md:my-8 overflow-hidden shadow-2xl border border-slate-200 text-black animate-fade-in"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-brand-primary">
                <Sparkles size={20} className="text-amber-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700">Miracle Story & Thanks</span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900">奇跡の再会報告・感謝メッセージ</h2>
              <p className="text-xs text-slate-500 font-sans">
                差出人・受取人双方の感動のエピソードや、運営スタッフへの温かいメッセージをお寄せください。
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {!token ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600 mx-auto">
                <Sparkles size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-serif font-bold text-slate-900">ログインしてエピソードを投稿</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-sans">
                  再会ストーリーをご投稿いただくには、無料会員登録またはログインが必要です。
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Link 
                  to="/login?redirect=/account" 
                  onClick={onClose}
                  className="btn-primary text-xs px-6 py-3"
                >
                  ログイン画面へ
                </Link>
                <Link 
                  to="/register" 
                  onClick={onClose}
                  className="btn-secondary text-xs px-6 py-3 bg-white"
                >
                  無料新規登録
                </Link>
              </div>
            </div>
          ) : !submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* 対象の手紙情報が渡されている場合のコンテキストカード */}
              {initialPost && (
                <div className="p-4 bg-gradient-to-r from-amber-50/80 to-emerald-50/80 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Mail size={11} className="text-amber-700" />
                      <span>対象のボトルお手紙と自動連携中</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">ID: #{initialPost.id}</span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-serif font-bold text-slate-900">
                      {initialPost.target_name} 様 宛てのお手紙（{initialPost.era ? (initialPost.era.toString().startsWith('19') ? initialPost.era : `19${initialPost.era}`) : '当時'}年頃）
                    </h4>
                    {initialPost.searcher_profile && (
                      <p className="text-[11px] text-slate-600 truncate">
                        手がかり: 「{initialPost.searcher_profile}」
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 投稿者の立場（ロール）の選択 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>あなたの立場（視点）</span>
                  <span className="text-[10px] text-slate-400 font-normal">※該当するものを選択</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('sender')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      role === 'sender'
                        ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Send size={15} className={role === 'sender' ? 'text-teal-600' : 'text-slate-400'} />
                    <span>🍾 差出人側</span>
                    <span className="text-[9px] font-normal text-slate-400">手紙を流した人</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('receiver')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      role === 'receiver'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <MessageSquare size={15} className={role === 'receiver' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>📩 受取人側</span>
                    <span className="text-[9px] font-normal text-slate-400">手紙を見つけた人</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('general')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      role === 'general'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Heart size={15} className={role === 'general' ? 'text-amber-600' : 'text-slate-400'} />
                    <span>✨ 一般・その他</span>
                    <span className="text-[9px] font-normal text-slate-400">再会全般の感謝</span>
                  </button>
                </div>
              </div>

              {/* タイトル / 見出し（任意） */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>エピソードのタイトル（一言見出し）</span>
                  <span className="text-[10px] text-slate-400 font-normal">任意</span>
                </label>
                <input
                  type="text"
                  className="input-field py-2 text-xs"
                  placeholder={
                    role === 'sender'
                      ? '例：30年越しのボトルメールが親友に届いた奇跡の日'
                      : role === 'receiver'
                      ? '例：自分宛ての手紙を発見した時の震えるような感動'
                      : '例：ReMEETsを通じて恩師と再会できました'
                  }
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              {/* メインメッセージ */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>感謝・再会のメッセージ本文</span>
                  <span className="text-[10px] text-rose-500 font-bold">※必須</span>
                </label>
                <textarea 
                  required
                  className="input-field min-h-[140px] py-3 text-xs leading-relaxed font-serif" 
                  placeholder={
                    role === 'sender'
                      ? '例：中学卒業以来会えていなかった親友へボトルメールを流しました。最初は半信半疑でしたが、秘密のクイズに正解通知が届いた時は鳥肌が立ちました！今は昔のように連絡を取り合っています。このシステムを作ってくれた運営の皆様、本当にありがとうございました。'
                      : role === 'receiver'
                      ? '例：自分宛ての手紙が届いているのを発見した時は本当に驚きました。昔の思い出の質問（クイズ）に正解して連絡先が開通した瞬間、当時の記憶が一気に蘇り胸が熱くなりました。見つけてくれたお相手にも運営様にも心から感謝しています。'
                      : '例：ReMEETsを通じて懐かしい知人と再会を果たすことができました。温かい仕組みを作ってくださり本当に感謝しております。'
                  }
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              {/* 年代・性別 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">出会った・当時の年代</label>
                  <select 
                    className="input-field py-2 text-xs"
                    value={era}
                    onChange={e => setEra(e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="1960">1960年代</option>
                    <option value="1970">1970年代</option>
                    <option value="1980">1980年代</option>
                    <option value="1990">1990年代</option>
                    <option value="2000">2000年代</option>
                    <option value="2010">2010年代</option>
                    <option value="2020">2020年代</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">ご自身の性別</label>
                  <select 
                    className="input-field py-2 text-xs"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他・無回答</option>
                  </select>
                </div>
              </div>

              {/* 公開設定トグル */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block">掲載・送信の範囲設定</span>
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-800 font-sans cursor-pointer">
                    <input
                      type="radio"
                      name="publish_scope"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold flex items-center gap-1 text-amber-900">
                        <Sparkles size={12} className="text-amber-600" />
                        <span>✨ 「奇跡の再会報告（体験談）」として匿名掲載を希望</span>
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        トップページや体験談一覧に匿名化して掲載。今も誰かを探している方々への勇気と希望になります。
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 font-sans cursor-pointer pt-1 border-t border-slate-200/60">
                    <input
                      type="radio"
                      name="publish_scope"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                      className="mt-0.5 text-slate-600 focus:ring-slate-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold flex items-center gap-1 text-slate-700">
                        <Lock size={12} className="text-slate-500" />
                        <span>🔒 運営スタッフへの御礼メッセージとして送信（非公開）</span>
                      </span>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        サイト上には一切公開されず、運営管理者のみが拝読して励みにさせていただきます。
                      </p>
                    </div>
                  </label>
                </div>

                {isPublic && (
                  <div className="pt-2 border-t border-amber-200/60 flex items-start gap-2.5 text-[11px] text-amber-950 font-sans">
                    <input 
                      type="checkbox" 
                      id="consent"
                      className="mt-0.5 accent-amber-600"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                    />
                    <label htmlFor="consent" className="cursor-pointer leading-relaxed">
                      管理者が個人情報（本名・電話番号・詳細住所等）の保護審査および適切な匿名化（イニシャル処理）を行った上で掲載することに同意します。
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || !message.trim() || (isPublic && !consent)}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 group cursor-pointer text-xs font-bold shadow-md shadow-amber-900/10 disabled:opacity-50"
                >
                  <span>{submitting ? '送信中...' : isPublic ? '再会エピソードを届ける ✨' : '感謝メッセージを運営へ届ける 💌'}</span>
                  <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-slate-900">心温まるメッセージを承りました</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-sans">
                  貴重な体験談をお寄せいただき、誠にありがとうございます。<br />
                  {isPublic ? (
                    'あなたの再会の奇跡が、今も誰かを探している多くの方の希望の光になります。管理者の確認後に大切に掲載させていただきます。'
                  ) : (
                    'お送りいただいたメッセージは、運営スタッフ一同で大切に拝読させていただきます。'
                  )}
                </p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                    setTitle('');
                    onClose();
                  }} 
                  className="btn-secondary px-8 py-2.5 text-xs font-bold bg-white cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const ThankAdminModal = (props: any) => {
  return <SuccessStoryModal {...props} />;
};

