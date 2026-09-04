import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  UserCheck,
  Smartphone,
  Trash2,
  Mail,
  MessageSquare,
  ArrowLeft
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
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ボトルメール（手紙）を海へ流すこと、手紙を検索して一覧を見ること、想い出クイズへ挑戦することは完全無料（0円）です。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            費用が発生するのは、二人だけの共通の想い出クイズに正解し、「お相手の連絡先（LINE IDやメールアドレス）を開示して実際に繋がる瞬間」の <span className="font-bold text-black">600円（税込）買い切りのみ</span> です。
          </p>
        </>
      ),
      tags: ['無料', '料金', '投函', '検索']
    },
    {
      id: 'q-pricing-2',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '月額料金や後からの追加請求（サブスクリプション）はありますか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            いいえ、月額料金や自動更新・後からの追加請求は一切ございません。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            一般的なマッチングアプリのような月額会員制（サブスク）ではなく、手紙1通の開通につき600円ポッキリの完全買い切りモデルです。使わない月に勝手に引き落とされる心配は100%ありません。
          </p>
        </>
      ),
      tags: ['月額', 'サブスク', '追加料金', '600円']
    },
    {
      id: 'q-pricing-3',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: 'どのような支払い方法に対応していますか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            世界標準の決済プラットフォーム <span className="font-bold text-black">Stripe（ストライプ）</span> を採用しており、以下の安全なお支払い方法に対応しています。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13px] leading-relaxed text-black/80 font-sans m-0">
            <li>主要クレジットカード（VISA, Mastercard, JCB, American Express, Diners Club）</li>
            <li>Apple Pay / Google Pay（スマートフォンからのワンタップ決済）</li>
          </ul>
          <p className="text-[13px] leading-relaxed text-black/50 font-sans m-0">
            ※クレジットカード情報はStripeの最高水準セキュリティサーバー（PCI-DSS Level 1）で直接処理され、当サービスのサーバーには一切保管されません。
          </p>
        </>
      ),
      tags: ['クレジットカード', 'Apple Pay', 'Google Pay', '決済方法']
    },
    {
      id: 'q-pricing-4',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '領収書や利用明細は発行されますか？',
      answer: (
        <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
          はい。決済完了時に、ご登録のメールアドレス宛てに <span className="font-bold text-black">「Stripe公式電子領収書（インボイス制度対応）」</span> が自動送付されます。決済IDや取引日時が明記されており、経費精算にもご利用いただけます。
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
        <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
          手紙を見つけてクイズに正解し、<span className="font-bold text-black">「お相手の連絡先を開示したい」と希望した側（開封者）</span> が開通手数料（600円）をお支払いいただきます。手紙を最初に流した側（差出人）は、投函時も開通通知を受け取る時も費用はかかりません。
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
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            想い出クイズは、<span className="font-bold text-black">「差出人と受け取る人の二人だけが知っている共通の記憶（合言葉）」</span> を照合の鍵とするReMEETs独自の仕組みです。
          </p>
          <div className="p-3 bg-zinc-50 rounded-xl border border-brand-border space-y-1 text-[13px] leading-relaxed text-black/80 font-sans">
            <span className="font-bold text-black block">【クイズの出題例】</span>
            <p className="text-[13px] text-black/80 font-sans m-0">・「高校の文化祭で一緒に作った巨大モザイク画のテーマは何だった？」</p>
            <p className="text-[13px] text-black/80 font-sans m-0">・「放課後によく二人で買い食いした駄菓子屋のおばちゃんの名前は？」</p>
          </div>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            これにより、同姓同名の別人や悪意ある第三者が手紙を勝手に開封したり、連絡先を取得したりすることを完全に遮断しています。
          </p>
        </>
      ),
      tags: ['想い出クイズ', '合言葉', '仕組み', 'なりすまし防止']
    },
    {
      id: 'q-quiz-2',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: 'クイズの答えを間違えたらどうなりますか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            クイズの回答は何回かやり直すことができますが、辞書攻撃や総当たり（当てずっぽうの連続入力）を防ぐため、<span className="font-bold text-black">短時間に複数回連続で間違えると一定時間（数分〜数時間）回答がロック</span> されます。
          </p>
          <p className="text-[13px] leading-relaxed text-black/50 font-sans m-0">
            ※どうしても答えの漢字や表記が思い出せない場合は、差出人が設定した「ヒント」をご確認いただくか、時間を置いて正確な想い出を振り返ってご入力ください。
          </p>
        </>
      ),
      tags: ['誤答', 'ロック', '総当たり', 'ヒント']
    },
    {
      id: 'q-quiz-3',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: 'マッチングした後はどのように連絡を取り合いますか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ReMEETsでは、アプリ内でメッセージを永続させるのではなく、<span className="font-bold text-black">「お相手のLINE IDやメールアドレスを安全に引き渡し、プラットフォームの役割を完結」</span> させるモデルを採用しています。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            開通完了画面に表示される「LINEを開く」や「メールを送る」ボタンから、普段使い慣れた連絡手段で直接お相手へ温かい再会のメッセージをお送りいただけます。同時に、差出人へも「あなたの手紙がお相手に届きました」と自動メール通知が届きます。
          </p>
        </>
      ),
      tags: ['連絡方法', 'LINE', 'メール', '引き渡し']
    },
    {
      id: 'q-quiz-4',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: '探している相手がまだReMEETsを知らない・登録していない場合は？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            手紙を一度流しておけば、<span className="font-bold text-black">インターネット上の海（Google検索）に宛名と想い出のヒントが安全にインデックス</span> されます。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            お相手がふと自分の名前や出身校を検索（エゴサーチ）した際や、知人から「ReMEETsであなた宛の手紙が流れているよ」とシェアされた際にいつでも手紙を見つけることができます。手紙はあなたが削除しない限り、何年間でも海を漂い続けます。
          </p>
        </>
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
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ありません。一般公開されるタイムライン上には、本名や詳細な住所・連絡先は一切表示されません。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            手紙の宛名（あだ名やイニシャル可）と、想い出の年代・ゆかりの都道府県、そしてクイズのヒントのみが漂流します。手紙の本文全文やお互いの連絡先は、<span className="font-bold text-black">「想い出クイズ完全一致 ＋ 600円決済 ＋ 本人確認」</span> を完了した当事者2名にのみ暗号化復号されて表示されます。
          </p>
        </>
      ),
      tags: ['本名', '匿名性', '住所', 'プライバシー保護']
    },
    {
      id: 'q-safety-2',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: 'AIによる自動診断・検閲（安全防衛システム）とは何ですか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ReMEETsでは、Googleの最新鋭AI <span className="font-bold text-black">Gemini API</span> をバックエンドに常時接続し、すべての投稿テキストを24時間365日自律監視しています。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ストーカー目的の監視メッセージ、金銭トラブルの要求、誹謗中傷、不当な個人情報の晒し行為、性的な出会い目的のワードが含まれている場合、AIが投稿の瞬間に自動検知し、タイムラインへの流出を未然に遮断（隔離・非公開化）します。
          </p>
        </>
      ),
      tags: ['AI検閲', 'Gemini', 'ストーカー対策', '誹謗中傷防止']
    },
    {
      id: 'q-safety-3',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '出会い系サイトやマッチングアプリとは何が違うのですか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ReMEETsは不特定多数の異性との出会いを目的としたサービスではなく、<span className="font-bold text-black">「過去に実在した同級生・恩師・旧友・かつての仲間」との再会に特化したWebプラットフォーム</span> です。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            「二人だけの共通の想い出クイズ」に正解しない限り絶対に連絡先が開示されない厳格なセキュリティ設計となっており、無差別なナンパや営業目的の利用は一切不可能です。
          </p>
        </>
      ),
      tags: ['出会い系との違い', '健全性', '同級生探し']
    },

    // 4. 本人確認（eKYC）・返金保証
    {
      id: 'q-ekyc-1',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: 'なぜ公的身分証による本人確認（eKYC）が必要なのですか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            安心・安全な再会を実現し、なりすましや犯罪行為を根絶するため、<span className="font-bold text-black">お相手の連絡先を開示する最終ステップでのみ</span> 公的身分証明書（運転免許証、マイナンバーカード等）による本人確認を実施しています。
          </p>
          <p className="text-[13px] leading-relaxed text-black/50 font-sans m-0">
            ※身分証画像データは日本の法基準に準拠した認証インフラで安全に照合され、確認完了後は即座に安全破棄されます。当サービスのサーバー内に画像が恒久保管されることはありません。
          </p>
        </>
      ),
      tags: ['eKYC', '身分証明書', '本人確認', '安全性']
    },
    {
      id: 'q-ekyc-2',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: '本人確認（eKYC）で不合格になった場合、600円はどうなりますか？',
      answer: (
        <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
          <span className="font-bold text-black">全額自動で即時返金（決済取消）されます。</span><br />
          ReMEETsの決済は、本人確認が完了するまで「仮売上（オーソリ）」として保持されます。身分証の不鮮明や審査不合格となった場合は、システムが即座にStripe経由で請求を完全キャンセル（0円返金）するため、無駄な費用が発生することは一切ありません。
        </p>
      ),
      tags: ['返金保証', '即時返金', '仮売上', 'Stripe']
    },
    {
      id: 'q-ekyc-3',
      category: 'ekyc',
      categoryName: '本人確認・返金保証',
      question: '本人確認にはどんな書類が使えますか？',
      answer: (
        <ul className="list-disc pl-5 space-y-1 text-[13px] leading-relaxed text-black/80 font-sans m-0">
          <li>運転免許証 / 運転経歴証明書</li>
          <li>マイナンバーカード（個人番号カード表面）</li>
          <li>在留カード / 特別永住者証明書</li>
          <li>日本国パスポート（所持人記入欄があるもの）</li>
        </ul>
      ),
      tags: ['本人確認書類', '運転免許証', 'マイナンバーカード']
    },

    // 5. 登録・ログイン・通知
    {
      id: 'q-account-1',
      category: 'account',
      categoryName: '登録・ログイン・通知',
      question: 'パスワードを設定した覚えがありません。どうやってログインしますか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ReMEETsでは、面倒なパスワード管理やパスワード流出被害を根本から防ぐため、<span className="font-bold text-black">LINEログインおよびGoogleアカウント連携</span> を採用しています。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            ログイン画面で「LINEでログイン」または「Googleでログイン」をタップするだけで、ワンタップで安全にご利用いただけます。
          </p>
        </>
      ),
      tags: ['ログイン', 'LINE', 'Google', 'パスワード不要']
    },
    {
      id: 'q-account-2',
      category: 'account',
      categoryName: '登録・ログイン・通知',
      question: '手紙にお相手から返信や開封があったら、どのように通知されますか？',
      answer: (
        <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
          あなた宛ての手紙が見つかった際や、あなたが流した手紙にお相手から開封アクションがあった際は、アカウントにご登録いただいた <span className="font-bold text-black">メールアドレス宛てに「再会開通お知らせメール」</span> がリアルタイムで届きます。
        </p>
      ),
      tags: ['通知', 'メール', '開通通知']
    },

    // 6. 手紙の編集・削除・退会
    {
      id: 'q-edit-1',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '流した手紙の内容を修正したり、後から消すことはできますか？',
      answer: (
        <>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            はい、いつでも可能です。ログイン後、マイページの「流したボトルメール一覧」から、該当の手紙の <span className="font-bold text-black">「編集」または「海から引き上げる（完全削除）」</span> をワンタップで実行できます。
          </p>
          <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
            削除を実行した手紙はデータベースから物理的に完全抹消され、海（検索一覧・タイムライン）からも即座に消去されます。
          </p>
        </>
      ),
      tags: ['手紙の編集', '削除', '手紙の消去']
    },
    {
      id: 'q-edit-2',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '退会したい場合はどのように手続きすればいいですか？',
      answer: (
        <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
          マイページの「アカウント設定」内にある「退会・データ完全消去」よりいつでもご自身で即時退会いただけます。退会と同時に、流した手紙・プロフィール・認証履歴などの全データが安全に物理消去されます。
        </p>
      ),
      tags: ['退会', 'アカウント削除', 'データ抹消']
    },
    {
      id: 'q-edit-3',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '海外在住ですが、利用することはできますか？',
      answer: (
        <p className="text-[13px] leading-relaxed text-black/80 font-sans m-0">
          はい、世界中どこからでもインターネット接続があればWebブラウザからご利用いただけます。Stripe決済は海外発行の主要クレジットカードにも対応しています。
        </p>
      ),
      tags: ['海外利用', '国際対応', 'クレジットカード']
    },
  ];

  // 検索フィルタリング
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return faqList;
    return faqList.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery, faqList]);

  // カテゴリごとにグループ化
  const groupedFaqs = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    categories.forEach((cat) => map.set(cat.id, []));
    filteredFaqs.forEach((item) => {
      const arr = map.get(item.category) || [];
      arr.push(item);
      map.set(item.category, arr);
    });
    return map;
  }, [filteredFaqs, categories]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isItemOpen = (id: string) => !!openItems[id];

  const handleExpandAll = () => {
    const nextState: Record<string, boolean> = {};
    filteredFaqs.forEach((item) => {
      nextState[item.id] = true;
    });
    setOpenItems(nextState);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* 🧭 Back Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black transition-opacity"
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
            placeholder="キーワードで検索... (例: 料金, クイズ, 返金, 免許証, 退会)"
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-brand-border rounded-2xl text-[13px] text-black focus:bg-white focus:border-teal-600 focus:outline-none transition-all placeholder:text-black/40 shadow-inner font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40 hover:text-black font-sans"
            >
              クリア
            </button>
          )}
        </div>

        {/* 🗂️ Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border font-sans ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-zinc-50 text-black/70 hover:bg-zinc-100 hover:text-black border-brand-border'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : 'text-teal-700'} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 📑 FAQ Accordion List by Categories */}
        <div className="space-y-8 pt-2">
          {categories.some((cat) => (groupedFaqs.get(cat.id) || []).length > 0) ? (
            categories.map((cat) => {
              const items = groupedFaqs.get(cat.id) || [];
              if (items.length === 0) return null;
              const Icon = cat.icon;

              return (
                <section
                  key={cat.id}
                  id={`category-${cat.id}`}
                  className="space-y-3.5 scroll-mt-24"
                >
                  {/* 📌 Category Section Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0">
                        <Icon size={15} />
                      </div>
                      <h2 className="text-sm font-bold text-black font-serif">
                        {cat.label}
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-sans">
                      {items.length}問
                    </span>
                  </div>

                  {/* ❓ Question & Answer Accordions */}
                  <div className="space-y-2.5">
                    {items.map((faq) => {
                      const isOpen = isItemOpen(faq.id);
                      return (
                        <div
                          key={faq.id}
                          className="bg-zinc-50/50 rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => toggleItem(faq.id)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-zinc-100/60 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="text-[13px] font-bold text-teal-700 font-mono shrink-0">
                                Q.
                              </span>
                              <h3 className="font-bold text-[13px] text-black font-sans leading-relaxed flex-1">
                                {faq.question}
                              </h3>
                            </div>
                            <div className={`p-1 rounded-full text-black/40 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-teal-700' : ''}`}>
                              <ChevronDown size={16} />
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                              >
                                <div className="px-4 pb-4 pt-1 border-t border-zinc-200/60 bg-white">
                                  <div className="flex items-start gap-2.5 pt-3">
                                    <span className="text-[13px] font-bold text-emerald-700 font-mono shrink-0 leading-relaxed">
                                      A.
                                    </span>
                                    <div className="flex-1 text-black/80 font-sans leading-relaxed space-y-2 text-[13px]">
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
              <p className="font-bold text-xs text-black font-sans">該当するご質問が見つかりませんでした</p>
              <p className="text-[11px] text-black/60 font-sans">
                検索キーワードを変えていただくか、以下の個別お問い合わせ窓口よりお気軽にご質問ください。
              </p>
            </div>
          )}
        </div>

        {/* 💬 Support / Contact Callout Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-500/20 text-teal-300 rounded-full text-[10px] font-bold border border-teal-500/30 font-sans">
              <MessageSquare size={12} />
              <span>お困りの際はお気軽にお問い合わせください</span>
            </div>
            <h3 className="text-base font-serif font-bold text-white">
              解決しない疑問やご不安はございますか？
            </h3>
            <p className="text-[11px] text-white/70 leading-relaxed max-w-lg font-sans">
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
