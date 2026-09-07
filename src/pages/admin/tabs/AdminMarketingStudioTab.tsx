import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Video, BookOpen, Twitter, Copy, Check, Download,
  Save, Trash2, RefreshCw, Wand2, FileText,
  Film, Smartphone, Lightbulb, CheckCircle2,
  Eye, Code, AlertCircle, Play, Pause, RotateCcw, Volume2,
  VolumeX, Image as ImageIcon, Plus, ArrowRight, CheckSquare,
  Layers, Palette, Music, Mic, Share2, Compass, ChevronRight,
  Sliders, Film as FilmIcon, Send, Sparkle, ExternalLink
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { cn } from "../../../lib/utils";

// ── Types ──
interface VideoScene {
  time: string;
  label: string;
  visual: string;
  narration: string;
  telop: string;
  bgm: string;
  imagePath?: string;
}

interface PRDraft {
  id: string;
  type: "note_story" | "note_howto" | "shorts_script" | "x_thread";
  title: string;
  theme: string;
  curriculumStep?: number;
  targetAudience: string;
  tone: string;
  summary?: string;
  content: string;
  imagePrompt?: string;
  selectedImages?: string[];
  hashtags?: string[];
  scenes?: VideoScene[];
  createdAt: string;
  updatedAt?: string;
}

// ── Preset Curriculum (12 Steps) ──
const CURRICULUM_STEPS = [
  { step: 1, title: "第1講: 昔の大切な人に手紙を届ける第一歩（記憶の整理）", phase: "基礎編", theme: "想い出の手紙の書き方と記憶の整理" },
  { step: 2, title: "第2講: 実名・住所を出さずに安全に手紙を海に放つ方法", phase: "基礎編", theme: "完全匿名の安全なボトルメール投函" },
  { step: 3, title: "第3講: 相手が検索した時に必ず届く「キーワード」選定術", phase: "基礎編", theme: "ボトル検索で見つけてもらうためのSEO・単語設計" },
  { step: 4, title: "第4講: 相手にだけ伝わる「秘密の思い出クイズ」黄金法則", phase: "クイズ編", theme: "ふたりだけの合言葉クイズ作成術" },
  { step: 5, title: "第5講: 表記揺れ（漢字・ひらがな）による誤答を防ぐ親切な出題法", phase: "クイズ編", theme: "クイズ解答時の表記揺れ防止テクニック" },
  { step: 6, title: "第6講: 第三者のなりすまし・サクラを100%遮断する仕組み", phase: "安全編", theme: "AI検閲と二段階照合による安全防衛" },
  { step: 7, title: "第7講: 30年ぶりの再会を果たすための「情景描写」テクニック", phase: "応用編", theme: "胸を打つ情景描写とエピソードの書き方" },
  { step: 8, title: "第8講: 「恩師」「初恋」「旧友」相手別の手紙の書き分け方", phase: "応用編", theme: "再会したい対象別の心理とアプローチ" },
  { step: 9, title: "第9講: ボトルが拾われた後の「連絡先セキュア開示」安心ステップ", phase: "開通編", theme: "マッチング成立後の本人確認と安全な連絡先交換" },
  { step: 10, title: "第10講: 実際の奇跡のマッチング事例から学ぶ成功の共通点", phase: "実例編", theme: "成功事例の分析とボトルの工夫" },
  { step: 11, title: "第11講: 「すぐに見つからない時」のボトルの漂流期間と更新術", phase: "運用編", theme: "長期ボトルを届けるためのメンテナンスとSNSシェア" },
  { step: 12, title: "第12講: ReMEETsが目指す「優しく安全な想い出の交差点」の未来", phase: "未来編", theme: "インターネット時代における温かい縁の再接続" }
];

// Available Image Assets in ReMEETs
const AVAILABLE_ASSETS = [
  { id: "hero_bottle", title: "夕暮れの海とガラス瓶", path: "/assets/hero_bottle_mail_1785941809474-DEVslUma.jpg", category: "写真" },
  { id: "vintage_paper", title: "万年筆とヴィンテージ便箋", path: "/assets/vintage_bottle_letter_paper_1788601708823-C03nb7i-.jpg", category: "写真" },
  { id: "quiz_match", title: "思い出クイズ照合画面", path: "/assets/quiz_match_hearts_pastel_1785940521320-BuRx364f.jpg", category: "アプリ画面" },
  { id: "step_write", title: "手紙を書く情景", path: "/assets/step_01_photo_write_1785857630366-BfuUyhkb.jpg", category: "イラスト" },
  { id: "safety_shield", title: "安心安全のセキュア画面", path: "/assets/safety_guardian_cool_1785864341331-Bo0QXIxf.jpg", category: "アプリ画面" },
  { id: "twilight_sea", title: "夕暮れの海辺風景", path: "/assets/supporter_twilight_cool_1785860735348-C0uYySdx.jpg", category: "風景" }
];

export const AdminMarketingStudioTab = () => {
  const { token: authToken } = useAuth();

  // Top Studio Mode: "note_studio" (Articles/Curriculum) vs "shorts_studio" (Shorts/TikTok Video Production)
  const [studioMode, setStudioMode] = useState<"note_studio" | "shorts_studio">("note_studio");

  // Workflow Pipeline Steppers
  // Note: 1: Draft -> 2: Images -> 3: Preview -> 4: Export
  const [noteStep, setNoteStep] = useState<1 | 2 | 3 | 4>(1);
  // Shorts: 1: Script -> 2: Visuals -> 3: TTS/Narration -> 4: Final Preview -> 5: Export
  const [shortsStep, setShortsStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Note Options
  const [noteMode, setNoteMode] = useState<"random_story" | "curriculum_howto" | "custom">("random_story");
  const [curriculumStep, setCurriculumStep] = useState<number>(1);
  const [customTheme, setCustomTheme] = useState("");
  const [customKeywords, setCustomKeywords] = useState("");

  // Video Options
  const [videoTheme, setVideoTheme] = useState("30年前の初恋の相手を探す思い出クイズの奇跡");
  const [videoCustomPrompt, setVideoCustomPrompt] = useState("");
  const [selectedBgm, setSelectedBgm] = useState("切ないピアノソロ");
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1.0);

  // Content States
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<PRDraft | null>(null);
  const [drafts, setDrafts] = useState<PRDraft[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Selected Images for current note draft
  const [selectedImages, setSelectedImages] = useState<string[]>(["/assets/hero_bottle_mail_1785941809474-DEVslUma.jpg"]);

  // Video Playback State (for Studio Final Video Preview)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  // Fetch drafts on mount
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const token = authToken || localStorage.getItem("token");
      const res = await fetch("/api/admin/pr-contents", {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDrafts(data.data);
        if (data.data.length > 0 && !currentDraft) {
          setCurrentDraft(data.data[0]);
        }
      }
    } catch (e) {
      console.warn("Fetch drafts failed:", e);
    }
  };

  // ── 1. Generate Note Content (Random Story or Next Curriculum Step) ──
  const handleGenerateNote = async (overrideType?: "note_story" | "note_howto") => {
    setIsGenerating(true);
    setSaveStatus(null);
    try {
      const type = overrideType || (noteMode === "curriculum_howto" ? "note_howto" : "note_story");
      const token = authToken || localStorage.getItem("token");
      
      const res = await fetch("/api/admin/generate-pr-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          type,
          theme: customTheme,
          curriculumStep: noteMode === "curriculum_howto" ? curriculumStep : undefined,
          keywords: customKeywords,
          customPrompt: customTheme ? `こだわり指示: ${customTheme}` : ""
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentDraft({
          ...data.data,
          selectedImages: selectedImages
        });
        setNoteStep(1);
      }
    } catch (e) {
      console.warn("Note generation fallback:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── 2. Generate Shorts Video Script ──
  const handleGenerateShorts = async () => {
    setIsGenerating(true);
    setSaveStatus(null);
    try {
      const token = authToken || localStorage.getItem("token");
      const res = await fetch("/api/admin/generate-pr-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          type: "shorts_script",
          theme: videoTheme,
          customPrompt: videoCustomPrompt
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCurrentDraft(data.data);
        setShortsStep(1);
      }
    } catch (e) {
      console.warn("Shorts generation fallback:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Save Draft ──
  const handleSaveDraft = async () => {
    if (!currentDraft) return;
    try {
      const token = authToken || localStorage.getItem("token");
      const res = await fetch("/api/admin/pr-contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(currentDraft)
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

  // ── Delete Draft ──
  const handleDeleteDraft = async (id: string) => {
    if (!confirm("この下書きを削除しますか？")) return;
    try {
      const token = authToken || localStorage.getItem("token");
      await fetch(`/api/admin/pr-contents/${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      fetchDrafts();
      if (currentDraft?.id === id) {
        setCurrentDraft(null);
      }
    } catch (e) {
      console.error("Delete draft error:", e);
    }
  };

  // ── Copy Helper ──
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── TTS Web Speech Playback for Shorts ──
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = narrationSpeed;
    window.speechSynthesis.speak(utterance);
  };

  // ── Video Final Preview Playback Engine ──
  useEffect(() => {
    let timer: any;
    if (isPlayingVideo && currentDraft?.scenes && currentDraft.scenes.length > 0) {
      const scene = currentDraft.scenes[currentSceneIndex];
      if (scene) {
        speakText(scene.narration);
      }
      timer = setTimeout(() => {
        if (currentSceneIndex < currentDraft.scenes!.length - 1) {
          setCurrentSceneIndex(prev => prev + 1);
        } else {
          setIsPlayingVideo(false);
          setCurrentSceneIndex(0);
        }
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [isPlayingVideo, currentSceneIndex]);

  const toggleVideoPlay = () => {
    if (isPlayingVideo) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsPlayingVideo(false);
    } else {
      setIsPlayingVideo(true);
      setCurrentSceneIndex(0);
    }
  };

  // ── Image Toggle for Note ──
  const toggleImageSelect = (path: string) => {
    setSelectedImages(prev => {
      if (prev.includes(path)) {
        return prev.filter(p => p !== path);
      } else {
        return [...prev, path];
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* ─── Top Hero Studio Header ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-100">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                ReMEETs IN-HOUSE PRODUCTION
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                AI自律執筆 ＆ 映像完パケスタジオ
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide">
              メディア制作プロダクション
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              「企画・執筆 → 挿絵・シーン選定 → 完パケ確認 → note・YouTube・TikTokへの手動ワンクリック配信」までを一連の流れで完結させます。
            </p>
          </div>
        </div>

        {/* Studio Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => { setStudioMode("note_studio"); }}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              studioMode === "note_studio"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <BookOpen size={16} className={studioMode === "note_studio" ? "text-indigo-600" : "text-slate-400"} />
            <span>📝 note・教科書スタジオ</span>
          </button>
          <button
            onClick={() => { setStudioMode("shorts_studio"); }}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              studioMode === "shorts_studio"
                ? "bg-white text-rose-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            <Film size={16} className={studioMode === "shorts_studio" ? "text-rose-600" : "text-slate-400"} />
            <span>🎬 ショート動画プロダクション</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 📝 MODE 1: note・教科書 制作スタジオ                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {studioMode === "note_studio" && (
        <div className="space-y-6">

          {/* 5-Step Pipeline Navigation Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {[
                { step: 1, label: "1. 執筆・内容確認", icon: FileText },
                { step: 2, label: "2. 挿絵・画像配置", icon: ImageIcon },
                { step: 3, label: "3. note風レイアウト確認", icon: Eye },
                { step: 4, label: "4. 保存 ＆ ワンクリック配信", icon: Share2 },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setNoteStep(s.step as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                    noteStep === s.step
                      ? "bg-indigo-600 text-white shadow-xs"
                      : noteStep > s.step
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  <s.icon size={14} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={!currentDraft}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Save size={14} />
                <span>下書き保存</span>
              </button>
            </div>
          </div>

          {saveStatus && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{saveStatus}</span>
            </motion.div>
          )}

          {/* STEP 1: Draft & Mode Selection */}
          {noteStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Generator Controls */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                    <Wand2 size={18} className="text-indigo-600" />
                    <span>執筆モードの選択</span>
                  </h2>
                </div>

                {/* Mode Selector */}
                <div className="space-y-3">
                  <button
                    onClick={() => { setNoteMode("random_story"); handleGenerateNote("note_story"); }}
                    disabled={isGenerating}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between group cursor-pointer",
                      noteMode === "random_story"
                        ? "bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-300 ring-2 ring-indigo-500/10"
                        : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎲</span>
                        <span className="text-xs font-bold text-slate-900">おまかせランダム実話エッセイ</span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">ワンクリック</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        昭和・平成の想い出シチュエーションプールから、AIが毎回異なる情緒豊かな感動実話ストーリーを自動生成します。
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setNoteMode("curriculum_howto")}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between group cursor-pointer",
                      noteMode === "curriculum_howto"
                        ? "bg-gradient-to-r from-teal-50/80 to-cyan-50/80 border-teal-300 ring-2 ring-teal-500/10"
                        : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📚</span>
                        <span className="text-xs font-bold text-slate-900">連載ノウハウ教科書（全12回）</span>
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">重複なし順次執筆</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        「第1講: 基本」から「第12講: 応用」まで、順序立ててnote読者をファン化する公式教科書をステップ順に執筆します。
                      </p>
                    </div>
                  </button>
                </div>

                {/* Curriculum Selector if HowTo is active */}
                {noteMode === "curriculum_howto" && (
                  <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                      <span>連載カリキュラム進捗: 第 {curriculumStep} / 12 講</span>
                      <span className="text-[10px] bg-teal-200/70 px-2 py-0.5 rounded-full">{CURRICULUM_STEPS[curriculumStep - 1].phase}</span>
                    </div>

                    <select
                      value={curriculumStep}
                      onChange={(e) => setCurriculumStep(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      {CURRICULUM_STEPS.map((s) => (
                        <option key={s.step} value={s.step}>
                          {s.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleGenerateNote("note_howto")}
                      disabled={isGenerating}
                      className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>第 {curriculumStep} 講の原稿を執筆する</span>
                    </button>
                  </div>
                )}

                {/* Optional Custom Free Prompt */}
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Lightbulb size={13} className="text-amber-500" />
                    <span>こだわり自由指示 (任意)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                    placeholder="指定がある場合のみ入力（例: 昭和55年の北海道の同級生、恩師の定年退職など）"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-none resize-none"
                  />
                  {noteMode === "random_story" && (
                    <button
                      onClick={() => handleGenerateNote("note_story")}
                      disabled={isGenerating}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      <span>🎲 おまかせストーリーを生成する</span>
                    </button>
                  )}
                </div>

                {/* Saved Drafts List */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">📂 下書きライブラリ ({drafts.length})</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {drafts.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setCurrentDraft(d)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all text-xs",
                          currentDraft?.id === d.id ? "bg-indigo-50 border-indigo-300 font-bold" : "bg-slate-50/50 border-slate-200/60 hover:bg-slate-100"
                        )}
                      >
                        <span className="truncate flex-1 pr-2">{d.title}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDraft(d.id); }} className="text-slate-300 hover:text-rose-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Draft Review & Inline Edit */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 1: REVIEW & EDIT</span>
                    <h2 className="text-base font-bold font-serif text-slate-900">記事の内容確認 ＆ 編集</h2>
                  </div>
                  <button
                    onClick={() => setNoteStep(2)}
                    disabled={!currentDraft}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
                  >
                    <span>内容OK！画像配置へ進む</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {currentDraft ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">記事タイトル</label>
                      <input
                        type="text"
                        value={currentDraft.title}
                        onChange={(e) => setCurrentDraft({ ...currentDraft, title: e.target.value })}
                        className="w-full p-3 font-serif font-bold text-base text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">本文 (Markdown編集可能)</label>
                      <textarea
                        rows={16}
                        value={currentDraft.content}
                        onChange={(e) => setCurrentDraft({ ...currentDraft, content: e.target.value })}
                        className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none leading-relaxed custom-scrollbar"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-80 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-2">
                    <Sparkles size={32} className="text-indigo-400" />
                    <p className="text-xs text-slate-500">左側のボタンを押して、おまかせストーリーまたは教科書を執筆してください。</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: Image Selection & Placement */}
          {noteStep === 2 && currentDraft && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 2: IMAGE ASSETS</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">挿絵・アイキャッチ画像の選定</h2>
                  <p className="text-xs text-slate-500">記事に挿入したい画像にチェックを入れてください。自動で最適な位置にレイアウトされます。</p>
                </div>
                <button
                  onClick={() => setNoteStep(3)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>レイアウト確認へ進む</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* AI Image Generation Prompt Card */}
              {currentDraft.imagePrompt && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkle size={14} className="text-purple-600" />
                      <span>AIアイキャッチ生成プロンプト (Midjourney / Imagen / Canva用)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(currentDraft.imagePrompt || "", "prompt")}
                      className="text-xs text-purple-700 hover:underline font-bold flex items-center gap-1"
                    >
                      {copiedField === "prompt" ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedField === "prompt" ? "コピー済" : "プロンプトをコピー"}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-white/80 p-2.5 rounded-xl text-purple-950 border border-purple-200/50 select-all">
                    {currentDraft.imagePrompt}
                  </p>
                </div>
              )}

              {/* Available Assets Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {AVAILABLE_ASSETS.map((asset) => {
                  const isSelected = selectedImages.includes(asset.path);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => toggleImageSelect(asset.path)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer group space-y-2 relative",
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20"
                          : "bg-slate-50 border-slate-200/80 hover:border-slate-300"
                      )}
                    >
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 relative">
                        <img src={asset.path} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className={cn(
                          "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md text-xs font-bold",
                          isSelected ? "bg-indigo-600 text-white" : "bg-white/80 text-slate-400"
                        )}>
                          {isSelected ? <Check size={14} /> : <Plus size={14} />}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{asset.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{asset.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: note-style Live Preview */}
          {noteStep === 3 && currentDraft && (
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 3: NOTE LIVE PREVIEW</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">note完成レイアウト確認</h2>
                </div>
                <button
                  onClick={() => setNoteStep(4)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>レイアウトOK！配信へ進む</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* note Hero Header */}
              {selectedImages.length > 0 && (
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <img src={selectedImages[0]} alt="Hero" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-serif font-bold text-sm">
                    RM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">ReMEETs 公式編集部</div>
                    <div className="text-[10px] text-slate-400">公式広報・想い出ボトルストーリー</div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-snug">
                  {currentDraft.title}
                </h1>

                {currentDraft.hashtags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentDraft.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-indigo-600 font-sans">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Body Content with Embedded Images */}
              <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-6 font-serif whitespace-pre-wrap">
                {currentDraft.content}
              </div>

              {/* Bottom In-article Image Gallery */}
              {selectedImages.length > 1 && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <span className="text-xs font-bold text-slate-400 block uppercase font-mono">IN-ARTICLE ILLUSTRATIONS</span>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedImages.slice(1).map((img, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-200">
                        <img src={img} alt="In-article" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: One-Click Multi-Platform Publish & Export */}
          {noteStep === 4 && currentDraft && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 4: EXPORT & PUBLISH</span>
                <h2 className="text-base font-bold font-serif text-slate-900">各メディアへのワンクリック配信アシスト</h2>
                <p className="text-xs text-slate-500">ボタンを押して各メディアに貼り付けるだけで、30秒で公開が完了します。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. note Direct Copy */}
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <h3 className="text-sm font-bold text-emerald-950">note 貼り付け用コピー</h3>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    見出し・太字・CTAリンク・画像配置情報を含んだ完全な原稿を一括コピーします。
                  </p>
                  <button
                    onClick={() => copyToClipboard(currentDraft.content, "note")}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === "note" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedField === "note" ? "コピー完了！noteに貼付" : "本文を一括コピー"}</span>
                  </button>
                  <a
                    href="https://note.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 hover:underline flex items-center justify-center gap-1 pt-1 font-bold"
                  >
                    <span>noteの投稿画面を開く</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* 2. X (Twitter) Promo Post Copy */}
                <div className="p-5 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl border border-sky-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Twitter size={18} className="text-sky-600" />
                    <h3 className="text-sm font-bold text-sky-950">X (Twitter) 告知文コピー</h3>
                  </div>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    note記事公開時に同時投稿できる、140文字の共感告知ポスト文です。
                  </p>
                  <button
                    onClick={() => copyToClipboard(`「${currentDraft.title}」\n\n大人になってから、ふと昔の大切な人を思い出す夜はありませんか？\n実名もLINEも知らなくても、記憶のクイズで繋がれる『ReMEETs』の物語をnoteに書きました。\n\n👉 記事を読む: https://note.com/remeets\n\n#ReMEETs #再会 #思い出 #エッセイ`, "x_post")}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === "x_post" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedField === "x_post" ? "告知ポスト文コピー完了" : "告知文をコピー"}</span>
                  </button>
                </div>

                {/* 3. Markdown (.md) File Download */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download size={18} className="text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-900">Markdown (.md) 保存</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    WordPressやブログ、ローカル保管用のMarkdownファイルをダウンロードします。
                  </p>
                  <button
                    onClick={() => {
                      const blob = new Blob([currentDraft.content], { type: "text/markdown;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${currentDraft.title.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龠]/g, "_")}.md`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>.md ファイル保存</span>
                  </button>
                </div>
              </div>

              {/* Progress to Next Curriculum Step */}
              {noteMode === "curriculum_howto" && curriculumStep < 12 && (
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-teal-900">🎉 第 {curriculumStep} 講の執筆が完了しました！</span>
                    <p className="text-[11px] text-teal-700">次は「第 {curriculumStep + 1} 講: {CURRICULUM_STEPS[curriculumStep].theme}」です。</p>
                  </div>
                  <button
                    onClick={() => {
                      setCurriculumStep(prev => prev + 1);
                      setNoteStep(1);
                      handleGenerateNote("note_howto");
                    }}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>次回の第 {curriculumStep + 1} 講を執筆 👉</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 🎬 MODE 2: ショート動画 制作プロダクション (Shorts/TikTok)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {studioMode === "shorts_studio" && (
        <div className="space-y-6">

          {/* 5-Step Video Stepper */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {[
                { step: 1, label: "1. シナリオ決定", icon: FileText },
                { step: 2, label: "2. 9:16シーン映像", icon: FilmIcon },
                { step: 3, label: "3. ナレーション音声", icon: Mic },
                { step: 4, label: "4. 完パケ試写再生", icon: Play },
                { step: 5, label: "5. YouTube/TikTok書き出し", icon: Share2 },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setShortsStep(s.step as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                    shortsStep === s.step
                      ? "bg-rose-600 text-white shadow-xs"
                      : shortsStep > s.step
                        ? "bg-rose-50 text-rose-700"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  <s.icon size={14} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSaveDraft}
              disabled={!currentDraft}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Save size={14} />
              <span>台本保存</span>
            </button>
          </div>

          {/* SHORTS STEP 1: Script Generator */}
          {shortsStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Script Controls */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                    <Video size={18} className="text-rose-600" />
                    <span>ショート動画 シナリオ企画</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">動画のテーマ・題材</label>
                  <input
                    type="text"
                    value={videoTheme}
                    onChange={(e) => setVideoTheme(e.target.value)}
                    placeholder="例: 30年前の恩師に感謝を届けるボトルメール"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">BGM雰囲気</label>
                  <select
                    value={selectedBgm}
                    onChange={(e) => setSelectedBgm(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="切ないピアノソロ">切ないピアノソロ（感涙系）</option>
                    <option value="穏やかな波の音とアコギ">穏やかな波の音とアコギ（ノスタルジー）</option>
                    <option value="ドラマチックなストリングス">ドラマチックなストリングス（奇跡の再会）</option>
                    <option value="温かいアンビエント">温かいアンビエント（心温まるエピソード）</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerateShorts}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>🎬 45秒ショート動画台本を生成する</span>
                </button>
              </div>

              {/* Right Column: Generated Storyboard & Scene Breakdown */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 uppercase font-mono">STEP 1: SCRIPT BREAKDOWN</span>
                    <h2 className="text-base font-bold font-serif text-slate-900">シーン別 絵コンテ・タイムライン</h2>
                  </div>
                  <button
                    onClick={() => setShortsStep(2)}
                    disabled={!currentDraft}
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
                  >
                    <span>シナリオOK！映像設定へ進む</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {currentDraft?.scenes ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 font-serif">{currentDraft.title}</h3>
                    
                    <div className="space-y-3">
                      {currentDraft.scenes.map((scene, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-mono">{scene.time}</span>
                            <span className="text-xs font-bold text-slate-800">{scene.label}</span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <p><span className="font-bold text-slate-800">【映像】:</span> {scene.visual}</p>
                            <p><span className="font-bold text-slate-800">【ナレーション】:</span> 「{scene.narration}」</p>
                            <p className="text-amber-700 bg-amber-50/80 p-1.5 rounded-lg text-[11px] font-bold"><span className="font-bold text-amber-900">【テロップ】:</span> {scene.telop}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-80 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-2">
                    <Film size={32} className="text-rose-400" />
                    <p className="text-xs text-slate-500">左側のボタンを押して、45秒ショート動画台本を生成してください。</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SHORTS STEP 2: 9:16 Visuals Mapping */}
          {shortsStep === 2 && currentDraft?.scenes && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase font-mono">STEP 2: 9:16 SCENE VISUALS</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">シーン別の縦型背景・モック設定</h2>
                </div>
                <button
                  onClick={() => setShortsStep(3)}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>ナレーション音声設定へ進む</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentDraft.scenes.map((scene, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-rose-600 font-mono">{scene.time}</span>
                      <span className="text-slate-700">シーン {idx + 1}</span>
                    </div>

                    <div className="aspect-[9/16] rounded-xl overflow-hidden bg-slate-800 relative">
                      <img src={AVAILABLE_ASSETS[idx % AVAILABLE_ASSETS.length].path} alt="Scene Visual" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-3">
                        <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold self-start">{scene.label}</span>
                        <p className="text-white text-[11px] font-bold text-center leading-snug drop-shadow-md">
                          {scene.telop}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{scene.visual}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHORTS STEP 3: Narration & TTS Audio */}
          {shortsStep === 3 && currentDraft?.scenes && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase font-mono">STEP 3: NARRATION VOICE</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">AIナレーション音声の合成・試聴</h2>
                </div>
                <button
                  onClick={() => setShortsStep(4)}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>完パケ試写へ進む</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">ナレーション読み上げ速度</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.8"
                        max="1.3"
                        step="0.05"
                        value={narrationSpeed}
                        onChange={(e) => setNarrationSpeed(parseFloat(e.target.value))}
                        className="flex-1 accent-rose-600 cursor-pointer"
                      />
                      <span className="text-xs font-bold font-mono text-slate-700 w-12">{narrationSpeed.toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {currentDraft.scenes.map((scene, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
                        <div className="text-xs flex-1">
                          <span className="font-bold text-rose-600 mr-2">{scene.time}</span>
                          <span className="text-slate-800 font-serif">「{scene.narration}」</span>
                        </div>
                        <button
                          onClick={() => speakText(scene.narration)}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Volume2 size={13} />
                          <span>試聴</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-rose-100 space-y-4 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-rose-200">
                    <Mic size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-rose-950 font-serif">Web Speech API によるゼロ遅延音声合成</h3>
                    <p className="text-xs text-rose-800 leading-relaxed max-w-sm mx-auto">
                      外部通信費なしで、お使いのブラウザ標準の日本語音声エンジンが高品質にナレーションを自動生成します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SHORTS STEP 4: Final Video Playback Player (9:16) */}
          {shortsStep === 4 && currentDraft?.scenes && (
            <div className="bg-slate-950 text-white p-6 sm:p-10 rounded-3xl shadow-2xl space-y-8 max-w-md mx-auto border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-rose-400" />
                  <span className="text-xs font-bold font-mono text-slate-300">FINAL 9:16 PREVIEW</span>
                </div>
                <button
                  onClick={() => setShortsStep(5)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>書き出しへ</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* 9:16 Smartphone Mock Screen */}
              <div className="aspect-[9/16] w-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-700 relative shadow-2xl">
                <img
                  src={AVAILABLE_ASSETS[currentSceneIndex % AVAILABLE_ASSETS.length].path}
                  alt="Video Stage"
                  className="w-full h-full object-cover transition-all duration-700"
                />

                {/* Video Overlays (Telop & Sound) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-rose-600/90 text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-mono shadow-sm">
                      {currentDraft.scenes[currentSceneIndex]?.label}
                    </span>
                    <span className="text-xs font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
                      {currentDraft.scenes[currentSceneIndex]?.time}
                    </span>
                  </div>

                  {/* Big Dynamic Telop */}
                  <div className="space-y-3 text-center">
                    <motion.div
                      key={currentSceneIndex}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-amber-400 text-black px-4 py-2 rounded-2xl text-sm sm:text-base font-black tracking-tight shadow-xl"
                    >
                      {currentDraft.scenes[currentSceneIndex]?.telop}
                    </motion.div>

                    <p className="text-xs text-white/90 font-serif drop-shadow leading-relaxed bg-black/60 p-2.5 rounded-xl backdrop-blur-xs">
                      「{currentDraft.scenes[currentSceneIndex]?.narration}」
                    </p>
                  </div>
                </div>
              </div>

              {/* Player Controller */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>シーン {currentSceneIndex + 1} / {currentDraft.scenes.length}</span>
                  <span>BGM: {selectedBgm}</span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={toggleVideoPlay}
                    className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlayingVideo ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>
                  <button
                    onClick={() => { setCurrentSceneIndex(0); speakText(currentDraft.scenes![0].narration); }}
                    className="p-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SHORTS STEP 5: Multi-Platform Export */}
          {shortsStep === 5 && currentDraft && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold text-rose-600 uppercase font-mono">STEP 5: PUBLISH PACKAGE</span>
                <h2 className="text-base font-bold font-serif text-slate-900">各SNS用 概要欄・タイトル一括書き出し</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* YouTube Shorts Package */}
                <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">▶️</span>
                    <h3 className="text-sm font-bold text-red-950">YouTube Shorts 用タイトル＆概要</h3>
                  </div>
                  <textarea
                    rows={4}
                    readOnly
                    value={`${currentDraft.title}\n\n30年前に渡せなかった手紙を、海の底で見つけた奇跡の実話ドラマ。\n\n🌊 想い出のボトルメール『ReMEETs』\n👉 https://remeets.example.com\n\n#Shorts #感動 #再会 #手紙 #奇跡`}
                    className="w-full p-3 bg-white border border-red-200 rounded-xl text-xs font-mono text-slate-800 outline-none resize-none"
                  />
                  <button
                    onClick={() => copyToClipboard(`${currentDraft.title}\n\n30年前に渡せなかった手紙を、海の底で見つけた奇跡の実話ドラマ。\n\n🌊 想い出のボトルメール『ReMEETs』\n👉 https://remeets.example.com\n\n#Shorts #感動 #再会 #手紙 #奇跡`, "yt")}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === "yt" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedField === "yt" ? "コピー完了！" : "YouTube用テキストをコピー"}</span>
                  </button>
                </div>

                {/* TikTok / Instagram Reels Package */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎵</span>
                    <h3 className="text-sm font-bold text-purple-950">TikTok / Instagram Reels 用キャプション</h3>
                  </div>
                  <textarea
                    rows={4}
                    readOnly
                    value={`【30年越しの再会】あの時言えなかった想い出、まだ海を漂っています。\n\nあなたにも、もう一度会いたい人はいませんか？\n『ReMEETs』で検索してボトルを探してみてね🌊\n\n#TikTok教室 #ショートドラマ #感動 #エモい #再会 #ReMEETs`}
                    className="w-full p-3 bg-white border border-purple-200 rounded-xl text-xs font-mono text-slate-800 outline-none resize-none"
                  />
                  <button
                    onClick={() => copyToClipboard(`【30年越しの再会】あの時言えなかった想い出、まだ海を漂っています。\n\nあなたにも、もう一度会いたい人はいませんか？\n『ReMEETs』で検索してボトルを探してみてね🌊\n\n#TikTok教室 #ショートドラマ #感動 #エモい #再会 #ReMEETs`, "tt")}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === "tt" ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedField === "tt" ? "コピー完了！" : "TikTok/Reels用テキストをコピー"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
