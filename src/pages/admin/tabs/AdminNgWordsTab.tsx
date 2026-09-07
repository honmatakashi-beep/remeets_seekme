import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {
  ShieldAlert, Zap, FileText, PlusCircle, Sparkles, Copy, Plus, Search, Trash2, RefreshCw, AlertTriangle, ShieldCheck,
  CheckCircle2, FileSpreadsheet, Upload, Download, Tag, Check, X, Filter
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AdminNgWordsTabProps {
  [key: string]: any;
}

export const AdminNgWordsTab: React.FC<AdminNgWordsTabProps> = (props) => {
    const {
    ngWords = [],
    newNgWord = "",
    setNewNgWord = () => {},
    newNgWordCategory = "all",
    setNewNgWordCategory = () => {},
    newNgWordSeverity = "high",
    setNewNgWordSeverity = () => {},
    ngWordSearch = "",
    setNgWordSearch = () => {},
    ngWordCategoryFilter = "all",
    setNgWordCategoryFilter = () => {},
    handleAddNgWord = () => {},
    handleDeleteNgWord = () => {},
    handleBatchAddNgWords = () => {},
    batchNgWordsText = "",
    setBatchNgWordsText = () => {},
    showBatchNgModal = false,
    setShowBatchNgModal = () => {},
    simulatorInputText = "",
    setSimulatorInputText = () => {},
    ngWordTypeFilter = "all",
    setNgWordTypeFilter = () => {},
    ngWordPage = 1,
    setNgWordPage = () => {},
    ngWordPerPage = 20,
    setNgWordPerPage = () => {},
    ngWordSearchTerm = "",
    setNgWordSearchTerm = () => {},
    selectedNgWordIds = [],
    setSelectedNgWordIds = () => {},
    handleBatchDeleteNgWords = () => {},
    isBatchUpdatingNgWords = false,
    isBulkAddModalOpen = false,
    setIsBulkAddModalOpen = () => {},
    bulkNgWordsText = "",
    setBulkNgWordsText = () => {}
  } = props;

  return (
            <div className="space-y-6 text-left font-sans animate-fade-in">
              {/* 1. 4大NGワードKPIサマリーカード */}
              {(() => {
                const isRegexWord = (w: string) => w.includes('[') || w.includes('\\') || w.includes('|') || w.includes('+') || w.includes('*') || w.includes('{') || w.includes('^') || w.includes('$');
                const regexCount = ngWords.filter(w => isRegexWord(w.word || '')).length;
                const plainCount = ngWords.length - regexCount;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">📋 登録NGワード総数</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <Tag size={16} />
                        </div>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-slate-800">{ngWords.length}</span>
                        <span className="text-xs text-slate-500">語</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 font-medium">現在有効な検閲ルール</div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md border border-indigo-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700">⚡ 正規表現ルール</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Zap size={16} />
                        </div>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-indigo-700">{regexCount}</span>
                        <span className="text-xs text-indigo-500 font-semibold">件</span>
                      </div>
                      <div className="mt-1 text-[11px] text-indigo-600 font-medium">高度パターン検知</div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md border border-teal-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-700">🔤 通常キーワード</span>
                        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                          <FileText size={16} />
                        </div>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-teal-700">{plainCount}</span>
                        <span className="text-xs text-teal-600 font-semibold">語</span>
                      </div>
                      <div className="mt-1 text-[11px] text-teal-600 font-medium">完全・部分一致単語</div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">🛡️ 検閲エンジン状態</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <ShieldCheck size={16} />
                        </div>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-emerald-700">常時稼働</span>
                        <span className="text-xs text-emerald-600 font-semibold">100%</span>
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-600 font-medium">投函・登録時リアルタイム適用</div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. リアルタイム検閲シミュレーター ＆ 新規ワード登録 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 新規ワード追加カード */}
                <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <PlusCircle size={16} className="text-brand-primary" />
                      <span>NGワード / 正規表現の追加</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsBulkAddModalOpen(true)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      📑 まとめて一括追加
                    </button>
                  </div>

                  <form onSubmit={handleAddNgWord} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNgWord}
                        onChange={(e) => setNewNgWord(e.target.value)}
                        placeholder="例: 死ね、LINE ID、\d{3}-\d{4}..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-mono"
                      />
                      <button
                        type="submit"
                        disabled={!newNgWord.trim()}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm shadow-slate-900/10 shrink-0"
                      >
                        追加
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ※ 通常の単語のほか、正規表現（例: <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{`\\d{2,4}-\\d{4}`}</code> や <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">死ね|殺す</code>）も自動認識されます。
                    </p>
                  </form>
                </div>

                {/* リアルタイム検閲シミュレーター */}
                <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-100/90 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-indigo-600" />
                      <span>リアルタイム検閲テストシミュレーター</span>
                    </h4>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      即時解析中
                    </span>
                  </div>

                  <input
                    type="text"
                    value={simulatorInputText}
                    onChange={(e) => setSimulatorInputText(e.target.value)}
                    placeholder="テストしたい文章を入力...（例: 私の電話番号は090-1234-5678で連絡先はLINE IDです）"
                    className="w-full bg-slate-50 border border-indigo-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                  />

                  {(() => {
                    if (!simulatorInputText.trim()) {
                      return (
                        <div className="p-3 bg-slate-50/60 rounded-xl text-center text-xs text-slate-400">
                          上の入力欄にテスト文章を入力すると、検知されたNGワードと伏字変換結果がここに表示されます。
                        </div>
                      );
                    }

                    // Run local simulation
                    let simulatedOutput = simulatorInputText;
                    const matchedWords: string[] = [];

                    ngWords.forEach(w => {
                      if (!w.word) return;
                      const word = w.word;
                      const isRegex = word.includes('[') || word.includes('\\') || word.includes('|') || word.includes('+') || word.includes('*');
                      if (isRegex) {
                        try {
                          const regex = new RegExp(word, 'gi');
                          if (regex.test(simulatedOutput)) {
                            matchedWords.push(word);
                            simulatedOutput = simulatedOutput.replace(regex, '***');
                          }
                        } catch (e) {}
                      } else {
                        if (simulatedOutput.includes(word)) {
                          matchedWords.push(word);
                          simulatedOutput = simulatedOutput.split(word).join('***');
                        }
                      }
                    });

                    return (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="text-slate-500 font-bold text-[11px]">検知結果:</span>
                          {matchedWords.length > 0 ? (
                            matchedWords.map((mw, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                🚫 {mw}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✅ NGワード非検知（安全）
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 bg-slate-900 text-white rounded-xl text-xs font-mono break-all flex items-start gap-2">
                          <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0 mt-0.5">変換後:</span>
                          <span className="text-emerald-300 font-medium">{simulatedOutput}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 3. メインデータカード */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
                {/* Header */}
                <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>NGワード ＆ 禁止表現辞書一覧</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          全 {ngWords.length} 件
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ユーザー投稿・メッセージ送信・プロフィール登録時に自動適用される伏字フィルター辞書
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const headers = ["ID", "ワード/パターン", "種別", "登録日時"];
                        const rows = ngWords.map(w => {
                          const isRegex = (w.word || '').includes('[') || (w.word || '').includes('\\') || (w.word || '').includes('|') || (w.word || '').includes('+') || (w.word || '').includes('*');
                          return [
                            w.id,
                            `"${(w.word || '').replace(/"/g, '""')}"`,
                            isRegex ? '正規表現' : '通常単語',
                            `"${new Date(w.created_at || Date.now()).toLocaleString().replace(/"/g, '""')}"`
                          ];
                        });
                        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `ng_words_dictionary_${new Date().toISOString().split('T')[0]}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>NGワード辞書 CSV 出力</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Type Tabs */}
                    {(() => {
                      const isRegexWord = (w: string) => w.includes('[') || w.includes('\\') || w.includes('|') || w.includes('+') || w.includes('*') || w.includes('{') || w.includes('^') || w.includes('$');
                      const regexCount = ngWords.filter(w => isRegexWord(w.word || '')).length;
                      const plainCount = ngWords.length - regexCount;

                      return (
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                          {[
                            { id: 'all', label: 'すべて', count: ngWords.length },
                            { id: 'regex', label: '⚡ 正規表現', count: regexCount },
                            { id: 'plain', label: '🔤 通常ワード', count: plainCount },
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => { setNgWordTypeFilter(t.id as any); setNgWordPage(1); }}
                              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                ngWordTypeFilter === t.id
                                  ? 'bg-white text-slate-900 shadow-sm font-extrabold border border-slate-200/60'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                              }`}
                            >
                              <span>{t.label}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                ngWordTypeFilter === t.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {t.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-bold">表示件数:</span>
                      <select
                        value={ngWordPerPage}
                        onChange={(e) => { setNgWordPerPage(Number(e.target.value)); setNgWordPage(1); }}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 font-bold focus:outline-none focus:border-brand-primary"
                      >
                        <option value={15}>15件</option>
                        <option value={30}>30件</option>
                        <option value={50}>50件</option>
                        <option value={9999}>全件</option>
                      </select>
                    </div>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={ngWordSearchTerm}
                      onChange={(e) => { setNgWordSearchTerm(e.target.value); setNgWordPage(1); }}
                      placeholder="NGワードや正規表現パターンで検索..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary transition-all font-medium"
                    />
                    {ngWordSearchTerm && (
                      <button
                        type="button"
                        onClick={() => { setNgWordSearchTerm(''); setNgWordPage(1); }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Batch Action Bar */}
                  {ngWords.length > 0 && (
                    <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={ngWords.length > 0 && ngWords.every(w => selectedNgWordIds.includes(w.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNgWordIds(ngWords.map(w => w.id));
                            } else {
                              setSelectedNgWordIds([]);
                            }
                          }}
                          className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          全選択 ({selectedNgWordIds.length} / {ngWords.length}件 選択中)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBatchDeleteNgWords}
                          disabled={selectedNgWordIds.length === 0 || isBatchUpdatingNgWords}
                          className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        >
                          <Trash2 size={13} />
                          <span>選択したワードを一括削除 ({selectedNgWordIds.length})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Table Component */}
                <div className="overflow-x-auto">
                  {(() => {
                    const isRegexWord = (w: string) => w.includes('[') || w.includes('\\') || w.includes('|') || w.includes('+') || w.includes('*') || w.includes('{') || w.includes('^') || w.includes('$');

                    const filtered = ngWords.filter(w => {
                      const isRegex = isRegexWord(w.word || '');
                      if (ngWordTypeFilter === 'regex' && !isRegex) return false;
                      if (ngWordTypeFilter === 'plain' && isRegex) return false;

                      if (ngWordSearchTerm.trim()) {
                        const q = ngWordSearchTerm.toLowerCase();
                        if (!(w.word || '').toLowerCase().includes(q)) return false;
                      }
                      return true;
                    });

                    const totalPages = Math.ceil(filtered.length / ngWordPerPage) || 1;
                    const currentPage = Math.min(ngWordPage, totalPages);
                    const paginated = filtered.slice((currentPage - 1) * ngWordPerPage, currentPage * ngWordPerPage);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-12 text-center text-slate-400">
                          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                          <p className="text-sm font-bold text-slate-700">該当するNGワードはありません</p>
                          <p className="text-xs text-slate-400 mt-1">検索条件を変更するか、新しいワードを追加してください</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              <th className="w-8 px-3 py-2.5"></th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ID</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">種別</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">ワード / 正規表現パターン</th>
                              <th className="px-3 py-2.5 whitespace-nowrap">登録日時</th>
                              <th className="px-3 py-2.5 text-right whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {paginated.map(word => {
                              const isChecked = selectedNgWordIds.includes(word.id);
                              const isRegex = isRegexWord(word.word || '');

                              return (
                                <tr key={word.id} className="h-12 hover:bg-slate-50/70 transition-colors group">
                                  <td className="px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedNgWordIds(prev => [...prev, word.id]);
                                        } else {
                                          setSelectedNgWordIds(prev => prev.filter(id => id !== word.id));
                                        }
                                      }}
                                      className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                                    />
                                  </td>

                                  {/* 1. ID */}
                                  <td className="px-3 py-2 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                                    #{word.id}
                                  </td>

                                  {/* 2. Type Badge */}
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isRegex 
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                                        : 'bg-teal-50 text-teal-700 border-teal-200'
                                    }`}>
                                      {isRegex ? <Zap size={10} /> : <FileText size={10} />}
                                      <span>{isRegex ? '正規表現' : '通常単語'}</span>
                                    </span>
                                  </td>

                                  {/* 3. Word / Pattern */}
                                  <td className="px-3 py-2 text-slate-800">
                                    <div className="flex items-center gap-2">
                                      <code className="px-2 py-1 bg-slate-100 text-slate-900 rounded-lg text-xs font-mono font-bold border border-slate-200/60">
                                        {word.word}
                                      </code>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(word.word);
                                          alert(`コピーしました: ${word.word}`);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 text-slate-500 rounded transition-all cursor-pointer"
                                        title="クリップボードにコピー"
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>
                                  </td>

                                  {/* 4. Created At */}
                                  <td className="px-3 py-2 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                    {word.created_at ? new Date(word.created_at).toLocaleString('ja-JP', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }) : '-'}
                                  </td>

                                  {/* 5. Action */}
                                  <td className="px-3 py-2 text-right whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteNgWord(word.id)}
                                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                      title="このNGワードを削除"
                                    >
                                      削除
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Pagination Bar */}
                        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                          <div className="text-slate-500 font-medium">
                            全 <span className="font-bold text-slate-800">{filtered.length}</span> 件中{' '}
                            <span className="font-bold text-slate-800">{(currentPage - 1) * ngWordPerPage + 1}</span> 〜{' '}
                            <span className="font-bold text-slate-800">{Math.min(currentPage * ngWordPerPage, filtered.length)}</span> 件を表示
                          </div>

                          {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setNgWordPage(1)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &laquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setNgWordPage(prev => Math.max(prev - 1, 1))}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &lsaquo;
                              </button>
                              
                              <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold">
                                {currentPage} / {totalPages}
                              </span>

                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setNgWordPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &rsaquo;
                              </button>
                              <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setNgWordPage(totalPages)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold"
                              >
                                &raquo;
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* まとめて一括追加（Bulk Add）モーダル */}
              <AnimatePresence>
                {isBulkAddModalOpen && (
                  <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" data-lenis-prevent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsBulkAddModalOpen(false)}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
                    >
                      <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <PlusCircle size={18} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-800">NGワードの一括追加</h3>
                            <p className="text-xs text-slate-500">改行区切りで複数のワードをまとめて登録できます</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBulkAddModalOpen(false)}
                          className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="p-5 space-y-3">
                        <label className="block text-xs font-bold text-slate-700">
                          登録したいNGワード（1行に1ワード入力）
                        </label>
                        <textarea
                          rows={8}
                          value={bulkNgWordsText}
                          onChange={(e) => setBulkNgWordsText(e.target.value)}
                          placeholder={"悪質ワード1\n悪質ワード2\n[0-9]{3}-[0-9]{4}\n脅迫単語"}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary font-mono"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            入力件数: <strong className="text-slate-800">{bulkNgWordsText.split('\n').filter(l => l.trim()).length}</strong> 件
                          </span>
                          <span>※ 既に存在するワードは自動的にスキップされます</span>
                        </div>
                      </div>

                      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsBulkAddModalOpen(false)}
                          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          onClick={handleBatchAddNgWords}
                          disabled={!bulkNgWordsText.trim() || isBatchUpdatingNgWords}
                          className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                        >
                          {isBatchUpdatingNgWords ? '登録中...' : `まとめて ${bulkNgWordsText.split('\n').filter(l => l.trim()).length} 件を登録`}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
  );
};
