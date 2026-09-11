import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  ChevronLeft,  Copy, Database, Server, Info, History as HistoryIcon, HardDrive, PlusCircle, GitBranch, Camera, Search, Download, FileSpreadsheet,
  GitCommit, Plus, RefreshCw, Star, Tag, Clock, Sparkles, Check,
  AlertCircle, ChevronRight, CheckCircle2, Trash2, Edit3, ArrowRight, ShieldCheck
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminVersionsTabProps {
  [key: string]: any;
}

export const AdminVersionsTab: React.FC<AdminVersionsTabProps> = (props) => {
      const {
    dbVersions = [],
    gitInfo = null,
    setStatusMsg = () => {},
    newVersionComment = "",
    setNewVersionComment = () => {},
    handleCreateVersion = () => {},
    fetchGitInfo = () => {},
    fetchDbVersions = () => {},
    isLoadingGitInfo = false,
    handleExportVersionsCsv = () => {},
    isCreatingVersion = false,
    versionTypeFilter = "all",
    setVersionTypeFilter = () => {},
    versionCurrentPage = 1,
    setVersionCurrentPage = () => {},
    versionItemsPerPage = 10,
    setVersionItemsPerPage = () => {},
    versionSearchQuery = "",
    setVersionSearchQuery = () => {},
    selectedVersionIds = [],
    setSelectedVersionIds = () => {},
    handleBatchDeleteVersions = () => {},
    isBatchDeletingVersions = false,
    handleToggleSelectAllVersions = () => {},
    handleToggleSelectVersion = () => {},
    handleRestoreVersion = () => {},
    handleDownloadVersion = () => {},
    handleDeleteVersion = () => {},
    token,
    showToast
  } = props;


              const enrichedVersions = dbVersions.map((v, index) => {
                const isPreRestore = (v.comment || '').includes('復元前自動バックアップ');
                return {
                  ...v,
                  versionNumber: dbVersions.length - index,
                  isPreRestore,
                  sizeMb: v.size ? (v.size / (1024 * 1024)).toFixed(3) : '0'
                };
              });

              const totalCount = enrichedVersions.length;
              const preRestoreCount = enrichedVersions.filter(v => v.isPreRestore).length;
              const manualCount = totalCount - preRestoreCount;
              const totalSizeBytes = enrichedVersions.reduce((acc, v) => acc + (v.size || 0), 0);
              const totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);
              const latestTimestamp = enrichedVersions.length > 0 ? enrichedVersions[0].timestamp : null;

              const filteredVersions = enrichedVersions.filter(v => {
                if (versionTypeFilter === 'manual' && v.isPreRestore) return false;
                if (versionTypeFilter === 'pre_restore' && !v.isPreRestore) return false;
                if (versionSearchQuery.trim()) {
                  const q = versionSearchQuery.toLowerCase();
                  const matchText = `${v.comment || ''} ${v.filename || ''} ${v.git_commit || ''} ${v.git_branch || ''} ${v.id || ''}`.toLowerCase();
                  if (!matchText.includes(q)) return false;
                }
                return true;
              });

              // Pagination
              const totalPages = Math.max(1, Math.ceil(filteredVersions.length / versionItemsPerPage));
              const safeCurrentPage = Math.min(versionCurrentPage, totalPages);
              const startIndex = (safeCurrentPage - 1) * versionItemsPerPage;
              const paginatedVersions = filteredVersions.slice(startIndex, startIndex + versionItemsPerPage);
              const currentPageIds = paginatedVersions.map(v => v.id);
              const isAllPageSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedVersionIds.includes(id));

              // Format uptime
              const formatUptime = (sec: number = 0) => {
                const days = Math.floor(sec / 86400);
                const hours = Math.floor((sec % 86400) / 3600);
                const mins = Math.floor((sec % 3600) / 60);
                if (days > 0) return `${days}日 ${hours}時間 ${mins}分`;
                if (hours > 0) return `${hours}時間 ${mins}分`;
                return `${mins}分 ${sec % 60}秒`;
              };

              return (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="glass-card p-6 rounded-3xl border border-brand-border/60 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary uppercase tracking-widest border border-brand-primary/20">
                          Git Runtime Inspector & Database Snapshots
                        </span>
                        {gitInfo?.commit && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Git: {gitInfo.commit}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-brand-dark">
                        稼働コード確認 ＆ DBスナップショット管理 (Versions)
                      </h2>
                      <p className="text-xs md:text-sm text-brand-dark/70 font-sans max-w-3xl">
                        現在実際に稼働しているGitソースコードの情報（ブランチ・コミット）を常時モニタリング。さらにそのGitコミット時点のDB全データ（会員・ボトル・eKYC・決済）をスナップショット保存し、運用メモと共に安全にロールバック・ダウンロードできます。
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={handleExportVersionsCsv}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-brand-border text-brand-dark text-xs font-bold hover:bg-brand-light/50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        title="バックアップ台帳をCSVファイルでダウンロードします"
                      >
                        <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
                        <span className="whitespace-nowrap">CSV出力</span>
                      </button>
                      <button
                        onClick={() => {
                          fetchDbVersions();
                          fetchGitInfo();
                        }}
                        className="p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark hover:bg-brand-light/50 transition-colors shadow-xs cursor-pointer shrink-0"
                        title="Git情報および最新のバージョン履歴を取得"
                      >
                        <RefreshCw size={14} className={cn(isLoadingGitInfo && "animate-spin text-brand-primary")} />
                      </button>
                    </div>
                  </div>

                  {/* 🌐 Git Runtime Inspector Hero Card */}
                  <div className="p-6 rounded-3xl border border-brand-border/80 bg-gradient-to-br from-white via-brand-light/30 to-slate-50 text-brand-dark shadow-xs relative overflow-hidden">
                    <div className="space-y-5">
                      {/* Top Bar of Git Inspector */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 shadow-xs">
                            <GitBranch size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-brand-dark/60 tracking-wider uppercase">現在稼働中のGitブランチ</span>
                              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {gitInfo?.branch || 'main'}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                {gitInfo?.appVersion || 'v1.2.4-RELEASE'}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-brand-dark mt-1 flex items-center gap-2">
                              <span>稼働コミット:</span>
                              <span className="font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-300 font-bold">
                                {gitInfo?.commit || '確認中...'}
                              </span>
                              {gitInfo?.commit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(gitInfo.commitHash || gitInfo.commit);
                                    setStatusMsg({ type: 'success', text: `コミットハッシュ "${gitInfo.commit}" をコピーしました` });
                                    setTimeout(() => setStatusMsg(null), 3000);
                                  }}
                                  className="p-1.5 text-brand-dark/50 hover:text-brand-dark hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                                  title="フルコミットハッシュをコピー"
                                >
                                  <Copy size={14} />
                                </button>
                              )}
                            </h3>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-brand-border/80 text-brand-dark flex items-center gap-1.5 shadow-2xs">
                            <Clock size={13} className="text-sky-600 shrink-0" />
                            <span className="text-brand-dark/60">稼働時間:</span>
                            <span className="font-mono font-bold text-brand-dark">{formatUptime(gitInfo?.uptimeSec)}</span>
                          </div>
                          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-brand-border/80 text-brand-dark flex items-center gap-1.5 shadow-2xs">
                            <Database size={13} className="text-amber-600 shrink-0" />
                            <span className="text-brand-dark/60">DB容量:</span>
                            <span className="font-mono font-bold text-brand-dark">
                              {gitInfo?.dbSizeBytes ? (gitInfo.dbSizeBytes / (1024 * 1024)).toFixed(2) : '0.00'} MB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Commit Message & Runtime specs */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                        <div className="md:col-span-8 p-4 rounded-2xl bg-white border border-brand-border/80 space-y-2 shadow-2xs">
                          <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider flex items-center gap-1.5">
                            <GitCommit size={14} className="text-emerald-600 shrink-0" />
                            <span>最新コミット内容 (Latest Commit Message)</span>
                          </div>
                          <p className="text-xs sm:text-sm font-mono font-bold text-brand-dark truncate bg-slate-50 p-2.5 rounded-xl border border-slate-200" title={gitInfo?.commitMessage || 'No message'}>
                            {gitInfo?.commitMessage || 'コミットメッセージ取得中...'}
                          </p>
                          <div className="text-[11px] text-brand-dark/60 flex items-center gap-3 flex-wrap pt-0.5">
                            {gitInfo?.commitAuthor && <span>コミッター: <b className="text-brand-dark font-medium">{gitInfo.commitAuthor}</b></span>}
                            {gitInfo?.commitDate && <span>日時: <b className="text-brand-dark font-medium">{new Date(gitInfo.commitDate).toLocaleString('ja-JP')}</b></span>}
                          </div>
                        </div>

                        {/* System Specs Pill */}
                        <div className="md:col-span-4 p-4 rounded-2xl bg-white border border-brand-border/80 space-y-2 shadow-2xs flex flex-col justify-center">
                          <div className="text-[11px] font-bold text-brand-dark/60 uppercase tracking-wider flex items-center gap-1.5">
                            <Server size={14} className="text-purple-600 shrink-0" />
                            <span>実行ランタイム環境</span>
                          </div>
                          <div className="text-xs font-mono text-brand-dark space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center">
                              <span className="text-brand-dark/60">Node.js:</span>
                              <span className="font-bold text-brand-dark">{gitInfo?.nodeVersion || 'v20.x'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-brand-dark/60">OS Platform:</span>
                              <span className="font-bold text-brand-dark">{gitInfo?.platform || 'darwin'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Guide Banner */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2.5 shadow-2xs">
                        <Info size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-emerald-900">💡 GitとDBスナップショットの役割分担について:</span>
                          <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                            <b>Git</b> はプログラムコード（画面やロジック）のバージョンを管理しています。一方、会員情報や想い出ボトル・本人確認・決済データなどの実データは <b>データベース（SQLite）</b> に保存されています。本機能では、スナップショット保存時に「どのGitコミットの時のデータか」を自動記録し、不具合発生時にも安全に指定バージョンへロールバックできるように設計されています。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Card KPI Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    {/* Total Versions */}
                    <div className="p-4 rounded-2xl border bg-white border-brand-border/80 text-brand-dark shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 whitespace-nowrap">総スナップショット数</span>
                        <HistoryIcon size={16} className="text-brand-primary" />
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold">{totalCount}</div>
                      <div className="text-[10px] mt-1 opacity-70 whitespace-nowrap">保存済み世代数</div>
                    </div>

                    {/* Latest Snapshot Time */}
                    <div className="p-4 rounded-2xl border bg-white border-brand-border/80 text-brand-dark shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 whitespace-nowrap">最新バックアップ</span>
                        <Clock size={16} className="text-emerald-600" />
                      </div>
                      <div className="text-sm md:text-base font-serif font-bold truncate">
                        {latestTimestamp ? new Date(latestTimestamp).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '未保存'}
                      </div>
                      <div className="text-[10px] mt-1 opacity-70 whitespace-nowrap">最終更新日時</div>
                    </div>

                    {/* Active Git Commit */}
                    <div className="p-4 rounded-2xl border bg-white border-brand-border/80 text-brand-dark shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 whitespace-nowrap">稼働中Gitコミット</span>
                        <GitCommit size={16} className="text-emerald-600" />
                      </div>
                      <div className="text-lg md:text-xl font-mono font-bold text-emerald-900 truncate">
                        {gitInfo?.commit || '-'}
                      </div>
                      <div className="text-[10px] mt-1 opacity-70 whitespace-nowrap">ブランチ: {gitInfo?.branch || 'main'}</div>
                    </div>

                    {/* Total Disk Size */}
                    <div className="p-4 rounded-2xl border bg-white border-brand-border/80 text-brand-dark shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 whitespace-nowrap">バックアップ総容量</span>
                        <HardDrive size={16} className="text-sky-600" />
                      </div>
                      <div className="text-2xl md:text-3xl font-serif font-bold text-sky-950">{totalSizeMb} <span className="text-sm font-normal">MB</span></div>
                      <div className="text-[10px] mt-1 opacity-70 whitespace-nowrap">ディスク使用量</div>
                    </div>
                  </div>

                  {/* Create Snapshot Panel */}
                  <div className="glass-card p-5 rounded-2xl border border-brand-border shadow-xs bg-gradient-to-r from-brand-light/40 to-white">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                        <PlusCircle size={14} className="text-brand-primary" />
                        <span>現在の状態でスナップショットを即時作成</span>
                      </h3>
                      {gitInfo?.commit && (
                        <span className="text-[11px] text-brand-dark/60 font-mono flex items-center gap-1">
                          <GitBranch size={12} className="text-emerald-600" />
                          連動記録コミット: <b className="text-emerald-700">{gitInfo.commit}</b> ({gitInfo.branch})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <input 
                        type="text"
                        placeholder="スナップショットの解説・運用メモ（例: 本番デプロイ前退避、問い合わせデータ復元後など）..."
                        value={newVersionComment}
                        onChange={(e) => setNewVersionComment(e.target.value)}
                        className="w-full flex-1 px-4 py-2.5 bg-white border border-brand-border rounded-xl text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-brand-dark placeholder:text-brand-dark/40"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await handleCreateVersion();
                          fetchGitInfo();
                        }}
                        disabled={isCreatingVersion}
                        className="w-full sm:w-auto px-5 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-bold hover:bg-brand-dark/90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isCreatingVersion ? (
                          <>
                            <RefreshCw size={13} className="animate-spin shrink-0" />
                            <span>スナップショット作成中...</span>
                          </>
                        ) : (
                          <>
                            <Camera size={13} className="shrink-0" />
                            <span>スナップショット保存</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar & Search Bar */}
                  <div className="glass-card p-4 rounded-2xl border border-brand-border space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      {/* Type Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                        <span className="text-[11px] font-bold text-brand-dark/50 uppercase tracking-wider mr-1 whitespace-nowrap shrink-0">種別:</span>
                        <button
                          onClick={() => { setVersionTypeFilter('all'); setVersionCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            versionTypeFilter === 'all'
                              ? "bg-brand-dark text-white shadow-xs"
                              : "bg-brand-light/60 text-brand-dark/70 hover:bg-brand-light"
                          )}
                        >
                          <span className="whitespace-nowrap">すべて</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-serif font-bold">{totalCount}</span>
                        </button>
                        <button
                          onClick={() => { setVersionTypeFilter('manual'); setVersionCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            versionTypeFilter === 'manual'
                              ? "bg-brand-primary text-white shadow-xs"
                              : "bg-brand-light/60 text-brand-dark/70 hover:bg-brand-light"
                          )}
                        >
                          <span className="whitespace-nowrap">📸 手動スナップショット</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-serif font-bold">{manualCount}</span>
                        </button>
                        <button
                          onClick={() => { setVersionTypeFilter('pre_restore'); setVersionCurrentPage(1); }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0",
                            versionTypeFilter === 'pre_restore'
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                          )}
                        >
                          <ShieldCheck size={12} className="shrink-0" />
                          <span className="whitespace-nowrap">復元前自動退避</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-purple-200 text-purple-800 text-[10px] font-serif font-bold">{preRestoreCount}</span>
                        </button>
                      </div>

                      {/* Items per page Selector */}
                      <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0 self-end sm:self-center">
                        <span className="text-[11px] text-brand-dark/50 font-bold whitespace-nowrap">表示件数:</span>
                        <select
                          value={versionItemsPerPage}
                          onChange={(e) => { setVersionItemsPerPage(Number(e.target.value)); setVersionCurrentPage(1); }}
                          className="px-2 py-1.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark outline-none focus:border-brand-primary cursor-pointer whitespace-nowrap"
                        >
                          <option value={10}>10件</option>
                          <option value={25}>25件</option>
                          <option value={50}>50件</option>
                          <option value={100}>100件</option>
                        </select>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="pt-2 border-t border-brand-border/50">
                      <div className="relative w-full">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                        <input
                          type="text"
                          value={versionSearchQuery}
                          onChange={(e) => { setVersionSearchQuery(e.target.value); setVersionCurrentPage(1); }}
                          placeholder="コメント・メモ・Gitコミット・ファイル名で検索..."
                          className="w-full pl-9 pr-8 py-2 bg-white border border-brand-border rounded-xl text-xs outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all text-brand-dark placeholder:text-brand-dark/40"
                        />
                        {versionSearchQuery && (
                          <button
                            onClick={() => { setVersionSearchQuery(''); setVersionCurrentPage(1); }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark text-xs cursor-pointer"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Floating Batch Actions Bar */}
                  {selectedVersionIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-brand-dark text-white rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-brand-border/20"
                    >
                      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-serif font-bold whitespace-nowrap">
                          {selectedVersionIds.length} 件選択中
                        </span>
                        <span className="text-xs text-white/70 hidden sm:inline whitespace-nowrap">
                          選択したスナップショットの一括操作:
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleBatchDeleteVersions}
                          disabled={isBatchDeletingVersions}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                        >
                          <Trash2 size={13} className="shrink-0" />
                          <span className="whitespace-nowrap">選択した履歴を一括削除</span>
                        </button>
                        <button
                          onClick={() => setSelectedVersionIds([])}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0"
                        >
                          選択解除
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Modern h-12 Table */}
                  <div className="glass-card overflow-hidden rounded-3xl border border-brand-border shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-brand-border bg-brand-light/70 h-10">
                            <th className="w-10 px-3 text-center align-middle">
                              <input
                                type="checkbox"
                                checked={isAllPageSelected}
                                onChange={() => handleToggleSelectAllVersions(currentPageIds)}
                                className="rounded border-brand-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                                title="このページの全件を選択/解除"
                              />
                            </th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">世代 #</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">種別</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle min-w-[240px]">コメント・運用メモ</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">連動Gitコミット</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">作成日時</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 whitespace-nowrap align-middle">容量</th>
                            <th className="px-3 text-[11px] font-bold uppercase tracking-widest text-brand-dark/75 text-right whitespace-nowrap align-middle pr-4">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60 font-sans">
                          {paginatedVersions.map(v => {
                            const isSelected = selectedVersionIds.includes(v.id);

                            return (
                              <tr 
                                key={v.id} 
                                className={cn(
                                  "h-12 transition-colors",
                                  isSelected
                                    ? "bg-brand-primary/10"
                                    : "hover:bg-brand-light/30"
                                )}
                              >
                                {/* Checkbox */}
                                <td className="px-3 text-center align-middle">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectVersion(v.id)}
                                    className="rounded border-brand-border text-brand-primary focus:ring-brand-primary/20 cursor-pointer"
                                  />
                                </td>

                                {/* Version Number */}
                                <td className="px-3 align-middle whitespace-nowrap">
                                  <span className="text-xs font-bold font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                                    #{v.versionNumber}
                                  </span>
                                </td>

                                {/* Type Badge */}
                                <td className="px-3 align-middle whitespace-nowrap">
                                  {v.isPreRestore ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-md text-[10px] font-bold whitespace-nowrap">
                                      <ShieldCheck size={11} className="shrink-0" />
                                      <span>自動退避</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold whitespace-nowrap">
                                      <Camera size={11} className="shrink-0" />
                                      <span>手動保存</span>
                                    </span>
                                  )}
                                </td>

                                {/* Comment & Details */}
                                <td className="px-3 align-middle max-w-[340px]">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-bold text-xs text-brand-dark truncate" title={v.comment}>
                                      {v.comment}
                                    </span>
                                    <span className="text-[10px] text-brand-dark/40 font-mono hidden md:inline truncate">
                                      ({v.filename})
                                    </span>
                                  </div>
                                </td>

                                {/* Git Commit Badge */}
                                <td className="px-3 align-middle whitespace-nowrap">
                                  {v.git_commit ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                                      <GitCommit size={11} className="text-emerald-600 shrink-0" />
                                      <span>{v.git_commit}</span>
                                      {v.git_branch && <span className="text-[9px] text-slate-500 font-normal">({v.git_branch})</span>}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-brand-dark/30 font-mono">-</span>
                                  )}
                                </td>

                                {/* Timestamp */}
                                <td className="px-3 align-middle text-[11px] text-brand-dark/75 font-mono whitespace-nowrap">
                                  {new Date(v.timestamp).toLocaleString('ja-JP', { 
                                    year: 'numeric',
                                    month: 'numeric', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </td>

                                {/* Size */}
                                <td className="px-3 align-middle text-[11px] text-brand-dark/80 font-mono whitespace-nowrap">
                                  {v.sizeMb} MB
                                </td>

                                {/* Actions */}
                                <td className="px-3 align-middle text-right whitespace-nowrap pr-4">
                                  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreVersion(v)}
                                      className="py-1 px-2.5 bg-brand-dark hover:bg-brand-primary text-white text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                                      title="このスナップショット時点へデータベースを復元（ロールバック）します"
                                    >
                                      <RefreshCw size={11} className="shrink-0" />
                                      <span className="whitespace-nowrap">この状態へ復元</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDownloadVersion(v)}
                                      className="p-1 rounded-lg text-brand-dark/60 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                                      title="このDBバックアップファイル(.db)をPCへダウンロード"
                                    >
                                      <Download size={13} className="shrink-0" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVersion(v)}
                                      className="p-1 rounded-lg text-brand-dark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                                      title="このバージョン履歴を削除"
                                    >
                                      <Trash2 size={13} className="shrink-0" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {paginatedVersions.length === 0 && (
                            <tr>
                              <td colSpan={8} className="py-16 text-center text-brand-dark/50 font-serif">
                                <div className="max-w-xs mx-auto space-y-2">
                                  <HistoryIcon size={32} className="mx-auto text-brand-dark/30" />
                                  <p className="text-sm font-bold text-brand-dark/80">該当するバージョン履歴はありません</p>
                                  <p className="text-xs text-brand-dark/50">上部のスナップショット保存ボタンから、現在の状態をバックアップしてください。</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar */}
                    {filteredVersions.length > 0 && (
                      <div className="p-3 bg-brand-light/40 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-dark/70">
                        <div className="font-serif text-[11px]">
                          全 <strong className="text-brand-dark font-serif font-bold">{filteredVersions.length}</strong> 件中 <span className="font-serif font-bold">{startIndex + 1}</span> - <span className="font-serif font-bold">{Math.min(startIndex + versionItemsPerPage, filteredVersions.length)}</span> 件を表示
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setVersionCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={safeCurrentPage === 1}
                              className="px-2.5 py-1 rounded-lg bg-white border border-brand-border font-bold text-xs hover:bg-brand-light transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              前へ
                            </button>
                            <div className="flex items-center gap-1 font-serif font-bold text-[11px] px-2">
                              <span>{safeCurrentPage}</span>
                              <span className="opacity-40">/</span>
                              <span>{totalPages}</span>
                            </div>
                            <button
                              onClick={() => setVersionCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={safeCurrentPage === totalPages}
                              className="px-2.5 py-1 rounded-lg bg-white border border-brand-border font-bold text-xs hover:bg-brand-light transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              次へ
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
  );
};
