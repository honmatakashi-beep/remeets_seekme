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
  imageUrl?: string;
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

// 🎨 Brand Style & Tone Presets (世界観・統一トーン設定)
export interface StyleTonePreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  badge: string;
  gradientClass: string;
  badgeColor: string;
  aiPromptStyle: string;
}

export const STYLE_TONE_PRESETS: StyleTonePreset[] = [
  {
    id: "watercolor_nostalgia",
    name: "ノスタルジック水彩イラスト",
    tag: "🎨 水彩・ジブリ風",
    description: "絵本やアニメのような温もり。心に優しく染み入る手描きイラストの世界観。",
    badge: "実話エッセイ・共感連載に最適",
    gradientClass: "from-amber-500 via-rose-500 to-indigo-700",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    aiPromptStyle: "nostalgic Japanese anime watercolor painting, soft pastel color palette, Makoto Shinkai aesthetic, emotional warm lighting, gentle brush strokes, masterpiece, ultra-detailed, artistic 8k"
  },
  {
    id: "twilight_cinematic",
    name: "黄昏シネマティック写真",
    tag: "🌅 映画・夕暮れ実写",
    description: "夕暮れの海辺とガラス瓶。映画のワンシーンのようなエモーショナルな大人向けトーン。",
    badge: "感動エッセイ・ショート動画に最適",
    gradientClass: "from-indigo-900 via-purple-900 to-amber-700",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    aiPromptStyle: "cinematic 35mm film photograph, golden hour sunset, anamorphic lens flare, nostalgic Japanese landscape, rich warm tone, emotional atmosphere, 8k resolution, award-winning cinematography"
  },
  {
    id: "vintage_amber_letter",
    name: "ヴィンテージ書簡・琥珀",
    tag: "📜 レトロ・羊皮紙",
    description: "万年筆・琥珀色の光・便箋の質感。歴史と品格を感じさせる落ち着いたトーン。",
    badge: "手紙ノウハウ・本格エッセイに最適",
    gradientClass: "from-amber-950 via-yellow-900 to-amber-700",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    aiPromptStyle: "vintage antique illustration, sepia and warm amber tone, retro 1990s Japanese aesthetic, fountain pen letter texture, timeless emotional feeling, nostalgic masterpiece"
  },
  {
    id: "emerald_ocean_clean",
    name: "深海エメラルド・知性クリーン",
    tag: "💎 深海ブルー・モダン",
    description: "安心安全のAI技術と深海ブルー。知的で信頼感あふれるモダンで清潔なデザイン。",
    badge: "ノウハウ教科書・機能解説に最適",
    gradientClass: "from-slate-900 via-teal-900 to-emerald-700",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    aiPromptStyle: "clean serene digital art, deep ocean emerald and indigo blue gradient, crystal clear water, glass bottle floating, luminous glowing light, modern sophisticated aesthetic, 8k"
  }
];

// 🎨 AI Scene Illustration Item Structure
export interface SceneIllustrationItem {
  id: string;
  sceneIndex: number;
  chapterTitle: string;
  japaneseScenePrompt: string;
  englishPrompt: string;
  imageUrl: string;
  seed: number;
  toneId: string;
}

// 🌐 Pollinations AI URL Generator (100% Free, Instant 0-yen high-res image generator)
export const buildPollinationsUrl = (
  prompt: string,
  seed: number,
  aspect: "16:9" | "9:16" = "16:9"
): string => {
  const width = aspect === "16:9" ? 1200 : 720;
  const height = aspect === "16:9" ? 675 : 1280;
  const cleanPrompt = prompt.replace(/[^\w\s,.-]/gi, " ").trim().replace(/\s+/g, " ");
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
};

// 📖 Generate Eyecatch Illustration based on Story Theme & Tone
export const generateEyecatchIllustration = (
  title: string,
  theme: string,
  toneId: string,
  seed: number = Math.floor(Math.random() * 900000) + 100000
): { url: string; prompt: string; japaneseScene: string; seed: number } => {
  const preset = STYLE_TONE_PRESETS.find(p => p.id === toneId) || STYLE_TONE_PRESETS[0];

  let sceneDesc = "a glowing glass bottle with an emotional handwritten letter floating on gentle sunset ocean waves near Japanese beach, romantic nostalgia";
  let jpDesc = "夕暮れの穏やかな海に浮かぶ、手紙の入ったガラスのボトルメールと茜色の空";

  if (title.includes("教室") || title.includes("学校") || title.includes("放課後") || theme.includes("学校")) {
    sceneDesc = "a nostalgic Japanese classroom in 1990s at golden sunset, warm orange sunlight shining on empty wooden desks, gentle breeze, emotional memories";
    jpDesc = "夕焼けの光が差し込む放課後の教室と、想い出の机";
  } else if (title.includes("駅") || title.includes("旅") || title.includes("電車") || theme.includes("駅")) {
    sceneDesc = "a nostalgic Japanese countryside train station platform at dusk, warm lantern lights, gentle atmosphere of departure and reunion";
    jpDesc = "夕暮れの小さな駅のホームと、旅立ちと再会の灯り";
  } else if (title.includes("再会") || title.includes("奇跡") || theme.includes("再会")) {
    sceneDesc = "two nostalgic silhouettes meeting near sea at twilight, emotional reunion under starry sky, warm bokeh lights, heartwarming and poetic";
    jpDesc = "夕暮れの海辺で、奇跡の再会を果たすふたりのシルエットと星空";
  }

  const fullPrompt = `${sceneDesc}, ${preset.aiPromptStyle}`;
  const url = buildPollinationsUrl(fullPrompt, seed, "16:9");

  return {
    url,
    prompt: fullPrompt,
    japaneseScene: jpDesc,
    seed
  };
};

// 📖 Story-Driven Scene Illustrations Generator (Parses headings & extracts vivid scene motifs)
export const generateStoryIllustrationsForDraft = (
  content: string,
  toneId: string,
  draftTitle: string,
  seedBase: number = Date.now()
): SceneIllustrationItem[] => {
  const preset = STYLE_TONE_PRESETS.find(p => p.id === toneId) || STYLE_TONE_PRESETS[0];
  const lines = content.split("\n");
  const extractedSections: { title: string; body: string }[] = [];

  let currentHeading = "";
  let currentParagraph = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("【") ||
      trimmed.startsWith("■") ||
      trimmed.startsWith("第") ||
      trimmed.startsWith("1.") ||
      trimmed.startsWith("2.") ||
      trimmed.startsWith("3.")
    ) {
      if (currentHeading) {
        extractedSections.push({
          title: currentHeading,
          body: currentParagraph.slice(0, 100).trim()
        });
        currentParagraph = "";
      }
      currentHeading = trimmed.replace(/^[#\s【】■1234567890.:]+/, "").replace(/[】]/, "").trim();
    } else if (trimmed && !trimmed.startsWith("!") && !trimmed.startsWith(">") && !trimmed.startsWith("-")) {
      if (!currentParagraph) {
        currentParagraph = trimmed;
      }
    }
  }
  if (currentHeading) {
    extractedSections.push({
      title: currentHeading,
      body: currentParagraph.slice(0, 100).trim()
    });
  }

  // Fallback defaults
  if (extractedSections.length === 0) {
    extractedSections.push(
      { title: `放課後の記憶と、交わした約束`, body: "あの日の夕焼けと、机に残されたメモ" },
      { title: `時の流れと、海に託したボトルメール`, body: "何十年経っても色褪せない、たったひとつの想い出" },
      { title: `奇跡の照合と、ふたりの再会`, body: "ふたりだけの合言葉が解かれた瞬間、時間が動き出す" }
    );
  }

  // Preset Story Motifs per Scene Index
  const sceneMotifs = [
    {
      jp: "放課後の教室、夕暮れの茜色の空と机に残された思い出のメッセージ",
      en: "a nostalgic Japanese classroom at golden hour sunset, soft light through window blinds, wooden desks, emotional youth memories"
    },
    {
      jp: "静かな砂浜に流れ着いたガラスの小瓶と、万年筆で書かれた大切な手紙",
      en: "a clear glass bottle letter lying gently on peaceful seashore sand at dusk, soft glowing ocean waves, warm atmospheric lighting"
    },
    {
      jp: "満天の星空の下、街の明かりと再び巡り会うふたりのあたたかな情景",
      en: "two gentle silhouettes reuniting near sea under a starry night sky, warm glowing lanterns, emotional and heartwarming reunion"
    }
  ];

  const scenesToGenerate = extractedSections.slice(0, 3);
  return scenesToGenerate.map((sec, idx) => {
    const motif = sceneMotifs[idx % sceneMotifs.length];
    
    // Customize English prompt based on section title keywords
    let customSceneEn = motif.en;
    let customSceneJp = motif.jp;

    if (sec.title.includes("手紙") || sec.title.includes("便箋") || sec.title.includes("万年筆")) {
      customSceneEn = "an antique vintage fountain pen resting on a handwritten letter paper with warm candlelight, timeless feelings";
      customSceneJp = "柔らかな蝋燭の灯りに照らされた万年筆と、想いが綴られた便箋";
    } else if (sec.title.includes("海") || sec.title.includes("漂流") || sec.title.includes("波")) {
      customSceneEn = "a glass bottle floating on deep peaceful ocean with sunset reflections, ethereal glowing water";
      customSceneJp = "夕焼けを映す静かな海原を、想いを乗せて漂うガラスのボトルメール";
    } else if (sec.title.includes("再会") || sec.title.includes("合言葉") || sec.title.includes("奇跡")) {
      customSceneEn = "two people standing face to face by the twilight sea, emotional heartfelt moment, cinematic starry background";
      customSceneJp = "夕暮れの海辺で向き合い、奇跡の再会を果たすふたりの感動的な情景";
    }

    const fullPrompt = `${customSceneEn}, ${preset.aiPromptStyle}`;
    const sceneSeed = (seedBase + idx * 7919) % 1000000;
    const imageUrl = buildPollinationsUrl(fullPrompt, sceneSeed, "16:9");

    return {
      id: `scene_ai_${idx}_${Date.now()}`,
      sceneIndex: idx,
      chapterTitle: sec.title,
      japaneseScenePrompt: customSceneJp,
      englishPrompt: fullPrompt,
      imageUrl,
      seed: sceneSeed,
      toneId
    };
  });
};

export const AdminMarketingStudioTab = () => {
  const { token: authToken } = useAuth();

  // Top Studio Mode: "note_studio" (Articles/Curriculum) vs "shorts_studio" (Shorts/TikTok Video Production)
  const [studioMode, setStudioMode] = useState<"note_studio" | "shorts_studio">("note_studio");

  // Workflow Pipeline Steppers
  // Note: 1: Draft -> 2: Images -> 3: Preview -> 4: Export
  const [noteStep, setNoteStep] = useState<1 | 2 | 3 | 4>(1);
  // Shorts: 1: Script -> 2: Visuals -> 3: TTS/Narration -> 4: Final Preview -> 5: Export
  const [shortsStep, setShortsStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // 🎨 Brand Tone Selection State (Stored in localStorage)
  const [selectedTones, setSelectedTones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("remeets_brand_tones");
      return saved ? JSON.parse(saved) : ["watercolor_nostalgia", "twilight_cinematic"];
    } catch {
      return ["watercolor_nostalgia", "twilight_cinematic"];
    }
  });
  const [activeToneId, setActiveToneId] = useState<string>("watercolor_nostalgia");
  const [toneSaveNotice, setToneSaveNotice] = useState<string | null>(null);

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

  // 🎨 Story-Driven AI Illustrations (Pollinations AI Real-Time Generator)
  const [generatedEyecatch, setGeneratedEyecatch] = useState<{
    url: string;
    prompt: string;
    japaneseScene: string;
    seed: number;
  } | null>(null);
  const [sceneIllustrations, setSceneIllustrations] = useState<SceneIllustrationItem[]>([]);

  // Excluded/Deleted Image IDs in Step 3 Preview (allows removing unwanted images)
  const [excludedImageIds, setExcludedImageIds] = useState<string[]>([]);

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
          const first = data.data[0];
          setCurrentDraft(first);

          const eyecatch = generateEyecatchIllustration(first.title, first.theme, activeToneId);
          setGeneratedEyecatch(eyecatch);

          const scenes = generateStoryIllustrationsForDraft(first.content, activeToneId, first.title);
          setSceneIllustrations(scenes);
        }
      }
    } catch (e) {
      console.warn("Fetch drafts failed:", e);
    }
  };

  // 🎨 Handler: Select and Apply Tone Preset (Re-generates AI Illustrations with this tone & Saves as Default)
  const handleApplyTonePreset = (tone: StyleTonePreset) => {
    setActiveToneId(tone.id);

    let newTones = [...selectedTones];
    if (!newTones.includes(tone.id)) {
      newTones.push(tone.id);
    }
    setSelectedTones(newTones);
    localStorage.setItem("remeets_brand_tones", JSON.stringify(newTones));

    if (currentDraft) {
      // Re-generate Eyecatch with this tone
      const newEyecatch = generateEyecatchIllustration(currentDraft.title, currentDraft.theme, tone.id);
      setGeneratedEyecatch(newEyecatch);

      // Re-generate 3 Scene Illustrations with this tone
      const newScenes = generateStoryIllustrationsForDraft(currentDraft.content, tone.id, currentDraft.title);
      setSceneIllustrations(newScenes);

      setCurrentDraft(prev => prev ? {
        ...prev,
        imagePrompt: `${prev.theme}, ${tone.aiPromptStyle}`
      } : null);
    }

    setToneSaveNotice(`「${tone.name}」を基本スタイルとして保存しました！`);
    setTimeout(() => setToneSaveNotice(null), 3000);
  };

  // Toggle multiple tones selection
  const handleToggleToneSelection = (toneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (selectedTones.includes(toneId)) {
      if (selectedTones.length === 1) return;
      updated = selectedTones.filter(id => id !== toneId);
    } else {
      updated = [...selectedTones, toneId];
    }
    setSelectedTones(updated);
    localStorage.setItem("remeets_brand_tones", JSON.stringify(updated));
  };

  // 🔄 Regenerate Eyecatch with new AI seed
  const handleRegenerateEyecatch = () => {
    if (!currentDraft) return;
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    const newEyecatch = generateEyecatchIllustration(currentDraft.title, currentDraft.theme, activeToneId, newSeed);
    setGeneratedEyecatch(newEyecatch);
  };

  // 🔄 Regenerate single scene illustration with new seed
  const handleRegenerateScene = (sceneIndex: number) => {
    if (!currentDraft) return;
    const preset = STYLE_TONE_PRESETS.find(p => p.id === activeToneId) || STYLE_TONE_PRESETS[0];
    const newSeed = Math.floor(Math.random() * 900000) + 100000;

    setSceneIllustrations(prev => prev.map((sc, i) => {
      if (i === sceneIndex) {
        const newUrl = buildPollinationsUrl(sc.englishPrompt, newSeed, "16:9");
        return { ...sc, imageUrl: newUrl, seed: newSeed };
      }
      return sc;
    }));
  };

  // Download Generated Eyecatch as file
  const handleDownloadEyecatch = () => {
    if (!generatedEyecatch) return;
    window.open(generatedEyecatch.url, "_blank");
  };

  // Download Generated Scene Graphic as file
  const handleDownloadScene = (scene: SceneIllustrationItem) => {
    window.open(scene.imageUrl, "_blank");
  };

  // 🗑️ Remove Image from Step 3 Layout
  const handleExcludeImage = (imageId: string) => {
    setExcludedImageIds(prev => [...prev, imageId]);
  };

  // ↩️ Restore Image to Step 3 Layout
  const handleRestoreImage = (imageId: string) => {
    setExcludedImageIds(prev => prev.filter(id => id !== imageId));
  };

  // ── 1. Generate Note Content (Random Story or Next Curriculum Step) ──
  const handleGenerateNote = async (overrideType?: "note_story" | "note_howto") => {
    setIsGenerating(true);
    setSaveStatus(null);
    setExcludedImageIds([]);
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
        const activePreset = STYLE_TONE_PRESETS.find(p => p.id === activeToneId) || STYLE_TONE_PRESETS[0];

        // 1. Generate AI Eyecatch Illustration for this story
        const eyecatch = generateEyecatchIllustration(data.data.title, data.data.theme, activeToneId);
        setGeneratedEyecatch(eyecatch);

        // 2. Generate 3 Story-Driven Scene Illustrations for this article
        const scenes = generateStoryIllustrationsForDraft(data.data.content, activeToneId, data.data.title);
        setSceneIllustrations(scenes);

        setCurrentDraft({
          ...data.data,
          imagePrompt: `${data.data.theme}, ${activePreset.aiPromptStyle}`
        });
        setNoteStep(2);
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

  // ── Toggle Image Selection for Notes ──
  const toggleImageSelect = (path: string) => {
    if (selectedImages.includes(path)) {
      setSelectedImages(selectedImages.filter(p => p !== path));
    } else {
      setSelectedImages([...selectedImages, path]);
    }
  };

  // ── Play/Stop Video with Narration (SpeechSynthesis + Web Audio BGM) ──
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);

  const startVideoPlayback = () => {
    if (!currentDraft?.scenes || currentDraft.scenes.length === 0) return;
    setIsPlayingVideo(true);
    setCurrentSceneIndex(0);
    setVideoProgress(0);

    // 1. Play Soft Synthetic Ambient BGM
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // Soft warm A3
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      bgmGainRef.current = gain;
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }

    // 2. Play first scene TTS
    playSceneWithTTS(0, currentDraft.scenes);
  };

  const stopVideoPlayback = () => {
    setIsPlayingVideo(false);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const playSceneWithTTS = (idx: number, scenes: VideoScene[]) => {
    if (idx >= scenes.length) {
      stopVideoPlayback();
      return;
    }

    setCurrentSceneIndex(idx);
    setVideoProgress((idx / scenes.length) * 100);

    const scene = scenes[idx];
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(scene.narration);
      utter.lang = "ja-JP";
      utter.rate = narrationSpeed;
      utter.pitch = 1.05;

      utter.onend = () => {
        setTimeout(() => {
          playSceneWithTTS(idx + 1, scenes);
        }, 600);
      };

      utter.onerror = () => {
        setTimeout(() => {
          playSceneWithTTS(idx + 1, scenes);
        }, 3000);
      };

      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => {
        playSceneWithTTS(idx + 1, scenes);
      }, 4000);
    }
  };

  // Active Scene Graphics (filtering out excluded)
  const activeSceneGraphics = sceneGraphics.filter(sc => !excludedImageIds.includes(sc.id));
  const isEyecatchExcluded = excludedImageIds.includes("eyecatch_hero");

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Header & Studio Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
              <Sparkles size={14} className="text-yellow-400" />
              <span>RE-MEETS IN-HOUSE MEDIA STUDIO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              PRコンテンツ・制作プロダクション
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              「企画・執筆 → シーン別AI挿絵生成 → 完パケ確認 → ワンクリック手動配信」までを一連の流れで完結させます。
            </p>
          </div>

          {/* Mode Tabs: note Studio vs Shorts Production */}
          <div className="flex items-center p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setStudioMode("note_studio")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                studioMode === "note_studio"
                  ? "bg-white text-indigo-950 shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <BookOpen size={16} />
              <span>📝 note・教科書スタジオ</span>
            </button>
            <button
              onClick={() => setStudioMode("shorts_studio")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                studioMode === "shorts_studio"
                  ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <Video size={16} />
              <span>🎬 ショート動画プロダクション</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODE 1: NOTE & CURRICULUM STUDIO                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      {studioMode === "note_studio" && (
        <div className="space-y-6">

          {/* Stepper Wizard Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
            {[
              { step: 1, label: "1. 企画・自動執筆", icon: Wand2 },
              { step: 2, label: "2. 世界観トーン＆AI挿絵生成", icon: Palette },
              { step: 3, label: "3. note完成レイアウト確認", icon: Eye },
              { step: 4, label: "4. ワンクリック手動配信", icon: Send },
            ].map((st) => (
              <button
                key={st.step}
                onClick={() => setNoteStep(st.step as 1 | 2 | 3 | 4)}
                disabled={!currentDraft && st.step > 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                  noteStep === st.step
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <st.icon size={14} />
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: Plan & Draft Generation */}
          {noteStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Generation Controls */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 1: GENERATE</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">記事タイプの選択とAI執筆</h2>
                  <p className="text-xs text-slate-500">ボタンを1回押すだけで、AIが最適なテーマを選んで記事全文を書き上げます。</p>
                </div>

                {/* Sub-mode Select */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button
                    onClick={() => setNoteMode("random_story")}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      noteMode === "random_story"
                        ? "bg-white text-indigo-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>🎲 おまかせ実話</span>
                  </button>
                  <button
                    onClick={() => setNoteMode("curriculum_howto")}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                      noteMode === "curriculum_howto"
                        ? "bg-white text-indigo-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>📚 全12回教科書</span>
                  </button>
                </div>

                {/* Mode A: Random Story Generator */}
                {noteMode === "random_story" && (
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎲</span>
                      <div>
                        <h3 className="text-xs font-bold text-indigo-950">完全ランダム・想い出実話エッセイ</h3>
                        <p className="text-[11px] text-indigo-700">学校の屋上、転校生、駅前純喫茶など情緒ある物語をAIが自律執筆。</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateNote("note_story")}
                      disabled={isGenerating}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      <span>🎲 おまかせで感動実話を書かせる</span>
                    </button>
                  </div>
                )}

                {/* Mode B: Curriculum Step-by-Step Textbook */}
                {noteMode === "curriculum_howto" && (
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        <div>
                          <h3 className="text-xs font-bold text-teal-950">全12回ステップアップ教科書</h3>
                          <p className="text-[11px] text-teal-700">基礎から応用まで重複なく順次作成・アーカイブ</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-teal-200/60 text-teal-800 text-[10px] font-mono font-bold rounded-md">
                        第 {curriculumStep} / 12 講
                      </span>
                    </div>

                    <select
                      value={curriculumStep}
                      onChange={(e) => setCurriculumStep(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold text-teal-950 outline-none"
                    >
                      {CURRICULUM_STEPS.map((cs) => (
                        <option key={cs.step} value={cs.step}>
                          {cs.title} ({cs.phase})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleGenerateNote("note_howto")}
                      disabled={isGenerating}
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <BookOpen size={14} />}
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
                        onClick={() => {
                          setCurrentDraft(d);
                          const activePreset = STYLE_TONE_PRESETS.find(p => p.id === activeToneId) || STYLE_TONE_PRESETS[0];
                          const eyecatch = createEyecatchCanvas(d.title, d.theme, d.type, activePreset.eyecatchVariant);
                          setGeneratedEyecatch(eyecatch);
                          const scenes = generateSceneGraphicsForDraft(d.content, activeToneId, d.title);
                          setSceneGraphics(scenes);
                        }}
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 2: BRAND TONE & SCENE GRAPHICS</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">世界観トーン ＆ シーン別AI挿絵生成</h2>
                  <p className="text-xs text-slate-500">おすすめの世界観トーンを選ぶと、アイキャッチと記事内の全シーン挿絵が自動で統一生成されます。</p>
                </div>
                <button
                  onClick={() => setNoteStep(3)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>レイアウト確認へ進む</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* 🌟 Brand Tone Presets Selector */}
              <div className="space-y-3 bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
                      <Palette size={15} />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">🌟 おすすめブランド・トーン（世界観の統一設定）</h3>
                      <p className="text-[11px] text-slate-500">選んだトーンはブラウザに自動保存され、今後の記事・教科書生成時も自動適用されます。</p>
                    </div>
                  </div>
                  {toneSaveNotice && (
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 animate-fade-in flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>{toneSaveNotice}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {STYLE_TONE_PRESETS.map((tone) => {
                    const isActive = activeToneId === tone.id;
                    const isPreferred = selectedTones.includes(tone.id);
                    return (
                      <div
                        key={tone.id}
                        onClick={() => handleApplyTonePreset(tone)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between text-left group",
                          isActive
                            ? "bg-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-md scale-[1.02]"
                            : isPreferred
                            ? "bg-white/90 border-slate-300 hover:border-indigo-300 shadow-xs"
                            : "bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 opacity-80"
                        )}
                      >
                        <div className="space-y-2">
                          <div className={cn("h-2.5 w-full rounded-full bg-gradient-to-r shadow-2xs", tone.gradientClass)} />

                          <div className="flex items-start justify-between gap-1 pt-1">
                            <span className="font-serif font-bold text-xs text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                              {tone.name}
                            </span>
                            <button
                              title={isPreferred ? "標準トーンとして登録中" : "標準トーンに追加"}
                              onClick={(e) => handleToggleToneSelection(tone.id, e)}
                              className={cn(
                                "p-1 rounded-md text-[10px] transition-colors shrink-0",
                                isPreferred ? "text-indigo-600 bg-indigo-50" : "text-slate-300 hover:text-slate-500"
                              )}
                            >
                              <CheckSquare size={14} />
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {tone.description}
                          </p>
                        </div>

                        <div className="pt-3 flex items-center justify-between mt-2 border-t border-slate-100">
                          <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold", tone.badgeColor)}>
                            {tone.badge}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                              <span>適用中</span>
                              <Check size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1. 🎨 AI-Generated Custom Eyecatch Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-md border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-yellow-400/20 text-yellow-300">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold font-serif">ストーリー連動・AIアイキャッチイラスト (16:9 / 高解像度)</h3>
                      <p className="text-[11px] text-slate-300">
                        記事のタイトル・世界観に合わせてAIが自動描画した完全オリジナルイラストです（完全無料・0円）。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRegenerateEyecatch}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                    >
                      <RefreshCw size={13} />
                      <span>🔄 別の絵で描き直す（無料）</span>
                    </button>
                    <button
                      onClick={handleDownloadEyecatch}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Download size={13} />
                      <span>イラストを保存</span>
                    </button>
                  </div>
                </div>

                {generatedEyecatch ? (
                  <div className="space-y-2">
                    <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 group">
                      <img
                        src={generatedEyecatch.url}
                        alt="AI Generated Eyecatch"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-teal-300 border border-teal-500/30 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>アイキャッチ（最上部）に自動設定</span>
                      </div>
                    </div>
                    <div className="max-w-2xl mx-auto bg-black/40 border border-white/10 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
                      <span className="truncate">🎨 情景描写: {generatedEyecatch.japaneseScene}</span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">Seed: #{generatedEyecatch.seed}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                    <button
                      onClick={handleRegenerateEyecatch}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      <span>アイキャッチイラストを生成する</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. 🖼️ Story-Driven In-article Scene Illustrations */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-indigo-600" />
                      <span>記事のストーリーに連動したシーン別AI挿絵 ({sceneIllustrations.length}枚)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      各章のエピソード・情景をAIが読み取り、シーンごとの本物のアートイラストを完全自動生成しています。
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-bold">
                    完全無料・ストーリー専用イラスト
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sceneIllustrations.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-3 relative group hover:border-indigo-300 transition-all shadow-2xs"
                    >
                      <div className="aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                        <img
                          src={scene.imageUrl}
                          alt={scene.chapterTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-bold text-white border border-white/20">
                          SCENE 0{idx + 1}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{scene.chapterTitle}</h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                          「{scene.japaneseScenePrompt}」
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleRegenerateScene(idx)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <RefreshCw size={11} />
                          <span>描き直す</span>
                        </button>
                        <button
                          onClick={() => handleDownloadScene(scene)}
                          className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer bg-teal-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Download size={11} />
                          <span>保存</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: note-style Live Preview (with Story-driven Scene Illustrations & Delete button) */}
          {noteStep === 3 && currentDraft && (
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">STEP 3: NOTE LIVE PREVIEW</span>
                  <h2 className="text-base font-bold font-serif text-slate-900">note完成レイアウト確認</h2>
                  <p className="text-xs text-slate-500">各章の直下にストーリーAIイラストが配置されています。不要な絵は「🗑️ 挿絵を外す」で簡単に削除できます。</p>
                </div>
                <button
                  onClick={() => setNoteStep(4)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>レイアウトOK！配信へ進む</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* 1. note Hero Eyecatch Header */}
              {generatedEyecatch && !excludedImageIds.includes("eyecatch_hero") && (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
                  <img src={generatedEyecatch.url} alt="Hero" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleExcludeImage("eyecatch_hero")}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-rose-600 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 backdrop-blur-md transition-colors cursor-pointer opacity-90 group-hover:opacity-100"
                    title="アイキャッチ画像を外す"
                  >
                    <Trash2 size={13} />
                    <span>アイキャッチを外す</span>
                  </button>
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

              {/* 2. Body Content with Story-Driven AI Scene Illustrations inserted under each heading */}
              <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-6 font-serif">
                {currentDraft.content.split("\n\n").map((paragraph, pIdx) => {
                  const isHeading = paragraph.startsWith("#") || paragraph.startsWith("【") || paragraph.startsWith("■");
                  
                  // Match corresponding scene illustration for each heading
                  const matchingScene = isHeading ? sceneIllustrations.find((_, sIdx) => sIdx === Math.floor(pIdx / 3)) : null;

                  return (
                    <div key={pIdx} className="space-y-4">
                      {isHeading ? (
                        <div className="font-bold text-lg text-slate-900 pt-3 border-b border-slate-100 pb-1">
                          {paragraph.replace(/^[#\s【】■]+/, "").replace(/[】]/, "")}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                          {paragraph}
                        </p>
                      )}

                      {/* Render Matching Story AI Illustration under heading if not excluded */}
                      {matchingScene && !excludedImageIds.includes(matchingScene.id) && (
                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm my-4 group">
                          <img
                            src={matchingScene.imageUrl}
                            alt={matchingScene.chapterTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <button
                            onClick={() => handleExcludeImage(matchingScene.id)}
                            className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-rose-600 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 backdrop-blur-md transition-colors cursor-pointer opacity-90 group-hover:opacity-100"
                            title="この挿絵を記事から外す"
                          >
                            <Trash2 size={13} />
                            <span>挿絵を外す</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 3. Restore Deleted Images Area */}
              {excludedImageIds.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>除外された画像 ({excludedImageIds.length}件)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {excludedImageIds.map((id, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRestoreImage(id)}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <RotateCcw size={11} />
                        <span>復元する</span>
                      </button>
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
                      <img
                        src={scene.imageUrl || buildPollinationsUrl(`${scene.visual || currentDraft.title}, nostalgic Japanese anime style, golden hour twilight cinematic, vertical 9:16 composition`, 777 + idx * 31, "9:16")}
                        alt="Scene Visual"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
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
                  src={currentDraft.scenes[currentSceneIndex]?.imageUrl || buildPollinationsUrl(`${currentDraft.scenes[currentSceneIndex]?.visual || currentDraft.title}, nostalgic Japanese anime watercolor, golden hour twilight, 9:16 vertical composition`, 777 + currentSceneIndex * 31, "9:16")}
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
