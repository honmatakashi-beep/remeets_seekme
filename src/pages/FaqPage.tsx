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
import { BackToHomeButton } from '../components/SharedComponents';

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
      description: '秘密の思い出の質問照合、回答制限、連絡先の安全な引き渡しについて'
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
      question: '無料で使える範囲はどこまでですか？費用が発生する項目と金額を教えてください。',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ボトルメール（手紙）を海へ流すこと、手紙を検索して一覧を見ること、想い出クイズへ挑戦すること、および会員登録・維持は<strong className="text-slate-900 font-bold">完全無料（0円）</strong>です。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            費用が発生するのは、二人だけの想い出クイズに正解し、<strong className="text-slate-900 font-bold">「手紙を開封してお相手の連絡先を開示する瞬間」</strong>のみ（完全買い切り型・都度決済）です。ご希望の確認方法に応じて以下の明瞭な料金となっております。
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            <li>
              <strong className="text-slate-900">① 通常の手紙開封（無料の年齢誓約を利用する場合）: 総額 600円（税込）</strong><br />
              想い出クイズ正解後、手紙全文を閲覧し、お相手の連絡先（LINE IDやメールアドレス）を開示して直接繋がることができます。
            </li>
            <li>
              <strong className="text-slate-900">② 公的本人確認付き手紙開封（eKYC公的身分証認証を行う場合）: 総額 1,200円（税込）</strong><br />
              手紙開封手数料（600円）＋ 運転免許証やマイナンバーカード等による公的本人確認審査手数料（600円）の合計金額となります。プロフィールに「🛡️ 公的本人確認済」バッジが付与され、お相手に最高の安心・信頼を届けて再会できます。（※eKYC審査で書類不備等により不合格となった場合は、Stripe仮売上により全額100%即時自動返金されます）
            </li>
          </ul>
        </>
      ),
      tags: ['無料', '料金', '投函', '検索', 'eKYC', '開封手数料', '600円', '1200円']
    },
    {
      id: 'q-pricing-2',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '月額料金や後からの追加請求（サブスクリプション）はありますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            いいえ、月額料金や自動更新・後からの追加請求は一切ございません。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            一般的なマッチングアプリのような月額会員制（サブスク）ではなく、手紙開封（600円）や公的本人確認eKYC（600円）といった1回ごとの都度買い切りモデルです。使わない月に勝手に引き落とされる心配は100%ありません。
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
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            世界中で数百万社が利用する最高水準のオンライン決済代行システム <strong className="text-slate-900 font-bold">Stripe（ストライプ社）</strong> を導入しており、以下の安全なお支払い方法に対応しています。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            <li>主要クレジットカード（VISA, Mastercard, JCB, American Express, Diners Club）</li>
            <li>Apple Pay / Google Pay（スマートフォンからのワンタップ決済）</li>
          </ul>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans m-0">
            ※クレジットカード情報はStripe社の最高峰セキュリティサーバー（国際基準PCI-DSS Level 1）にて安全に直接処理され、当サービスのサーバーにはカード番号などの機密情報は一切保管されません。
          </p>
        </>
      ),
      tags: ['クレジットカード', 'Apple Pay', 'Google Pay', '決済方法', 'Stripe', 'セキュリティ']
    },
    {
      id: 'q-pricing-4',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '領収書や利用明細は発行されますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            はい。決済が完了すると同時に、決済代行会社（Stripe社）よりご登録のメールアドレス宛てに <strong className="text-slate-900 font-bold">「公式電子領収書（決済完了メール）」</strong> が即座に自動送付されます。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            メール内には「お支払い日時」「金額」「決済取引ID」が明記されており、クレジットカード会社のご利用明細書と合わせて、お支払いの正式な証明書として大切に保管・ご利用いただけます。
          </p>
        </>
      ),
      tags: ['領収書', '明細', '電子レシート', 'Stripe']
    },
    {
      id: 'q-pricing-5',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: '差出人と受け取る側のどちらがお金を払うのですか？',
      answer: (
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
          手紙を見つけてクイズに正解し、<strong className="text-slate-900 font-bold">「お相手の連絡先を開示したい」と希望した側（開封者）</strong> が開通手数料（600円）をお支払いいただきます。手紙を最初に流した側（差出人）は、投函時も開通通知を受け取る時も費用はかかりません。
        </p>
      ),
      tags: ['差出人', '受取人', '負担']
    },
    {
      id: 'q-pricing-6',
      category: 'pricing',
      categoryName: '料金・お支払い',
      question: 'サービスの応援や寄付（サポーター寄付）はできますか？強制や自動引き落としはありますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            はい。想い出のボトルメールを後世まで安全に残し続けるためのサーバーインフラ維持・AI安全検閲の運用のために、<strong className="text-slate-900 font-bold">「サポーター寄付（1口 500円〜 / 任意金額）」</strong> を受け付けております。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            寄付は完全に任意（自由意志）であり、寄付を行わなくても手紙の投函・検索・開封など全ての基本機能を通常どおりご利用いただけます。月額自動引き落としではなく完全な都度決済（買い切り）であり、寄付完了時には感謝の証としてプロフィールにサポーターバッジが付与されます。
          </p>
        </>
      ),
      tags: ['寄付', 'サポーター', '応援', '500円', '任意', 'サーバー運営']
    },

    // 2. 想い出クイズ・再会の仕組み
    {
      id: 'q-quiz-1',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: '「想い出クイズ」とは何ですか？なぜ必要なのですか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            想い出クイズは、<strong className="text-slate-900 font-bold">「差出人と受け取る人の二人だけが知っている共通の記憶（思い出の質問）」</strong> を照合の鍵とするReMEETs独自の仕組みです。
          </p>
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-brand-border space-y-1.5 text-xs md:text-sm text-slate-600 leading-relaxed font-sans">
            <strong className="text-slate-900 block font-bold">【クイズの出題例】</strong>
            <p className="text-xs md:text-sm text-slate-600 font-sans m-0">・「高校の文化祭で一緒に作った巨大モザイク画のテーマは何だった？」</p>
            <p className="text-xs md:text-sm text-slate-600 font-sans m-0">・「放課後によく二人で買い食いした駄菓子屋のおばちゃんの名前は？」</p>
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            これにより、同姓同名の別人や悪意ある第三者が手紙を勝手に開封したり、連絡先を取得したりすることを完全に遮断しています。
          </p>
        </>
      ),
      tags: ['想い出クイズ', '思い出の質問', '仕組み', 'なりすまし防止']
    },
    {
      id: 'q-quiz-2',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: 'クイズの答えを間違えたらどうなりますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            クイズの回答は何回かやり直すことができますが、辞書攻撃や総当たり（当てずっぽうの連続入力）を防ぐため、<strong className="text-slate-900 font-bold">短時間に複数回連続で間違えると一定時間（数分〜数時間）回答がロック</strong> されます。
          </p>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans m-0">
            ※どうしても答えの漢字や表記が思い出せない場合は、時間を置いて正確な想い出を振り返ってご入力いただくか、ひらがな・カタカナ等での入力をお試しください（表記揺れは自動救済されます）。
          </p>
        </>
      ),
      tags: ['誤答', 'ロック', '総当たり', '照合']
    },
    {
      id: 'q-quiz-3',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: 'マッチングした後はどのように連絡を取り合いますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ReMEETsでは、アプリ内でメッセージを永続させるのではなく、<strong className="text-slate-900 font-bold">「お相手のLINE IDやメールアドレスを安全に引き渡し、プラットフォームの役割を完結」</strong> させるモデルを採用しています。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            開示完了画面に表示される「LINEを開く」や「メールを送る」ボタンから、普段使い慣れた連絡手段で直接お相手へ温かい再会のメッセージをお送りいただけます。同時に、差出人へも「あなたの手紙がお相手に届きました」と自動メール通知が届きます。
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
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            手紙を一度流しておけば、<strong className="text-slate-900 font-bold">インターネット上の海（Google検索）に宛名と想い出のキーワードが安全にインデックス</strong> されます。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            お相手がふと自分の名前や出身校を検索（エゴサーチ）した際や、知人から「ReMEETsであなた宛の手紙が流れているよ」とシェアされた際にいつでも手紙を見つけることができます。手紙はあなたが削除しない限り、何年間でも海を漂い続けます。
          </p>
        </>
      ),
      tags: ['未登録', 'Google検索', 'エゴサーチ', '届く仕組み']
    },
    {
      id: 'q-quiz-5',
      category: 'quiz',
      categoryName: '想い出クイズ・再会',
      question: '一度開封した手紙や相手の連絡先は、後からもう一度確認できますか？追加料金はかかりますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            はい、<strong className="text-slate-900 font-bold">追加料金は一切かからず何度でもご確認いただけます。</strong>
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            一度想い出クイズに正解して開封を完了した手紙は、マイページの「開封済みボトルメール（再会達成一覧）」に大切に永久保存されます。いつでも相手のLINE ID、メールアドレス、手紙の全文を再確認できますのでご安心ください。
          </p>
        </>
      ),
      tags: ['開封履歴', '連絡先再確認', 'マイページ', '追加料金なし', '永久保存']
    },

    // 3. 安全性・プライバシー・AI検閲
    {
      id: 'q-safety-1',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '自分の本名や住所などの個人情報が第三者に知られてしまう心配はありませんか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ご安心ください。一般公開されるタイムラインや検索一覧には、本名や詳細な住所・連絡先などの個人情報は一切表示されません。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            手紙の宛名（あだ名やイニシャル可）と、想い出の年代・ゆかりの都道府県、そして思い出クイズの設問文のみが表示されます。手紙の本文全文やお互いの連絡先は、<strong className="text-slate-900 font-bold">「思い出クイズ完全一致 ＋ 手紙開封・公的本人確認」</strong> を完了した当事者2名にのみ暗号化復号されて表示されます。
          </p>
        </>
      ),
      tags: ['本名', '匿名性', '住所', 'プライバシー保護']
    },
    {
      id: 'q-safety-2',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '手紙の本文に自分のLINE IDや電話番号を直接書いて流してもいいですか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            いいえ、手紙本文への直接の連絡先（LINE ID、電話番号、メールアドレス、SNSアカウント、詳細な住所等）の記載は安全規約により<strong className="text-slate-900 font-bold">固く禁止</strong>されています。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            第三者による悪用や個人情報漏洩を防ぐため、AIおよびシステムが自動検知して投稿を遮断または非公開化します。連絡先は必ず専用の「秘密の連絡先」設定欄に入力してください（想い出クイズ正解者のみに暗号化復号して安全に引き渡されます）。
          </p>
        </>
      ),
      tags: ['連絡先直書き禁止', '個人情報保護', 'LINE ID', '秘密の連絡先', '安全規約']
    },
    {
      id: 'q-safety-3',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: 'AIによる自動診断・検閲（安全防衛システム）とは何ですか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ReMEETsでは、Googleの最新鋭AI <strong className="text-slate-900 font-bold">Gemini API</strong> をバックエンドに常時接続し、すべての投稿テキストを24時間365日自律監視しています。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ストーカー目的の監視メッセージ、金銭トラブルの要求、誹謗中傷、不当な個人情報の晒し行為、性的な出会い目的のワードが含まれている場合、AIが投稿の瞬間に自動検知し、タイムラインへの流出を未然に遮断（隔離・非公開化）します。
          </p>
        </>
      ),
      tags: ['AI検閲', 'Gemini', 'ストーカー対策', '誹謗中傷防止']
    },
    {
      id: 'q-safety-4',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '嫌がらせやストーカー行為、心当たりのない不審な手紙が届いた場合の対策はどうなっていますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ReMEETsでは、悪意ある利用を徹底的に排除するため<strong className="text-slate-900 font-bold">強固な多重防衛体制</strong>を敷いています。
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            <li><strong className="text-slate-900">AIによる自動検閲・隔離:</strong> 脅迫・ストーカー・嫌がらせ文面をAIが24時間リアルタイム検知し自動隔離します。</li>
            <li><strong className="text-slate-900">通報・ブロック機能:</strong> 不審な手紙を見かけた場合、ワンタップで運営事務局へ通報・非表示ブロックが可能です。</li>
            <li><strong className="text-slate-900">警察・捜査機関との連携:</strong> 刑事事件や公安・サイバー捜査機関からの正式な照会要請に対し、OAuth認証UID・IPアドレス・決済記録等のログ開示協力体制を完備しています。</li>
          </ul>
        </>
      ),
      tags: ['ストーカー対策', '迷惑行為', '警察連携', '通報機能', 'ブロック', 'ログ開示']
    },
    {
      id: 'q-safety-5',
      category: 'safety',
      categoryName: '安全性・プライバシー',
      question: '出会い系サイトやマッチングアプリとは何が違うのですか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ReMEETsは不特定多数の異性との出会いを目的としたサービスではなく、<strong className="text-slate-900 font-bold">「過去に実在した同級生・恩師・旧友・かつての仲間」との再会に特化したWebプラットフォーム</strong> です。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
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
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            安心・安全な再会を実現し、なりすましや犯罪行為を根絶するため、<strong className="text-slate-900 font-bold">お相手の連絡先を開示する最終ステップでのみ</strong> 公的身分証明書（運転免許証、マイナンバーカード等）による本人確認を実施しています。
          </p>
          <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans m-0">
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
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
          <strong className="text-slate-900 font-bold">全額自動で即時返金（決済取消）されます。</strong><br />
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
        <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
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
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            ReMEETsでは、面倒なパスワード管理やパスワード流出被害を根本から防ぐため、<strong className="text-slate-900 font-bold">LINEログインおよびGoogleアカウント連携</strong> を採用しています。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
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
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
          あなた宛ての手紙が見つかった際や、あなたが流した手紙にお相手から開封アクションがあった際は、アカウントにご登録いただいた <strong className="text-slate-900 font-bold">メールアドレス宛てに「再会開通お知らせメール」</strong> がリアルタイムで届きます。
        </p>
      ),
      tags: ['通知', 'メール', '開通通知']
    },
    {
      id: 'q-account-3',
      category: 'account',
      categoryName: '登録・ログイン・通知',
      question: '探している相手の手紙がまだ見つからない場合、後から流れてきたときに通知を受け取ることはできますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            はい、<strong className="text-slate-900 font-bold">「新着入荷通知アラート」</strong> 機能をご利用いただけます。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            探したい相手の「お名前（あだ名・旧姓）」や「ゆかりの都道府県・年代」をキーワード登録（メール通知設定）しておくと、条件に合致する新しいボトルメールが海に流れた瞬間に、ご登録のメールアドレス宛てへ自動でお知らせ通知が届きます。何度も検索し直す手間なく、奇跡の再会の機会を逃しません。
          </p>
        </>
      ),
      tags: ['新着通知', '入荷アラート', 'キーワード登録', '自動メール通知', 'エゴサーチ']
    },

    // 6. 手紙の編集・削除・退会
    {
      id: 'q-edit-1',
      category: 'edit',
      categoryName: '手紙の編集・削除・退会',
      question: '流した手紙の内容を修正したり、後から消すことはできますか？',
      answer: (
        <>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
            はい、いつでも可能です。ログイン後、マイページの「流したボトルメール一覧」から、該当の手紙の <strong className="text-slate-900 font-bold">「編集」または「海から引き上げる（完全削除）」</strong> をワンタップで実行できます。
          </p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
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
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
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
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-sans m-0">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12 text-black font-sans">
      <BackToHomeButton />

      {/* 🏛️ Standard Unified Glass Card */}
      <div className="glass-card p-6 sm:p-8 md:p-12 bg-white rounded-3xl border border-brand-border shadow-sm space-y-8">
        {/* 🌟 Unified PageHeader */}
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
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-brand-border rounded-2xl text-xs md:text-sm text-black focus:bg-white focus:border-teal-600 focus:outline-none transition-all placeholder:text-black/40 shadow-inner font-sans"
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
        <div className="flex flex-wrap items-center gap-2">
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
                  <div className="flex items-center justify-between pb-3 border-b-2 border-teal-700/70 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900 font-serif tracking-tight">
                          {cat.label}
                        </h2>
                        <p className="text-[11px] md:text-xs text-slate-500 font-sans hidden sm:block mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full font-sans shadow-2xs">
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
                              <span className="text-xs md:text-sm font-bold text-teal-700 font-mono shrink-0">
                                Q.
                              </span>
                              <h3 className="font-bold text-xs md:text-sm text-slate-900 font-sans leading-relaxed flex-1">
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
                                    <span className="text-xs md:text-sm font-bold text-emerald-700 font-mono shrink-0 leading-relaxed">
                                      A.
                                    </span>
                                    <div className="flex-1 text-slate-600 font-sans leading-relaxed space-y-2 text-xs md:text-sm">
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

        {/* 💬 Support / Contact Callout Banner (案C: 落ち着いたスレート・ライトグレー) */}
        <div className="p-6 bg-zinc-50 rounded-2xl border border-brand-border shadow-2xs flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 text-teal-800 rounded-full text-[10px] font-bold border border-teal-200/80 font-sans">
              <MessageSquare size={12} className="text-teal-700" />
              <span>お困りの際はお気軽にお問い合わせください</span>
            </div>
            <h3 className="text-base font-serif font-bold text-slate-900">
              解決しない疑問やご不安はございますか？
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-lg font-sans">
              ReMEETs カスタマーサポート事務局が、手紙の流し方や決済、操作方法について丁寧にご案内いたします。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Mail size={14} />
              <span>お問い合わせ窓口へ</span>
            </Link>
            <Link
              to="/pricing"
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-slate-800 font-bold text-xs transition-all border border-slate-300 shadow-2xs font-sans"
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
