import React, { useState } from 'react';
import { Video, Sparkles, Copy, ExternalLink, Check, Play, Film, MessageSquare, Volume2, Music, Layers, Wand2 } from 'lucide-react';

export const PRShortsHelperCard: React.FC = () => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const aiTools = [
    {
      category: "① 台本・構成・プロンプト生成",
      icon: MessageSquare,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      items: [
        { name: "Gemini 1.5 Pro / Flash", desc: "日本語表現に秀でたGoogle製最高峰AI。動画構成案や映像用英語プロンプトを1秒生成", url: "https://gemini.google.com/" },
        { name: "ChatGPT (GPT-4o)", desc: "フック（冒頭3秒）の効いたTikTok用コピーやナレーション原稿のブレストに最適", url: "https://chatgpt.com/" }
      ]
    },
    {
      category: "② 映像・動画・画像生成AI",
      icon: Film,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      items: [
        { name: "Runway Gen-3 Alpha", desc: "圧倒的にエモーショナルなシネマティック映像（9:16縦型）をプロンプトから生成", url: "https://runwayml.com/" },
        { name: "Luma Dream Machine", desc: "カメラワークや人物・エフェクトの滑らかな動きに強い最新動画生成AI", url: "https://lumalabs.ai/dream-machine" },
        { name: "Midjourney v6", desc: "最高品質の画像（--ar 9:16）を生成し、RunwayやLumaに読み込ませて動画化（推奨）", url: "https://www.midjourney.com/" }
      ]
    },
    {
      category: "③ 感情表現ナレーション音声AI",
      icon: Volume2,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      items: [
        { name: "ElevenLabs", desc: "世界最高峰の多言語音声AI。吐息や切ない感情表現・涙ぐむトーンまで精密調整可能", url: "https://elevenlabs.io/" },
        { name: "VOICEVOX", desc: "商用利用可能な無料の日本語音声合成エンジン。若者風・朗読風ナレーションに好評", url: "https://voicevox.hiroshiba.jp/" }
      ]
    },
    {
      category: "④ ノスタルジックBGM生成AI",
      icon: Music,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      items: [
        { name: "Suno AI (v3.5)", desc: "「アコースティック・ピアノ・エモい」等の指示でプロ級の15〜30秒インスト音源を作成", url: "https://suno.com/" },
        { name: "Udio", desc: "空間表現と哀愁漂うサウンドに強い音響生成AI。動画の長さに完璧フィット", url: "https://www.udio.com/" }
      ]
    },
    {
      category: "⑤ 全自動字幕・結合編集AI",
      icon: Layers,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      items: [
        { name: "Vrew (ブリュー)", desc: "AIが声を自動解析し無音カット＆カラオケ風テロップアニメーションを1発生成", url: "https://vrew.voxizer.com/" },
        { name: "CapCut Pro", desc: "ByteDance公式編集アプリ。自動字幕・エモいフィルター・BGMフェードがワンタップ", url: "https://www.capcut.com/" },
        { name: "InVideo AI", desc: "【ワンストップ】テキスト1行で映像・音声・BGM・字幕入りの完成動画を丸ごと全自動作成", url: "https://invideo.io/" }
      ]
    }
  ];

  const scriptA = `【15秒ショート動画台本：ノスタルジー・エモ訴求編】
■ 0:00 - 0:03 (冒頭のフック)
[映像] 夕暮れの教室や駅のホーム（9:16縦型）。ReMEETsのクイズ作成画面が半透明で合成。
[テロップ] 「もう、二度と会えない」と思ってた。連絡先も知らない、あの日の友達。
[音声/ナレーション] 「ねえ、もう会えないと思ってたあの人のこと、覚えてる？」

■ 0:03 - 0:08 (アプリの特徴・ギミック)
[映像] スマホ画面。思い出クイズ「Q. 中2の修学旅行、夜こっそりラーメンを食べたお店は？」に入力し正解エフェクト。
[テロップ] 「二人の思い出」が、手紙のパスワード。
[音声/ナレーション] 「共通の思い出クイズを正解しないと絶対に繋がらない安全なアプリ、ReMEETs。」

■ 0:08 - 0:12 (信頼・安心・差別化)
[映像] 海岸に漂うボトルメールと、手紙を開封して微笑む人物。
[テロップ] 出会い系じゃない、Re-Meet（再会）の安全インフラ。
[音声/ナレーション] 「見知らぬ人とは絶対に繋がれない。思い出せる確かな絆だけを、安全に結び直す場所。」

■ 0:12 - 0:15 (行動喚起 CTA)
[映像] 輝くReMEETsロゴとプロフィールの誘導画面。
[テロップ] 無料公開中・プロフィールリンクからボトルを流す
[音声/ナレーション] 「ReMEETsでボトルを流してみよう。プロフィールのリンクから。」`;

  const scriptB = `【30秒ショート動画台本：リアル体験再現編（タイムカプセルと15年ぶりの再会）】
■ 0:00 - 0:05
[映像] ノスタルジックな旧校舎。テロップ「【実録】連絡先のわからないアイツと、15年ぶりに再会できた方法」
[音声/ナレーション] 「探偵に頼むと高額な人探し。でも、ReMEETsなら『思い出クイズ』ひとつで安全に再会できるって本当？」

■ 0:05 - 0:12
[映像] スマホでクイズ作成「Q. 私たちが部活の後にいつも食べていた駄菓子の名前は？」リンクをSNSや同窓会グループに投稿。
[テロップ] 探偵不要・100%無料。必要なのは「二人の思い出」だけ。
[音声/ナレーション] 「やり方は簡単。二人の思い出をクイズにしてボトルを海に流すだけ。そのリンクを共有するか、相手が探しに来るのを待つだけ。」

■ 0:12 - 0:20
[映像] 相手が正解し、マッチング成立。手紙・連絡先が開通するエフェクト画面。
[テロップ] ストーカー・サクラを100%排除。面識者専用の『鉄壁セキュリティ』
[音声/ナレーション] 「出会い系と違って、知らない不審者からは絶対メッセージが来ない。ストーカー規制、未成年防衛も完備。」

■ 0:20 - 0:30
[映像] 夕日に映るシルエットとボトルメールのアイコン。プロフィールリンクへの誘導。
[テロップ] 「思い出して、クイズを解く。」ReMEETs (リ・ミーツ)
[音声/ナレーション] 「あなたも戻りたいあの時、再会したいあの人へボトルメッセージを設置してみませんか？詳細はプロフィールのリンクから。」`;

  const scriptC = `【20秒ショート動画台本：警察公安適合・安全防衛インフラアピール編】
■ 0:00 - 0:05
[映像] ネットの危険性を示す抽象映像から、クリーンなセキュリティシールドロゴへ。
[テロップ] 警察公安相談完了 / 出会い系サイト規制法【完全非該当】
[音声/ナレーション] 「出会い系サイトの被害やストーカーが心配？ReMEETsは治安コンプライアンスを追求した日本初の再会インフラです。」

■ 0:05 - 0:12
[映像] 手紙作成画面とAIモデレーション検閲ログ画面。
[テロップ] 共通の思い出クイズ＋AI検閲エンジンで悪質ユーザーを100%遮断
[音声/ナレーション] 「共通の思い出クイズを突破した面識者同士しか繋がれず、AI安全エンジンが24時間悪質メッセージを隔離。」

■ 0:12 - 0:20
[映像] 安心して大切な人へ手紙を届ける様子と、ReMEETs公式ロゴ。
[テロップ] 絆を安全に結び直す『ReMEETs』今すぐ無料作成
[音声/ナレーション] 「安心だからこそ、大切な人へ届く。あなたも二人の思い出で、新しい一歩を踏み出そう。」`;

  const geminiPrompt = `ReMEETsという、相手との共通の思い出クイズ（パスワード）を解かないと手紙が開けない、ストーカー犯罪や不当出会いを完全に排除した日本初の再会アプリの紹介ショート動画（20秒）の台本を作成してください。
TikTokやReelsでバズるようにエモいアコースティックピアノが似合うノスタルジックな物語調で、ナレーションのセリフ、画面表示用テロップ、および動画生成AI（Runway / Luma）に入力するための英文映像用プロンプトをタイムライン形式で出力してください。`;

  return (
    <div className="bg-slate-900 text-slate-100 p-6 md:p-8 rounded-3xl border-2 border-[#3B627F] shadow-xl font-sans mb-8 space-y-6">
      {/* バナーヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#3B627F]/30 border border-[#3B627F] rounded-2xl text-cyan-400 shrink-0">
            <Video size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                PR & MARKETING TOOLKIT
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono px-2 py-0.5 rounded-full uppercase font-bold">
                GENERATIVE AI READY
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white mt-1 font-serif">
              🎬 公式ショート動画（TikTok / Shorts / Reels）立ち上げ＆AIシナリオ活用ガイド
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              動画編集スキル不要。AIツールとテンプレート台本を活用し、10分でバズ動画を完全自動生成できます。
            </p>
          </div>
        </div>
      </div>

      {/* 1. 生成AIツールリンク＆おすすめサイト一覧 */}
      <div>
        <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Wand2 size={15} />
          <span>① ショート動画制作におすすめの生成AIサイト・ツール一覧（直リンク付）</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiTools.map((tool, idx) => {
            const IconComp = tool.icon;
            return (
              <div key={idx} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 mb-2">
                    <span className={`p-1.5 rounded-lg border text-xs ${tool.color}`}>
                      <IconComp size={14} />
                    </span>
                    <span className="text-xs font-bold text-white">{tool.category}</span>
                  </div>
                  <div className="space-y-2">
                    {tool.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-cyan-200">{item.name}</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-slate-800 hover:bg-[#3B627F] text-slate-300 hover:text-white px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>サイトを開く</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ショート動画シナリオ台本テンプレート（ワンクリックコピー） */}
      <div className="pt-2 border-t border-slate-800">
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Copy size={15} />
          <span>② そのまま使える「ショート動画台本テンプレート」（ワンクリックコピー）</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 台本A */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  15秒・ノスタルジー編
                </span>
                <button
                  onClick={() => handleCopy(scriptA, 'scriptA')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'scriptA' ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">コピー完了！</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>台本をコピー</span>
                    </>
                  )}
                </button>
              </div>
              <h5 className="text-xs font-bold text-white mb-1.5">【台本A】あの頃の記憶が鍵になる</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-4 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                {scriptA}
              </p>
            </div>
          </div>

          {/* 台本B */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  30秒・体験再現編
                </span>
                <button
                  onClick={() => handleCopy(scriptB, 'scriptB')}
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'scriptB' ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">コピー完了！</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>台本をコピー</span>
                    </>
                  )}
                </button>
              </div>
              <h5 className="text-xs font-bold text-white mb-1.5">【台本B】タイムカプセルと15年ぶりの再会</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-4 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                {scriptB}
              </p>
            </div>
          </div>

          {/* 台本C */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  20秒・警察公安適合編
                </span>
                <button
                  onClick={() => handleCopy(scriptC, 'scriptC')}
                  className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'scriptC' ? (
                    <>
                      <Check size={11} className="text-emerald-400" />
                      <span className="text-emerald-400">コピー完了！</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>台本をコピー</span>
                    </>
                  )}
                </button>
              </div>
              <h5 className="text-xs font-bold text-white mb-1.5">【台本C】出会い系ゼロ・安全防衛インフラPR</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-4 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
                {scriptC}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gemini / ChatGPT 用「シナリオ＆画像・動画プロンプト一括生成プロンプト」 */}
      <div className="pt-2 border-t border-slate-800">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-white">LLM（Gemini / ChatGPT）投函用 プロンプト作成呪文</span>
            </div>
            <p className="text-[11px] text-slate-400">
              以下のプロンプトをそのまま Gemini や ChatGPT に貼り付けると、オリジナルシナリオと動画生成AI用英語プロンプトが1発で出力されます。
            </p>
          </div>
          <button
            onClick={() => handleCopy(geminiPrompt, 'geminiPrompt')}
            className="px-3 py-1.5 bg-[#3B627F] hover:bg-[#3B627F]/80 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {copiedType === 'geminiPrompt' ? (
              <>
                <Check size={13} className="text-emerald-300" />
                <span className="text-emerald-300">プロンプトコピー完了！</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>生成用呪文をコピー</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
