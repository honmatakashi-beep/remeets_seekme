import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  UserCheck,
  Smartphone,
  Trash2,
  Mail,
  ArrowLeft,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { PageHeader } from '../lib/utils';

interface FaqItem {
  id: string;
  category: string;
  categoryName: string;
  question: string;
  answer: React.ReactNode;
  tags?: string[];
}

interface CategoryDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

export const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('pricing');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const isItemOpen = (id: string) => {
    // 検索語句が入力されている場合は一致した項目を自動展開
    if (searchQuery.trim().length > 0) {
      return openItems[id] !== false;
    }
    return !!openItems[id];
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !isItemOpen(id) }));
  };

  const categories: CategoryDef[] = [
    {
      id: 'pricing',
      label: '料金・お支払い',
      icon: CreditCard,
      description: '利用料金、買い切りシステム、決済方法、領収書について'
    },
    {
      id: 'quiz',
      label: '想い出クイズ・再会',
      icon: HeartHandshake,
      description: '秘密の合言葉照合、回答制限、連絡先の安全な引き渡しについて'
    },
    {
      id: 'safety',
      label: '安全性・プライバシー',
      icon: ShieldCheck,
      description: '個人情報の非公開保護、Google Gemini AI自動診断・検閲'
    },
    {
      id: 'ekyc',
      label: '本人確認・返金保証',
      icon: UserCheck,
      description: '公的本人確認（eKYC）、Stripe仮売上による即時自動返金保証'
    },
    {
      id: 'account',
      label: '登録・ログイン・通知',
      icon: Smartphone,
      description: 'LINE / Google認証、パスワード不要ログイン、メール・SMS通知'
    },
    {
      id: 'edit',
      label: '手紙の編集・削除・退会',
      icon: Trash2,
      description: '手紙の修正・完全削除、退会時のデータ抹消、海外利用について'
    },
  ];

  const faqList: FaqItem[] = [
    // 1. 料金・お支払い
    {
      id: 'q-pricing-1',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '無料で使える範囲はどこまでですか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-slate-900">
            ボトルメール（手紙）を海へ流すこと、手紙を検索して一覧を見ること、想い出クイズへ挑戦することは完全無料（0円）です。
          </p>
          <p className="text-slate-700">
            費用が発生するのは、二人だけの共通の想い出クイズに正解し、<b>「お相手の連絡先（LINE IDやメールアドレス）を開示して実際に繋がる瞬間」</b>の <b>600円（税込）買い切りのみ</b> です。
          </p>
        </div>
      ),
      tags: ['無料', '料金', '投函', '検索']
    },
    {
      id: 'q-pricing-2',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '月額料金や後からの追加請求（サブスクリプション）はありますか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-emerald-800">
            いいえ、月額料金や自動更新・後からの追加請求は一切ございません。
          </p>
          <p className="text-slate-700">
            一般的なマッチングアプリのような月額会員制（サブスク）ではなく、手紙1通の開通につき600円ポッキリの完全買い切りモデルです。使わない月に勝手に引き落とされる心配は100%ありません。
          </p>
        </div>
      ),
      tags: ['月額', 'サブスク', '追加料金', '600円']
    },
    {
      id: 'q-pricing-3',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: 'どのような支払い方法に対応していますか？',
      answer: (
        <div className="space-y-2">
          <p className="text-slate-800">
            世界標準の決済プラットフォーム <b>Stripe（ストライプ）</b> を採用しており、以下の安全なお支払い方法に対応しています。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>主要クレジットカード（VISA, Mastercard, JCB, American Express, Diners Club）</li>
            <li>Apple Pay / Google Pay（スマートフォンからのワンタップ決済）</li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            ※クレジットカード情報はStripeの最高水準セキュリティサーバー（PCI-DSS Level 1）で直接処理され、当サービスのサーバーには一切保管されません。
          </p>
        </div>
      ),
      tags: ['クレジットカード', 'Apple Pay', 'Google Pay', '決済方法']
    },
    {
      id: 'q-pricing-4',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '領収書や利用明細は発行されますか？',
      answer: (
        <p className="text-slate-700">
          はい。決済完了時に、ご登録のメールアドレス宛てに <b>「Stripe公式電子領収書（インボイス制度対応）」</b> が自動送付されます。決済IDや取引日時が明記されており、経費精算にもご利用いただけます。
        </p>
      ),
      tags: ['領収書', '明細', 'インボイス']
    },
    {
      id: 'q-pricing-5',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '差出人と受け取る側のどちらがお金を払うのですか？',
      answer: (
        <p className="text-slate-700">
          手紙を見つけてクイズに正解し、<b>「お相手の連絡先を開示したい」と希望した側（開封者）</b> が開通手数料（600円）をお支払いいただきます。手紙を最初に流した側（差出人）は、投函時も開通通知を受け取る時も費用はかかりません。
        </p>
      ),
      tags: ['差出人', '受取人', '負担']
    },

    // 2. 想い出クイズ・再会の仕組み
    {
      id: 'q-quiz-1',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: '「想い出クイズ」とは何ですか？なぜ必要なのですか？',
      answer: (
        <div className="space-y-2.5">
          <p className="text-slate-800">
            想い出クイズは、<b>「差出人と受け取る人の二人だけが知っている共通の記憶（合言葉）」</b> を照合の鍵とするReMEETs独自の特許的仕組みです。
          </p>
          <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 text-teal-950 space-y-1 text-xs sm:text-sm">
            <b>【クイズの出題例】</b>
            <p>・「高校の文化祭で一緒に作った巨大モザイク画のテーマは何だった？」</p>
            <p>・「放課後によく二人で買い食いした駄菓子屋のおばちゃんの名前は？」</p>
          </div>
          <p className="text-slate-700">
            これにより、同姓同名の別人や悪意ある第三者が手紙を勝手に開封したり、連絡先を取得したりすることを100%物理的に遮断しています。
          </p>
        </div>
      ),
      tags: ['想い出クイズ', '合言葉', '仕組み', 'なりすまし防止']
    },
    {
      id: 'q-quiz-2',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: 'クイズの答えを間違えたらどうなりますか？',
      answer: (
        <div className="space-y-2">
          <p className="text-slate-800">
            クイズの回答は何回かやり直すことができますが、辞書攻撃や総当たり（当てずっぽうの連続入力）を防ぐため、<b>短時間に複数回連続で間違えると一定時間（数分〜数時間）回答がロック</b> されます。
          </p>
          <p className="text-xs text-slate-500 pt-1">
            ※どうしても答えの漢字や表記が思い出せない場合は、差出人が設定した「ヒント」をご確認いただくか、時間を置いて正確な想い出を振り返ってご入力ください。
          </p>
        </div>
      ),
      tags: ['誤答', 'ロック', '総当たり', 'ヒント']
    },
    {
      id: 'q-quiz-3',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: 'マッチングした後はどのように連絡を取り合いますか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-slate-900">
            ReMEETsでは、アプリ内でダラダラとチャットを続けさせるのではなく、<b>「お相手のLINE IDやメールアドレスを安全に引き渡し、プラットフォームの役割を完結」</b> させるモデルを採用しています。
          </p>
          <p className="text-slate-700">
            開通完了画面に表示される「LINEを開く」や「メールを送る」ボタンから、普段使い慣れた連絡手段で直接お相手へ温かい再会のメッセージをお送りいただけます。同時に、差出人へも「あなたの手紙がお相手に届きました」と自動メール通知が届きます。
          </p>
        </div>
      ),
      tags: ['連絡方法', 'LINE', 'メール', '引き渡し']
    },
    {
      id: 'q-quiz-4',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: '探している相手がまだReMEETsを知らない・登録していない場合は？',
      answer: (
        <div className="space-y-2">
          <p className="text-slate-800">
            手紙を一度流しておけば、<b>インターネット上の海（Google検索）に宛名と想い出のヒントが安全にインデックス</b> されます。
          </p>
          <p className="text-slate-700">
            お相手がふと自分の名前や出身校を検索（エゴサーチ）した際や、同級生から「ReMEETsであなた宛の手紙が流れているよ」とシェアされた際にいつでも手紙を見つけることができます。手紙はあなたが削除しない限り、何年間でも海を漂い続けます。
          </p>
        </div>
      ),
      tags: ['未登録', 'Google検索', 'エゴサーチ', '届く仕組み']
    },

    // 3. 安全性・プライバシー・AI検閲
    {
      id: 'q-safety-1',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '自分の本名や住所が赤の他人にバレる心配はありませんか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-emerald-800">
            ありません。一般公開されるタイムライン上には、本名や詳細な住所・連絡先は一切表示されません。
          </p>
          <p className="text-slate-700">
            手紙の宛名（あだ名やイニシャル可）と、想い出の年代・ゆかりの都道府県、そしてクイズのヒントのみが漂流します。手紙の本文全文やお互いの連絡先は、<b>「想い出クイズ完全一致 ＋ 600円決済 ＋ 本人確認」</b> を完了した当事者2名にのみ暗号化復号されて表示されます。
          </p>
        </div>
      ),
      tags: ['本名', '住所', 'プライバシー', '非公開']
    },
    {
      id: 'q-safety-2',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: 'ストーカーや誹謗中傷、怨恨への安全対策はどうなっていますか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-slate-900">
            ReMEETsは <b>Google Gemini AI（人工知能）によるリアルタイム文脈検閲エンジン</b> を搭載しています。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>手紙投函時にAIが「執着・監視性」「脅迫・恨み言」「不当な出会い目的」を自動解析。</li>
            <li>危険と判定された手紙は即座に隔離（非公開化）され、一般の海へは1秒も流れません。</li>
            <li>万が一の通報時も、管理スタッフが24時間以内にアカウント凍結および法的証跡保全を行います。</li>
          </ul>
        </div>
      ),
      tags: ['ストーカー', 'AI検閲', 'Gemini', '安全対策']
    },
    {
      id: 'q-safety-3',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: 'Google検索に自分の手紙や名前が載るのですか？',
      answer: (
        <div className="space-y-2">
          <p className="text-slate-800">
            Google等の検索エンジンには、<b>「宛名（例: 佐藤健 様）」と「ゆかりの地・年代」「クイズのヒント」のみ</b> が掲載されます。
          </p>
          <p className="text-slate-700">
            手紙の本文全文、秘密の合言葉の答え、差出人の連絡先はGoogleには一切インデックスされません。お相手が検索で見つけやすくしつつ、プライバシーは鉄壁に保護されます。
          </p>
        </div>
      ),
      tags: ['Google検索', 'インデックス', 'SEO']
    },
    {
      id: 'q-safety-4',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '運転免許証やマイナンバーカードの画像を提出しても安全ですか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-teal-900">
            極めて安全です。当サービスのWebサーバーには身分証原本画像は一切保存されません（ゼロ保持設計）。
          </p>
          <p className="text-slate-700">
            本人確認（eKYC）は、メガバンクや大手金融機関が採用する国内公認のeKYC専門機関（TRUSTDOCK等）の専用セキュアサーバーへ直接送信され暗号化審査されます。当社サーバーを通過・保管しないため、画像流出のリスクを根本から排除しています。
          </p>
        </div>
      ),
      tags: ['eKYC', '身分証', '免許証', 'ゼロデータ保持']
    },

    // 4. 本人確認（eKYC）＆ 返金保証
    {
      id: 'q-ekyc-1',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: '公的本人確認（eKYC）は必ず行わなければなりませんか？',
      answer: (
        <p className="text-slate-700">
          基本利用（手紙の投函・検索・クイズ挑戦）は、無料のSNS認証（LINE / Googleログイン）のみで手軽にご利用いただけます。ただし、お相手と連絡先を開示し合う開通ステップでは、なりすましやサクラを防ぐため、携帯電話番号認証（SMS）および公的本人確認（eKYC）を推奨・実施しております。
        </p>
      ),
      tags: ['本人確認', '必須', 'SMS認証']
    },
    {
      id: 'q-ekyc-2',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: 'もし本人確認審査に通らなかった場合、600円は返金されますか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-emerald-800">
            はい、100%全額が自動的に即時返金（決済お取り消し）されます。
          </p>
          <p className="text-slate-700">
            ReMEETsの決済は、審査がすべて合格するまで売上を確定させない「Stripe仮売上（オーソリ）方式」を採用しています。身分証の不鮮明等で審査に通らなかった場合や、開通を辞退された場合は、システムが自動で即座に600円を全額キャンセル・返金いたします。
          </p>
        </div>
      ),
      tags: ['返金', '自動返金', '仮売上', '保証']
    },
    {
      id: 'q-ekyc-3',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: '返金されたお金はいつクレジットカードに反映されますか？',
      answer: (
        <p className="text-slate-700">
          システムの返金処理は即座に完了しますが、お客様のクレジットカード明細への反映タイミングは、ご利用のカード会社（楽天、三井住友、JCB等）の締め日や処理サイクルによって異なります。通常は数日〜数週間程度で請求金額から相殺または口座へ返金されます。
        </p>
      ),
      tags: ['返金時期', 'カード明細', '反映']
    },
    {
      id: 'q-ekyc-4',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: '画面上で手書き電子署名（自筆サイン）を書くのはなぜですか？',
      answer: (
        <p className="text-slate-700">
          「お相手の連絡先をいたずらや商業目的で悪用しない」「健全な想い出の再会として誠実に連絡する」という <b>利用者の安全宣誓（紳士協定）</b> をデジタル証跡として記録するためです。この署名により、双方が安心して連絡先を交換できる心理的信頼を担保しています。
        </p>
      ),
      tags: ['電子署名', '手書き', 'サイン', '信頼']
    },

    // 5. 登録・ログイン・通知設定
    {
      id: 'q-account-1',
      category: 'account',
      categoryName: '登録・ログイン・通知',
      question: '面倒なパスワード設定や管理は必要ですか？',
      answer: (
        <p className="text-slate-700">
          いいえ、パスワードは不要です。日本国内で最も信頼性の高い <b>LINE Login</b> または <b>Googleログイン</b> を使ってワンタップで安全にログインできます。パスワード忘れやパスワード漏洩のリスクは一切ありません。
        </p>
      ),
      tags: ['パスワード不要', 'LINEログイン', 'Googleログイン']
    },
    {
      id: 'q-account-2',
      category: 'account',
      categoryName: '登録・ログイン・通知',
      question: '通知メール（手紙の開封通知など）が届きません',
      answer: (
        <div className="space-y-2">
          <p className="text-slate-800">以下の点をご確認ください。</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>迷惑メールフォルダや「プロモーション」タブに振り分けられていないか確認する。</li>
            <li>ドメイン指定受信を設定されている場合は、<code>@remeets.jp</code> からのメールを受信許可する。</li>
            <li>登録時のメールアドレス（LINE/Google連携アドレス）に誤りがないかマイページで確認する。</li>
          </ul>
        </div>
      ),
      tags: ['メール不達', '通知', '迷惑メール']
    },
    {
      id: 'q-account-3',
      category: 'account',
      categoryName: '登録・ログイン・通知',
      question: '電話番号認証（SMS）の認証コードが届きません',
      answer: (
        <p className="text-slate-700">
          携帯キャリア（docomo, au, SoftBank, 楽天モバイル等）の迷惑SMS拒否設定で「海外からのSMS拒否」が有効になっていると、認証コード（Twilio/EZSMS）が届かない場合があります。設定を一時解除して再送信をお試しください（1日最大3回までリトライ可能）。
        </p>
      ),
      tags: ['SMS', '認証コード', '電話番号']
    },

    // 6. 手紙の編集・削除・退会
    {
      id: 'q-edit-1',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '一度流した手紙の内容を後から修正・削除できますか？',
      answer: (
        <div className="space-y-2">
          <p className="font-bold text-teal-900">
            はい。ログイン後、マイページ（アカウント画面）からいつでも手紙の編集や削除が可能です。
          </p>
          <p className="text-slate-700">
            誤字脱字の修正、想い出クイズのヒント追加、公開/非公開の切り替え、または手紙の完全削除をワンクリックで行っていただけます。削除された手紙は即座に海から引き揚げられ、誰からも検索できなくなります。
          </p>
        </div>
      ),
      tags: ['手紙修正', '削除', 'マイページ', '非公開']
    },
    {
      id: 'q-edit-2',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '退会したい場合の手続きと、退会後の手紙データの扱いはどうなりますか？',
      answer: (
        <div className="space-y-2">
          <p className="text-slate-800">
            マイページ内の「アカウント設定」より、いつでも即座に退会（アカウント削除）が可能です。
          </p>
          <p className="text-slate-700">
            退会申請と同時に、ご登録いただいたSNS連携データ、メールアドレス、投函された手紙データはデータベースから <b>完全に物理削除（抹消）</b> されます。
          </p>
        </div>
      ),
      tags: ['退会', 'アカウント削除', 'データ抹消']
    },
    {
      id: 'q-edit-3',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '海外に住んでいても利用できますか？',
      answer: (
        <p className="text-slate-700">
          はい、世界中どこからでもご利用いただけます。海外在住の方でもGoogleログインや国際クレジットカード（VISA/Master等）を通じて手紙の投函・検索・開通が可能です（日本国内の想い出をお持ちの方同士の再会にご利用いただいております）。
        </p>
      ),
      tags: ['海外利用', '国際決済']
    }
  ];

  // 検索フィルタリング
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqList;
    const q = searchQuery.toLowerCase();
    return faqList.filter(item => {
      return (
        item.question.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, faqList]);

  // カテゴリごとにグループ化
  const groupedFaqs = useMemo(() => {
    const map: Record<string, FaqItem[]> = {};
    categories.forEach(cat => {
      map[cat.id] = filteredFaqs.filter(item => item.category === cat.id);
    });
    return map;
  }, [categories, filteredFaqs]);

  // 全開閉判定
  const isAllOpen = useMemo(() => {
    if (filteredFaqs.length === 0) return false;
    return filteredFaqs.every(f => isItemOpen(f.id));
  }, [filteredFaqs, openItems, searchQuery]);

  // すべて開く / すべて閉じる
  const toggleAll = () => {
    if (isAllOpen) {
      setOpenItems(prev => {
        const next = { ...prev };
        filteredFaqs.forEach(f => {
          next[f.id] = false;
        });
        return next;
      });
    } else {
      setOpenItems(prev => {
        const next = { ...prev };
        filteredFaqs.forEach(f => {
          next[f.id] = true;
        });
        return next;
      });
    }
  };

  // スムーズスクロールで該当見出しへジャンプ
  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`faq-section-${categoryId}`);
    if (element) {
      const yOffset = -80; // ヘッダーオフセット
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 font-sans text-black animate-in fade-in duration-300">
      {/* 🧭 Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-sans text-black transition-opacity"
      >
        <ArrowLeft size={16} />
        <span>トップへ戻る</span>
      </Link>

      {/* 🏛️ Standard Unified Glass Card */}
      <div className="glass-card p-6 sm:p-8 md:p-12 bg-white rounded-3xl border border-brand-border shadow-sm space-y-8">
        {/* 🌟 Unified PageHeader (タイトルの横にアイコン配置) */}
        <PageHeader
          icon={<HelpCircle size={26} className="text-teal-700" />}
          iconBoxClassName="bg-teal-50 text-teal-700 border border-teal-200"
          category="Help Center & FAQ"
          title="よくあるご質問（FAQ）"
          description="料金の仕組み、想い出クイズ、プライバシー保護、本人確認（eKYC）など、皆様から多く寄せられるご質問を分かりやすくまとめました。"
        />

        {/* 🔍 Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードで全項目から検索... (例: 料金, クイズ, 返金, 免許証, 退会)"
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-brand-border rounded-2xl text-sm text-black focus:bg-white focus:border-teal-600 focus:outline-none transition-all placeholder:text-black/40 shadow-inner font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40 hover:text-black font-sans cursor-pointer"
            >
              クリア
            </button>
          )}
        </div>

        {/* 🗂️ In-Page Category Anchor Navigation (クリックで見出しへスムーズ移動) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between px-1">
            <span>カテゴリ見出しへジャンプ：</span>
            {filteredFaqs.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors cursor-pointer"
              >
                {isAllOpen ? (
                  <>
                    <ChevronUp size={13} />
                    <span>すべて閉じる</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    <span>すべて開く</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = groupedFaqs[cat.id]?.length || 0;
              const isCurrent = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => scrollToCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isCurrent
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-zinc-50 text-slate-700 hover:bg-zinc-100 hover:text-slate-900 border-brand-border'
                  }`}
                >
                  <Icon size={14} className={isCurrent ? 'text-white' : 'text-teal-700'} />
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-zinc-200/80 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 📑 FAQ Sections List (見出しごとにグループ化された1ページ構成) */}
        <div className="space-y-10 pt-2">
          {filteredFaqs.length > 0 ? (
            categories.map((cat) => {
              const items = groupedFaqs[cat.id] || [];
              if (items.length === 0) return null;
              const Icon = cat.icon;

              return (
                <section
                  key={cat.id}
                  id={`faq-section-${cat.id}`}
                  className="space-y-4 scroll-mt-24 pt-2"
                >
                  {/* 🏷️ Section Header (カテゴリ見出し) */}
                  <div className="flex items-center justify-between border-b-2 border-teal-600/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight">
                          {cat.label}
                        </h2>
                        <p className="text-xs text-slate-500 font-sans">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full font-sans shadow-2xs">
                      {items.length}問
                    </span>
                  </div>

                  {/* ❓ Questions Accordion under Section Heading */}
                  <div className="space-y-3">
                    {items.map((faq) => {
                      const isOpen = isItemOpen(faq.id);
                      return (
                        <div
                          key={faq.id}
                          className="rounded-2xl border border-teal-100/90 hover:border-teal-200 shadow-2xs overflow-hidden bg-white transition-all"
                        >
                          {/* 🟢 質問ボタン（色づけされ一目で質問とわかるデザイン・クリックで展開） */}
                          <button
                            type="button"
                            onClick={() => toggleItem(faq.id)}
                            className={`w-full p-4 text-left flex items-start justify-between gap-3.5 transition-colors cursor-pointer ${
                              isOpen
                                ? 'bg-teal-50/80 border-b border-teal-100'
                                : 'bg-teal-50/40 hover:bg-teal-50/80'
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center text-xs font-bold shrink-0 font-sans shadow-2xs mt-0.5">
                                Q
                              </span>
                              <h3 className="font-bold text-sm text-teal-950 font-sans leading-snug flex-1">
                                {faq.question}
                              </h3>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-white border border-teal-200/80 text-teal-800 transition-transform duration-200 mt-0.5 shrink-0 ${isOpen ? 'rotate-180 bg-teal-800 text-white' : ''}`}>
                              <ChevronDown size={15} />
                            </div>
                          </button>

                          {/* ⚪ 回答エリア（クリック時に展開される白背景＋統一フォントサイズ） */}
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="p-5 md:p-6 bg-white">
                                  <div className="flex items-start gap-3.5">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 font-sans shadow-2xs mt-0.5">
                                      A
                                    </span>
                                    <div className="flex-1 text-sm text-slate-800 font-sans leading-relaxed space-y-2">
                                      {faq.answer}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          ) : (
            <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-brand-border space-y-2">
              <HelpCircle size={28} className="text-black/30 mx-auto" />
              <p className="font-bold text-sm text-black font-sans">該当するご質問が見つかりませんでした</p>
              <p className="text-xs text-black/60 font-sans leading-relaxed">
                検索キーワードを変えていただくか、以下の個別お問い合わせ窓口よりお気軽にご質問ください。
              </p>
            </div>
          )}
        </div>

        {/* 💬 Support / Contact Callout Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 font-sans">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-500/20 text-teal-300 rounded-full text-[10px] font-bold border border-teal-500/30 font-sans">
              <MessageSquare size={12} />
              <span>お困りの際はお気軽にお問い合わせください</span>
            </div>
            <h3 className="text-base md:text-lg font-sans font-bold text-white">
              解決しない疑問やご不安はございますか？
            </h3>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-lg font-sans">
              ReMEETs カスタマーサポート事務局が、手紙の流し方や決済、操作方法について丁寧にご案内いたします。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Mail size={14} />
              <span>お問い合わせ窓口へ</span>
            </Link>
            <Link
              to="/pricing"
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 font-sans"
            >
              料金の詳細を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
