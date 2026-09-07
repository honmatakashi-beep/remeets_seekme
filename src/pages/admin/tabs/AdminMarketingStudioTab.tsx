import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Video, BookOpen, Twitter, Copy, Check, Download,
  Save, Trash2, RefreshCw, Wand2, FileText,
  Film, Smartphone, Lightbulb, CheckCircle2,
  Eye, Code
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface PRDraft {
  id: string;
  type: "note_story" | "note_howto" | "shorts_script" | "x_thread" | "press_release";
  title: string;
  theme: string;
  targetAudience: string;
  tone: string;
  summary?: string;
  content: string;
  imagePrompt?: string;
  hashtags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export const AdminMarketingStudioTab = () => {
  const [activeType, setActiveType] = useState<"note_story" | "note_howto" | "shorts_script" | "x_thread">("note_story");
  const [theme, setTheme] = useState("昭和50年代の小学校の同級生との感動の再会");
  const [targetAudience, setTargetAudience] = useState("30代〜60代のノスタルジー・思い出を大切にする世代");
  const [tone, setTone] = useState("情緒的・エモーショナル");
  const [keywords, setKeywords] = useState("タイムカプセル, 放課後の夕焼け, 秘密の約束, 手紙");
  const [customPrompt, setCustomPrompt] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<PRDraft | null>(null);
  const [drafts, setDrafts] = useState<PRDraft[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"visual" | "markdown" | "storyboard">("visual");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Quick preset templates
  const presets = [
    {
      label: "🎒 タイムカプセルの約束 (note実話風)",
      type: "note_story" as const,
      theme: "小学校の卒業式で埋めたタイムカプセルと、30年ぶりに届いたボトルメール",
      targetAudience: "30代〜50代・同窓会世代",
      tone: "情緒的・エモーショナル",
      keywords: "タイムカプセル, 校庭の桜, 秘密のあだ名, 30年越し"
    },
    {
      label: "🎬 30秒で泣けるショート動画 (Shorts/TikTok)",
      type: "shorts_script" as const,
      theme: "突然転校してしまった初恋の相手を、思い出クイズで探す30秒ショートドラマ",
      targetAudience: "TikTok・Shorts利用の全年代",
      tone: "ドラマチック・切なく温かい",
      keywords: "初恋, 図書室の貸出カード, 秘密のクイズ, 奇跡の通知"
    },
    {
      label: "📖 手紙の書き方・クイズ作成術 (noteノウハウ)",
      type: "note_howto" as const,
      theme: "何十年ぶりの知人に確実に届く「秘密の思い出クイズ」の設計マニュアル",
      targetAudience: "再会を望むが個人情報開示が不安なユーザー",
      tone: "論理的・親切・わかりやすい解説",
      keywords: "思い出クイズ, 詐欺・なりすまし防止, 表記揺れ対策, 匿名性"
    },
    {
      label: "🐦 共感・拡散スレッド (X / Twitter)",
      type: "x_thread" as const,
      theme: "「もう一度会いたい人はいませんか？」大人になってから胸を締め付ける思い出",
      targetAudience: "SNSアクティブユーザー",
      tone: "共感・心に寄り添うトーン",
      keywords: "エモい, 昔の友人, ReMEETs, 安全な再会"
    }
  ];

  // Fetch saved drafts on mount
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/admin/pr-contents");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDrafts(data.data);
        if (data.data.length > 0 && !generatedContent) {
          setGeneratedContent(data.data[0]);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch PR drafts:", e);
    }
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setActiveType(p.type);
    setTheme(p.theme);
    setTargetAudience(p.targetAudience);
    setTone(p.tone);
    setKeywords(p.keywords);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/generate-pr-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          type: activeType,
          theme,
          targetAudience,
          tone,
          keywords,
          customPrompt
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedContent(data.data);
        if (activeType === "shorts_script") {
          setPreviewMode("storyboard");
        } else {
          setPreviewMode("visual");
        }
      }
    } catch (e) {
      console.error("Failed to generate content:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedContent) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/pr-contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(generatedContent)
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("下書きライブラリに保存しました！");
        fetchDrafts();
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (e) {
      console.error("Save draft error:", e);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("この下書きを削除しますか？")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/pr-contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      fetchDrafts();
      if (generatedContent?.id === id) {
        setGeneratedContent(null);
      }
    } catch (e) {
      console.error("Delete draft error:", e);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadMarkdown = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent.content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${generatedContent.title.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龠]/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* ─── ヘッダー ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                AI MARKETING & PR STUDIO
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Gemini 2.5 Flash / Pro Ready
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
              PRコンテンツ・生成スタジオ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              note用記事、ショート動画（TikTok/Shorts/Reels）台本、XスレッドをAIが一括自動生成。ReMEETsへの動線とファン獲得を加速します。
            </p>
          </div>
        </div>

        {/* クイック統計 */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-2xs text-center">
            <span className="text-[10px] font-bold text-slate-400 block">保存済み下書き</span>
            <span className="text-base font-serif font-bold text-slate-900">{drafts.length} <span className="text-xs font-normal text-slate-500">本</span></span>
          </div>
          <button
            onClick={() => handleApplyPreset(presets[0])}
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 size={14} />
            <span>おすすめ企画をセット</span>
          </button>
        </div>
      </div>

      {/* ─── プリセットバナー ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Lightbulb size={14} className="text-amber-500" />
          <span>ワンクリックで企画プリセットをセット:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-3.5 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 hover:border-indigo-300 text-left transition-all shadow-2xs group cursor-pointer flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 leading-snug">
                {preset.label}
              </span>
              <span className="text-[10.5px] text-slate-400 mt-2 line-clamp-1">
                {preset.theme}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── メインレイアウト（左：生成コントローラー / 右：リアルタイムプレビュー） ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── 左側：AI生成コントロールパネル（5カラム） ─── */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
              <Wand2 size={18} className="text-indigo-600" />
              <span>コンテンツ企画・設定</span>
            </h2>
            <span className="text-[10px] font-bold font-mono text-slate-400">STUDIO CONFIG</span>
          </div>

          {/* 1. フォーマット種別選択 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. 配信フォーマット
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "note_story", label: "note 実話風エッセイ", icon: BookOpen },
                { id: "shorts_script", label: "Shorts / TikTok 台本", icon: Video },
                { id: "note_howto", label: "note ノウハウ・教科書", icon: FileText },
                { id: "x_thread", label: "X (Twitter) スレッド", icon: Twitter },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveType(item.id as any)}
                  className={cn(
                    "p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs font-bold cursor-pointer",
                    activeType === item.id
                      ? "bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-2xs ring-2 ring-indigo-500/10"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100/80"
                  )}
                >
                  <item.icon size={16} className={activeType === item.id ? "text-indigo-600" : "text-slate-400"} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. テーマ / シチュエーション */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>2. テーマ・想い出のシチュエーション</span>
              <span className="text-[10px] text-slate-400 font-normal">具体的であるほど高品質</span>
            </label>
            <textarea
              rows={2}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例: 中学校の合唱コンクールでピアノを弾いていたあの子との再会"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
            />
          </div>

          {/* 3. ターゲット層 ＆ トーン */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">3. ターゲット読者層</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="例: 40代〜60代"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">4. 文体・トーン</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="情緒的・エモーショナル">情緒的・エモーショナル（感動）</option>
                <option value="親しみやすい・共感">親しみやすい・共感（SNS風）</option>
                <option value="論理的・わかりやすい解説">論理的・わかりやすい（ノウハウ）</option>
                <option value="ドラマチック・切なく温かい">ドラマチック・切なく温かい（Shorts）</option>
                <option value="格調高く信頼感のある公式トーン">格調高く信頼感のある公式トーン</option>
              </select>
            </div>
          </div>

          {/* 4. キーワード */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              5. 盛り込みたいキーワード (カンマ区切り)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例: タイムカプセル, 手紙, 秘密の約束, 30年"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* 5. 追加プロンプト (任意) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              6. AIへの追加こだわり指示 (任意)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例: 読者がコメント欄で自分の思い出を語りたくなる仕掛けを入れて"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* 生成実行ボタン */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !theme.trim()}
            className={cn(
              "w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer",
              isGenerating
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
            )}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>AIが記事・台本を執筆中...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>AIコンテンツを生成する</span>
              </>
            )}
          </button>

          {/* 保存済み下書きリスト */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">📂 保存済み下書き ({drafts.length})</span>
              <button onClick={fetchDrafts} className="text-[11px] text-indigo-600 hover:underline">更新</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setGeneratedContent(d)}
                  className={cn(
                    "p-3 rounded-xl border text-left flex items-center justify-between group cursor-pointer transition-all",
                    generatedContent?.id === d.id
                      ? "bg-indigo-50/80 border-indigo-300"
                      : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-100/70"
                  )}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                      {d.type === "note_story" ? "note 実話" : d.type === "shorts_script" ? "🎬 Shorts台本" : d.type === "x_thread" ? "🐦 Xスレッド" : "📖 noteノウハウ"}
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate">{d.title}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDraft(d.id); }}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 右側：リッチプレビュー ＆ エクスポート（7カラム） ─── */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* プレビュー切り替えバー ＆ アクションボタン */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl">
              <button
                onClick={() => setPreviewMode("visual")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  previewMode === "visual"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Eye size={14} />
                <span>リアル表示</span>
              </button>
              {generatedContent?.type === "shorts_script" && (
                <button
                  onClick={() => setPreviewMode("storyboard")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    previewMode === "storyboard"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <Film size={14} />
                  <span>絵コンテ・タイムライン</span>
                </button>
              )}
              <button
                onClick={() => setPreviewMode("markdown")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  previewMode === "markdown"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Code size={14} />
                <span>Markdown 原文</span>
              </button>
            </div>

            {/* アクションボタン群 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => generatedContent && copyToClipboard(generatedContent.content, "full")}
                disabled={!generatedContent}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {copiedField === "full" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedField === "full" ? "コピー完了" : "本文コピー"}</span>
              </button>
              <button
                onClick={downloadMarkdown}
                disabled={!generatedContent}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Download size={14} />
                <span>.md 保存</span>
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={!generatedContent}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
              >
                <Save size={14} />
                <span>下書き保存</span>
              </button>
            </div>
          </div>

          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{saveStatus}</span>
            </motion.div>
          )}

          {/* プレビュー本体 */}
          {generatedContent ? (
            <div className="space-y-4">
              
              {/* アイキャッチ画像用プロンプト枠 */}
              {generatedContent.imagePrompt && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>アイキャッチ / サムネイル画像生成プロンプト (Midjourney / Imagen 用)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedContent.imagePrompt || "", "image")}
                      className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedField === "image" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedField === "image" ? "コピー済" : "プロンプトをコピー"}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-purple-950/80 bg-white/80 p-2.5 rounded-xl border border-purple-200/50 select-all leading-relaxed">
                    {generatedContent.imagePrompt}
                  </p>
                </div>
              )}

              {/* リアルプレビュー表示 */}
              {previewMode === "visual" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  {/* note風ヘッダー */}
                  <div className="border-b border-slate-100 pb-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                        RM
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">ReMEETs 公式編集部</div>
                        <div className="text-[10px] text-slate-400">公式広報・想い出ボトルストーリー</div>
                      </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug">
                      {generatedContent.title}
                    </h1>

                    {/* ハッシュタグ */}
                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {generatedContent.hashtags.map((tag, idx) => (
                          <span key={idx} className="text-xs text-indigo-600 hover:underline cursor-pointer">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 本文エリア */}
                  <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap font-serif">
                    {generatedContent.content}
                  </div>
                </div>
              )}

              {/* ショート動画 絵コンテ・タイムライン表示 */}
              {previewMode === "storyboard" && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} className="text-rose-400" />
                      <h3 className="text-base font-bold font-serif">縦型ショート動画・演出絵コンテ (9:16)</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                      TikTok / YouTube Shorts / Reels
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-amber-300 leading-snug">
                      {generatedContent.title}
                    </h2>

                    <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-200">
                      {generatedContent.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Markdown 原文表示 */}
              {previewMode === "markdown" && (
                <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono">RAW MARKDOWN</span>
                    <span>{generatedContent.content.length} 文字</span>
                  </div>
                  <textarea
                    rows={18}
                    readOnly
                    value={generatedContent.content}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

            </div>
          ) : (
            <div className="h-96 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Sparkles size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 font-serif">まだコンテンツが生成されていません</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  左側の企画フォームでテーマを入力するか、上部のプリセットを選んで「AIコンテンツを生成する」を押してください。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
