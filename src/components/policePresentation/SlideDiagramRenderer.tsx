import React from "react";
import {
  Sparkles, Shield, ShieldAlert, ShieldCheck, CheckCircle2, Lock, Unlock, Key,
  Trash2, FileText, Clock, UserCheck, Award, Waves, Mail, School, Home, Users,
  ArrowRight, HelpCircle, Radio, ExternalLink, Layers, AlertTriangle, FileCheck
} from "lucide-react";

export interface SlideDiagramRendererProps {
  id: number;
}

  export const SlideDiagramRenderer: React.FC<SlideDiagramRendererProps> = ({ id }) => {
    const cardBase =
      'flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-slate-200/80 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300';
    const tagBase =
      'absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-[#059669] font-bold tracking-widest leading-none bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full';

    switch (id) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1A2735] to-[#111A24] border border-slate-700/60 rounded-2xl h-full w-full min-h-[180px] shadow-lg relative text-white">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center mb-2 shadow-inner">
              <ShieldCheck className="text-emerald-400" size={32} />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              GOVERNMENT COMPLIANCE
            </span>
            <span className="text-xs font-serif font-bold text-slate-100 mt-1">
              公安委員会・警察生活安全課 適合モデル
            </span>
          </div>
        );
      case 2: // 名前の由来
        return (
          <div className={cardBase}>
            <div className={tagBase}>RE-MEET ARCHITECTURE</div>
            <div className="flex items-center gap-3 sm:gap-5 z-10 my-auto">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 shadow-sm flex items-center justify-center text-slate-800 font-bold font-serif text-sm">
                  A
                </div>
                <span className="text-[9px] text-slate-600 mt-1 font-medium">あなた</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-emerald-700 font-mono leading-none bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  相互の記憶
                </span>
                <div className="h-[2px] w-14 sm:w-20 bg-gradient-to-r from-slate-300 via-emerald-500 to-slate-300 relative">
                  <div className="absolute -top-1 left-1/2 -ml-1 text-emerald-600 animate-pulse text-[10px]">
                    ✦
                  </div>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">Re-meet</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-sm flex items-center justify-center text-emerald-700 font-bold font-serif text-sm">
                  B
                </div>
                <span className="text-[9px] text-emerald-700 mt-1 font-medium">懐かしい知人</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-2 text-center leading-relaxed">
              不特定の「出会い」を排除し、過去の知人との「再会（Re-meet）」に特化。
            </p>
          </div>
        );
      case 3: // コンセプト
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              DRIFT CAPSULE
            </div>
            <div className="relative flex items-center justify-center w-full py-2 z-10">
              <Waves className="absolute text-emerald-500/20 animate-pulse w-20 h-20" />
              <div className="relative animate-bounce duration-1000">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-400/60 flex items-center justify-center shadow-lg">
                  <Mail size={22} className="text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[7px] font-mono font-bold">
                  16:9
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-300 mt-1 text-center leading-relaxed max-w-[220px]">
              投函から波間に漂流。記憶の暗号キーにより本人だけに届くボトルメール構造。
            </p>
          </div>
        );
      case 4: // 構築目的
        return (
          <div className={cardBase}>
            <div className={tagBase}>SOCIAL MISSION</div>
            <div className="grid grid-cols-3 gap-2 w-full my-auto z-10">
              <div className="flex flex-col items-center p-2 bg-rose-50/70 rounded-xl border border-rose-100 text-center">
                <Home size={16} className="text-rose-500" />
                <span className="text-[8px] font-bold text-rose-700 mt-1">孤立化防止</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-emerald-50/70 rounded-xl border border-emerald-100 text-center">
                <Users size={16} className="text-emerald-600" />
                <span className="text-[8px] font-bold text-emerald-700 mt-1">震災断絶回復</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-sky-50/70 rounded-xl border border-sky-100 text-center">
                <School size={16} className="text-sky-600" />
                <span className="text-[8px] font-bold text-sky-700 mt-1">自発的隣人網</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-1 text-center leading-relaxed">
              家族・親族衰退期における、過去の恩師・同窓生とのセーフティネット再生。
            </p>
          </div>
        );
      case 5: // ターゲットユーザー
        return (
          <div className={cardBase}>
            <div className={tagBase}>TARGET GROUPS</div>
            <div className="grid grid-cols-2 gap-2 w-full my-auto z-10">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <School className="text-emerald-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">学校の同窓生</div>
                  <div className="text-[7px] text-slate-500">幼馴染・クラスメイト</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Home className="text-sky-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">旧隣人・被災者</div>
                  <div className="text-[7px] text-slate-500">転居・区画整理で断絶</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Users className="text-indigo-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">元同僚・仕事仲間</div>
                  <div className="text-[7px] text-slate-500">退職・部署移動後の再会</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <Award className="text-amber-600 shrink-0" size={16} />
                <div className="text-left">
                  <div className="text-[8.5px] font-bold text-slate-800">恩師・指導者</div>
                  <div className="text-[7px] text-slate-500">感謝を伝えたい相手</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 6: // 主要機能①（投函＆漂流）
        return (
          <div className={cardBase}>
            <div className={tagBase}>FUNCTION: DRIFT</div>
            <div className="flex items-center gap-1.5 font-bold text-slate-700 my-auto">
              <span className="text-[8.5px] bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                ① 国名＋名前投函
              </span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="text-[8.5px] bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                ② 漂流待機
              </span>
              <ArrowRight size={12} className="text-slate-400" />
              <span className="text-[8.5px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                ③ クイズ開門
              </span>
            </div>
            <p className="text-[9px] text-slate-600 mt-2 text-center leading-relaxed">
              詳細住所不要。システム波間に漂流し、第三者から完全に遮断された空間。
            </p>
          </div>
        );
      case 7: // 主要機能②（想い出クイズゲート）
        return (
          <div className={cardBase}>
            <div className={tagBase}>QUIZ GATE SHIELD</div>
            <div className="flex flex-col gap-2 w-full my-auto z-10 max-w-[230px]">
              <div className="flex items-center gap-2.5 bg-slate-900 text-emerald-400 p-2.5 rounded-xl shadow-md border border-slate-800">
                <Lock size={18} className="animate-pulse shrink-0 text-emerald-400" />
                <div className="text-left flex flex-col">
                  <span className="text-[7.5px] font-mono text-emerald-400 tracking-wider">
                    QUIZ VERIFICATION GATE
                  </span>
                  <span className="text-[10px] font-bold text-white">
                    二人だけの共有記憶に全問正答で開門
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[7.5px] font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-emerald-900">
                <span>✦ 表記ゆれ自動救済 (Levenshtein ≤ 2)</span>
                <span className="font-bold bg-emerald-200 text-emerald-900 px-1 rounded">ACTIVE</span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 mt-1 text-center leading-tight">
              共通の想い出が高精度認証キーとなり、第三者を遮断しつつ正当な再会を支援。
            </p>
          </div>
        );
      case 8: // 主要機能③（連絡先安全引き渡しモデル）
        return (
          <div className={cardBase}>
            <div className={tagBase}>CONTACT BRIDGE</div>
            <div className="w-full flex flex-col gap-2 my-auto max-w-[220px] bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-slate-800">連絡先安全引き渡し（セキュア・ブリッジ）</span>
                </div>
                <ShieldCheck className="text-emerald-600" size={13} />
              </div>
              <div className="space-y-1">
                <div className="bg-white text-slate-800 text-[8.5px] p-2 rounded-xl border border-slate-200 font-mono">
                  <div className="text-[7px] text-slate-400">お相手の開示連絡先:</div>
                  <div className="font-bold text-emerald-700">LINE ID: @sample_friend</div>
                </div>
                <div className="bg-emerald-50 text-emerald-900 text-[7.5px] p-1.5 rounded-lg border border-emerald-200">
                  🔒 連絡先安全引き渡し完結型設計で、トラブルや犯罪リスクをシステム構造上ゼロに。
                </div>
              </div>
            </div>
            <p className="text-[8.5px] text-emerald-800 font-bold text-center leading-normal mt-1 flex items-center justify-center gap-1">
              <Shield size={10} className="text-emerald-600" /> 緊急通報・ワンタップブロック機能常備
            </p>
          </div>
        );
      case 9: // 管理・運用①（セキュリティダッシュボード）
        return (
          <div className={cardBase}>
            <div className={tagBase}>SOC REALTIME</div>
            <div className="flex items-center gap-3 my-auto z-10 w-full justify-center">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 flex flex-col items-center shadow-sm">
                <ShieldAlert size={20} className="animate-bounce" />
                <span className="text-[7.5px] font-bold mt-1">検知盾</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                  THREAT MONITOR
                </span>
                <span className="text-[11px] font-bold text-rose-600 mt-1">不正突破：0件</span>
                <p className="text-[8.5px] text-slate-500 leading-tight">
                  24時間総当たり・不正通信自動監視
                </p>
              </div>
            </div>
          </div>
        );
      case 10: // 管理・運用②（シャドウフラグ隔離）
        return (
          <div className={cardBase}>
            <div className={tagBase}>SHADOW FILTER</div>
            <div className="flex items-center justify-between w-full max-w-[220px] my-auto gap-2">
              <div className="flex flex-col items-center p-1.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
                <span className="text-[7.5px] font-bold">悪質アクセス</span>
                <span className="text-[6.5px] font-mono mt-0.5 bg-rose-200/60 px-1 rounded">
                  shadow: 1
                </span>
              </div>
              <div className="h-[2px] bg-slate-300 w-10 relative flex items-center justify-center">
                <div className="absolute w-1.5 h-3 bg-rose-500 rounded-full" />
              </div>
              <div className="flex flex-col items-center p-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                <span className="text-[7.5px] font-bold">一般ユーザー</span>
                <span className="text-[6.5px] font-mono text-emerald-700 font-bold">影響 0%</span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center leading-normal mt-2">
              つきまとい者の投稿は、本人には成功と見せかけ裏側で完全隔離。
            </p>
          </div>
        );
      case 11: // 非機能①（最高レベルの暗号化）
        return (
          <div className={cardBase}>
            <div className={tagBase}>CRYPTOGRAPHIC ENGINE</div>
            <div className="flex flex-col items-center gap-1.5 my-auto z-10">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-800 font-serif">
                  SHA-256 不可逆ストレッチ
                </span>
              </div>
              <div className="text-[8.5px] font-mono bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-200 text-slate-600">
                salt_key_hash_5a9b8dc9...
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center leading-relaxed">
              想い出パスワードが平文で保存されることは一切ありません。
            </p>
          </div>
        );
      case 12: // 非機能②（即時オプトアウト）
        return (
          <div className={cardBase}>
            <div className={tagBase}>ZERO TRACE PRIVACY</div>
            <div className="flex items-center gap-3.5 my-auto z-10">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
                <Trash2 size={20} className="animate-pulse" />
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-mono text-rose-500 uppercase tracking-widest leading-none">
                  OPT-OUT GUARANTEE
                </span>
                <span className="text-[11px] font-bold text-slate-800 mt-1">
                  24時間以内物理削除の保証
                </span>
                <p className="text-[8.5px] text-slate-500 leading-tight">
                  物理サーバーからもデータを完全に消去
                </p>
              </div>
            </div>
          </div>
        );
      case 13: // システム構成
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SYSTEM TOPOLOGY
            </div>
            <div className="grid grid-cols-3 gap-2 w-full max-w-[220px] my-auto text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7px] text-emerald-400 font-mono">SPA</span>
                <span className="font-bold text-white mt-1 text-[8.5px]">React 18</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7px] text-emerald-400 font-mono">Server</span>
                <span className="font-bold text-emerald-300 mt-1 text-[8.5px]">Express</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center shadow">
                <span className="text-[7px] text-emerald-400 font-mono">Security</span>
                <span className="font-bold text-sky-300 mt-1 text-[8.5px]">Gemini AI</span>
              </div>
            </div>
            <p className="text-[8px] text-slate-400 text-center leading-normal mt-1">
              サーバーサイドAPIプロキシ。APIキーはブラウザに一切露出しません。
            </p>
          </div>
        );
      case 14: // 対比分析
        return (
          <div className={cardBase}>
            <div className={tagBase}>COMPARISON MATRIX</div>
            <div className="flex flex-col gap-2 w-full my-auto text-xs max-w-[210px]">
              <div className="flex items-center justify-between p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-[8.5px]">
                <span>一般的なマッチング</span>
                <span className="font-bold">無差別（危険✕）</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[8.5px]">
                <span>ReMEETs 再会モデル</span>
                <span className="font-bold">既知限定（安全◯）</span>
              </div>
            </div>
          </div>
        );
      case 15: // 第2部表紙
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1A2735] to-[#111A24] border border-slate-700/60 rounded-2xl h-full w-full min-h-[180px] shadow-lg relative text-white">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center mb-2">
              <Award className="text-emerald-400" size={28} />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
              LEGAL & SECURITY DEEP DIVE
            </span>
            <span className="text-xs font-serif font-bold text-slate-100 mt-1">
              第2部：法規適合性と10大防衛アーキテクチャ
            </span>
          </div>
        );
      case 16: // 異性紹介事業非該当の証明
        return (
          <div className={cardBase}>
            <div className={tagBase}>LEGAL OPINION</div>
            <div className="flex items-center gap-3 my-auto z-10 text-emerald-800 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider leading-none">
                  POLICE ADAPTATION
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  「異性紹介事業」非該当 判定
                </span>
                <p className="text-[8px] text-slate-600 leading-tight">警察公安・行政書面要件適合</p>
              </div>
            </div>
          </div>
        );
      case 17: // 共有記憶認証法理
        return (
          <div className={cardBase}>
            <div className={tagBase}>AUTHENTICATION LAW</div>
            <div className="flex flex-col items-center gap-1 my-auto text-emerald-800">
              <Unlock size={22} className="text-emerald-600" />
              <span className="text-[10.5px] font-bold mt-1 text-slate-800">
                既知の記憶 ＝ 暗号通信路の鍵
              </span>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center leading-normal">
              二人だけの記憶クイズが、「新規出会い」ではない事実を電子証明。
            </p>
          </div>
        );
      case 18: // 時間制限ロック
        return (
          <div className={cardBase}>
            <div className={tagBase}>IP BRUTE GUARD</div>
            <div className="flex flex-col items-center gap-2 my-auto text-red-600 w-full">
              <div className="flex items-center gap-3 bg-rose-50 p-2.5 rounded-xl border border-rose-200 max-w-[220px]">
                <Clock size={20} className="text-rose-500 animate-spin-slow shrink-0" />
                <div className="text-left">
                  <span className="text-[7.5px] font-bold text-rose-500 uppercase tracking-widest leading-none">
                    LOCKOUT SYSTEM
                  </span>
                  <div className="text-[11px] font-bold text-slate-900 mt-0.5 leading-tight">
                    5回連続誤答で24H完全ロック
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-rose-400 font-mono text-[7.5px] px-2.5 py-0.5 rounded border border-rose-900 animate-pulse">
                STATUS: IP_LOCKOUT_ACTIVE
              </div>
            </div>
          </div>
        );
      case 19: // 常用姓名照合
        return (
          <div className={cardBase}>
            <div className={tagBase}>NAME REGEX DEFENSE</div>
            <div className="flex items-center gap-3.5 my-auto z-10">
              <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl">
                <UserCheck size={20} />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-[8px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 self-start">
                  フルネーム規制
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  「山田太郎」等の実名は警告
                </span>
                <p className="text-[8px] text-slate-500 leading-tight">本名の直截露出から保護</p>
              </div>
            </div>
          </div>
        );
      case 20: // 連絡先ステルス
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              STEALTH MASK
            </div>
            <div className="w-full flex flex-col gap-1 max-w-[220px] my-auto bg-slate-900 rounded-xl p-2.5 border border-slate-800 font-mono text-[8px] text-left">
              <div className="flex items-center justify-between text-[7px] text-slate-500 pb-1 border-b border-slate-800">
                <span>REGEX SCAN FILTER</span>
                <span className="text-rose-400 font-bold animate-pulse">BLOCKED</span>
              </div>
              <div className="space-y-1 text-slate-300 mt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 line-through">LINE ID: my_id_123</span>
                  <span className="text-rose-400 font-bold">→ MASK_ID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 line-through">TEL: 090-1234-5678</span>
                  <span className="text-rose-400 font-bold">→ MASK_TEL</span>
                </div>
                <div className="pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                  RESULT: LINE ID: **** / TEL: ****
                </div>
              </div>
            </div>
          </div>
        );
      case 21: // Gemini AI モデレーション
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SEMANTIC AI FILTER
            </div>
            <div className="w-full flex flex-col gap-1.5 my-auto max-w-[220px] text-left">
              <div className="bg-slate-900 text-white rounded-xl p-2.5 border border-slate-800 font-mono text-[8px] space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Sparkles size={10} /> Gemini Security Agent
                  </span>
                  <span>v2.5</span>
                </div>
                <div className="text-slate-400 leading-tight">
                  INPUT: "お前どこにいる？絶対探すからな"
                </div>
                <div className="border-t border-slate-800 pt-1 flex flex-col gap-0.5">
                  <div className="text-rose-400 font-bold flex items-center justify-between">
                    <span>危険検知:</span>
                    <span className="bg-rose-950 text-rose-300 px-1 rounded">執着・脅迫性 98%</span>
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center justify-between">
                    <span>自動処置:</span>
                    <span className="bg-emerald-950 text-emerald-300 px-1 rounded">即時隔離作動</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 22: // シャドウフィルタ
        return (
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-[#1A2735] border border-slate-700/60 rounded-2xl h-full w-full min-h-[160px] md:min-h-[220px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className="absolute top-2 right-2.5 font-mono text-[8px] sm:text-[9px] text-emerald-400 font-bold tracking-widest leading-none bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SHADOW SANDBOX
            </div>
            <div className="w-full max-w-[200px] bg-slate-900 rounded-xl p-2.5 font-mono text-[8px] text-emerald-400 my-auto shadow-md text-left">
              <div className="text-slate-500">$ sys_shadow_scan</div>
              <div className="text-rose-400 font-bold">$ ATTACK DETECTED !</div>
              <div className="text-emerald-300 font-bold animate-pulse">
                $ SHADOW_FLAG_ISOLATION: ON
              </div>
            </div>
            <p className="text-[8.5px] text-slate-300 text-center leading-normal mt-1.5">
              冷やかし・荒らしユーザーは孤立した空間に送られます。
            </p>
          </div>
        );
      case 23: // 青少年保護
        return (
          <div className={cardBase}>
            <div className={tagBase}>YOUTH PROTECTION</div>
            <div className="flex items-center gap-3.5 my-auto z-10 text-red-600 bg-rose-50/70 p-2.5 rounded-2xl border border-rose-200">
              <div className="w-10 h-10 border-2 border-rose-500 rounded-full flex items-center justify-center font-bold text-rose-500 text-xs sm:text-sm font-sans shrink-0">
                18+
              </div>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest leading-none">
                  MINOR PROTECTION
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">高校生以下は完全不可</span>
                <p className="text-[8px] text-slate-500 leading-tight">非行・児童虐待被害を徹底予防</p>
              </div>
            </div>
          </div>
        );
      case 24: // 電子的利用宣誓ゲート
        return (
          <div className={cardBase}>
            <div className={tagBase}>PLEDGE AUDIT GATE</div>
            <div className="flex flex-col items-center gap-2 w-full my-auto">
              <div className="w-full max-w-[210px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 relative shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <span className="text-[7.5px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" /> 法令・規約遵守電子的宣誓
                  </span>
                  <span className="text-[6.5px] font-mono text-slate-400">PLEDGE_GATE</span>
                </div>
                <div className="space-y-1 text-[7.5px] text-slate-700">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>18歳以上（高校生除く）の利用であること</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>ストーカー・嫌がらせ・監視目的でないこと</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">☑</span>
                    <span>法令遵守・連絡先適正利用の確約</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[6.5px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <span>LOGGED: IP & TIMESTAMP</span>
                  <span className="font-bold">VERIFIED ✓</span>
                </div>
              </div>
              <p className="text-[8.5px] text-emerald-800 font-bold text-center leading-normal">
                連絡先開示直前の厳格な電子的利用宣誓。タイムスタンプ・接続元IPを監査保全。
              </p>
            </div>
          </div>
        );
      case 25: // チケット全履歴保全
        return (
          <div className={cardBase}>
            <div className={tagBase}>TICKET & AI DRAFT</div>
            <div className="w-full max-w-[230px] bg-slate-50 rounded-xl p-2.5 shadow-sm border border-slate-200 flex flex-col gap-1.5 my-auto text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="text-[8.5px] font-bold text-slate-900 flex items-center gap-1">
                  🎫 チケットスレッド永続化
                </span>
                <span className="text-[6.5px] font-mono bg-sky-100 text-sky-800 px-1 py-0.5 rounded">
                  TICKET_DB
                </span>
              </div>
              <div className="space-y-1 text-[7.5px] font-mono">
                <div className="bg-white p-1 rounded border border-slate-200 text-slate-700">
                  <span className="text-slate-400">#REQ-1092:</span> ユーザーからの通報・相談内容
                </div>
                <div className="bg-purple-50 p-1 rounded border border-purple-200 text-purple-900 flex items-center justify-between">
                  <span>✨ Gemini AI コンプライアンス返信</span>
                  <span className="text-[6.5px] bg-purple-200 text-purple-800 px-1 rounded">生成完了</span>
                </div>
              </div>
              <div className="text-[7px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
                <span>送受信全ログ完全永続化</span>
                <span className="text-emerald-700 font-bold">警察・司法証拠保全</span>
              </div>
            </div>
          </div>
        );
      case 26: // 【USER REQUEST: 無料はグリーン、600円はオレンジで分離】
        return (
          <div className={cardBase}>
            <div className={tagBase}>PRICING & VERIFICATION</div>
            <div className="w-full max-w-[230px] flex flex-col gap-2 my-auto">
              {/* 無料 (グリーン) */}
              <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-500/80 px-3 py-2 rounded-xl text-left shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                    FREE TIER
                  </span>
                  <span className="text-[10px] font-bold text-emerald-950">
                    年齢確認（18歳以上宣誓）
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full shadow-sm">
                  無料
                </span>
              </div>

              {/* 600円 (オレンジ) */}
              <div className="flex items-center justify-between bg-orange-50 border-2 border-orange-500/80 px-3 py-2 rounded-xl text-left shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-mono text-orange-700 font-bold uppercase tracking-wider">
                    OFFICIAL eKYC
                  </span>
                  <span className="text-[10px] font-bold text-orange-950">
                    公的身分証(eKYC)認証
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-white bg-orange-600 px-2.5 py-0.5 rounded-full shadow-sm">
                  600円
                </span>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-600 text-center mt-1">
              明確な料金分離により消費者の誤認を防止し、法令を遵守。
            </p>
          </div>
        );
      case 27: // eKYC・決済連携
        return (
          <div className={cardBase}>
            <div className={tagBase}>EKYC & STRIPE COUPLING</div>
            <div className="flex flex-col items-center gap-1.5 w-full z-10 max-w-[230px]">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl w-full justify-between text-left">
                <span className="text-[8.5px] font-bold text-orange-950">
                  💳 Stripe 決済（600円仮売上）
                </span>
                <span className="text-[7px] bg-orange-200 text-orange-900 font-bold px-1.5 py-0.5 rounded">
                  仮売上確保
                </span>
              </div>
              <div className="h-2 w-[2px] bg-dashed bg-slate-300 relative">
                <span className="absolute -left-1 -top-1 text-slate-400 text-[6px]">▼</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl w-full justify-between text-left">
                <span className="text-[8.5px] font-bold text-emerald-950">
                  🆔 eKYC 審査（TRUSTDOCK等）
                </span>
                <span className="text-[7px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  自動分岐
                </span>
              </div>
              <div className="flex justify-between w-full text-[7.5px] text-slate-600 font-mono mt-0.5 px-1">
                <span>【承認】実請求＆バッジ点灯</span>
                <span className="text-orange-700 font-bold">【否認】即全額自動返金</span>
              </div>
            </div>
          </div>
        );
      case 28: // フォレンジックログ
        return (
          <div className={cardBase}>
            <div className={tagBase}>JUDICIAL ALIGNMENT</div>
            <div className="w-full flex flex-col gap-1.5 my-auto max-w-[220px] bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm text-left">
              <div className="flex items-center gap-1 text-slate-900 border-b border-slate-200 pb-1 w-full justify-between">
                <span className="flex items-center gap-1 font-bold text-[8.5px]">
                  <FileText size={12} className="text-emerald-700" /> forensic_export.pdf
                </span>
                <span className="text-[6.5px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1 rounded border border-emerald-200">
                  SECURE
                </span>
              </div>
              <div className="space-y-0.5 text-[7px] font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>要求番号:</span> <span className="font-bold">#REQ-2026-9912</span>
                </div>
                <div className="flex justify-between">
                  <span>対象IP:</span> <span className="font-bold">184.22.95.101</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>認証合意:</span> <span>一致 (VALID SIGN)</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-1 bg-[#1A2735] text-white text-[8px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-default"
              >
                <Download size={10} /> 捜査資料1キー抽出
              </button>
            </div>
            <p className="text-[8px] text-slate-500 text-center leading-normal mt-1">
              捜査事項照会書に数分で完全対応する証拠エクスポート
            </p>
          </div>
        );
      case 29: // オプトアウト申請処理
        return (
          <div className={cardBase}>
            <div className={tagBase}>OPT-OUT AUDIT</div>
            <div className="flex items-center gap-3.5 my-auto z-10 text-emerald-800 bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200">
              <Shield size={22} className="text-emerald-600 animate-pulse" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider leading-none">
                  AUTO OPT-OUT
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  「二度と繋がらない」権利
                </span>
                <p className="text-[8px] text-slate-500 leading-tight">全データ即時遮断</p>
              </div>
            </div>
          </div>
        );
      case 30: // 総括
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 rounded-2xl h-full w-full min-h-[180px] shadow-sm select-none relative overflow-hidden transition-all duration-300">
            <div className={tagBase}>GRAND SUMMARY</div>
            <div className="flex items-center gap-3.5 my-auto z-10 bg-white/80 p-3 rounded-2xl border border-emerald-200 shadow-sm">
              <Award size={26} className="text-emerald-600 shrink-0" />
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider leading-none">
                  100% POLICE COMPLIANT
                </span>
                <span className="text-[11px] font-bold text-slate-900 mt-1">
                  治安・防衛コンプライアンス適合証明
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

export const renderSlideDiagram = (id: number) => <SlideDiagramRenderer id={id} />;
