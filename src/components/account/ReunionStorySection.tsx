import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, BookOpen, CheckCircle2, Mail, MessageSquare } from 'lucide-react';

interface ReunionStorySectionProps {
  mySubmittedStories: any[];
  storyCurrentPage: number;
  setStoryCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  STORIES_PER_PAGE?: number;
  onOpenStoryModal: (role?: 'sender' | 'receiver' | 'general') => void;
  defaultRole?: 'sender' | 'receiver' | 'general';
}

export const ReunionStorySection: React.FC<ReunionStorySectionProps> = ({
  mySubmittedStories = [],
  storyCurrentPage,
  setStoryCurrentPage,
  STORIES_PER_PAGE = 5,
  onOpenStoryModal,
  defaultRole = 'general'
}) => {
  const hasStories = mySubmittedStories.length > 0;

  return (
    <div className="p-5 sm:p-7 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white rounded-3xl border border-amber-200/90 shadow-2xs space-y-4 font-sans relative overflow-hidden">
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-300/60">
                Miracle Reunion
              </span>
              {hasStories && (
                <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                  投稿済み: {mySubmittedStories.length}件
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 mt-0.5">
              💌 奇跡の再会エピソード・感謝の声
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/success-stories"
            className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 hover:border-amber-300 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} className="text-amber-600" />
            <span>みんなの再会報告</span>
          </Link>
          <button
            type="button"
            onClick={() => onOpenStoryModal(defaultRole)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Heart size={14} className="fill-white/30 text-white" />
            <span>体験談を投稿する</span>
          </button>
        </div>
      </div>

      <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed font-sans">
        お相手と手紙が繋がり再会を果たされた際、お寄せいただいた温かいエピソードやお礼の言葉は、管理者が確認の上で「奇跡の再会報告」ページに大切に掲載されます。
      </p>

      {/* 投稿済みエピソード一覧（1件以上ある場合のみ展開） */}
      {hasStories && (
        <div className="pt-3 border-t border-amber-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 font-serif flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>あなたが投稿した再会エピソード ({mySubmittedStories.length}件)</span>
            </h4>
            <span className="text-[10px] text-amber-800/70 font-sans">
              ※管理者の確認後に掲載されます
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mySubmittedStories
              .slice((storyCurrentPage - 1) * STORIES_PER_PAGE, storyCurrentPage * STORIES_PER_PAGE)
              .map((story: any) => (
                <div key={story.id} className="p-3.5 bg-white rounded-2xl border border-amber-200/90 space-y-2 font-sans shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[9px]">
                        {story.role === 'sender' ? '📮 手紙を流した側' : story.role === 'receiver' ? '📬 手紙を見つけた側' : '💌 体験談'}
                      </span>
                      {story.target_name && (
                        <span className="text-[10px] text-amber-900/80 font-semibold truncate max-w-[120px]">
                          {story.target_name} 様
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {story.created_at ? new Date(story.created_at).toLocaleDateString('ja-JP') : ''}
                    </span>
                  </div>
                  {story.title && (
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1 font-serif">
                      {story.title}
                    </h5>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {story.message}
                  </p>
                </div>
              ))}
          </div>

          {/* ページネーション */}
          {Math.ceil(mySubmittedStories.length / STORIES_PER_PAGE) > 1 && (
            <div className="pt-2 flex items-center justify-between text-xs font-sans">
              <span className="text-[11px] text-slate-500">
                全 {mySubmittedStories.length} 件中 {(storyCurrentPage - 1) * STORIES_PER_PAGE + 1}〜{Math.min(storyCurrentPage * STORIES_PER_PAGE, mySubmittedStories.length)} 件を表示
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStoryCurrentPage(p => Math.max(1, p - 1))}
                  disabled={storyCurrentPage === 1}
                  className="px-2.5 py-1 bg-white border border-amber-200 text-amber-950 font-bold rounded-lg disabled:opacity-40 text-[11px] cursor-pointer hover:bg-amber-50 shadow-2xs"
                >
                  ← 前へ
                </button>
                <span className="px-2 text-[11px] font-bold text-amber-900 font-mono">
                  {storyCurrentPage} / {Math.ceil(mySubmittedStories.length / STORIES_PER_PAGE)}
                </span>
                <button
                  type="button"
                  onClick={() => setStoryCurrentPage(p => Math.min(Math.ceil(mySubmittedStories.length / STORIES_PER_PAGE), p + 1))}
                  disabled={storyCurrentPage === Math.ceil(mySubmittedStories.length / STORIES_PER_PAGE)}
                  className="px-2.5 py-1 bg-white border border-amber-200 text-amber-950 font-bold rounded-lg disabled:opacity-40 text-[11px] cursor-pointer hover:bg-amber-50 shadow-2xs"
                >
                  次へ →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
