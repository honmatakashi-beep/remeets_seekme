import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ArrowRight, BookOpen, Building2, CheckCircle2,
  Coffee, Coins, CreditCard, FileText, HelpCircle, MessageSquare,
  RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Trash2,
  Lock, Check, Heart, User, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SupportModal } from '../components/SupportModal';
import { motion } from 'framer-motion';
import safetyGuardianCool from '../assets/images/safety_guardian_cool_1785864341331.jpg';
import { PageHeader } from '../lib/utils';

export const TermsContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第1条（目的及び本規約の適用範囲）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        本利用規約（以下「本規約」）は、ReMEETs運営事務局（以下「当事務局」）が提供する、かつての知人等との再会を支援するWebインフラ「ReMEETs」（以下「本サービス」）の利用条件を定めるものです。
        本サービスにアクセス、または会員登録されたすべてのユーザーは、本規約の全条項に同意したものとみなされます。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第2条（アカウント管理および本人認証）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 利用者は、自己の責任において本サービスのアカウントを管理するものとします。<br />
        2. 本サービスでは、安全性の向上、重複アタックの防止、および成りすまし行為を排除するため、外部SNS（LINE、Google等）を用いたOAuth認証ならびにメール認証等を導入しています。<br />
        3. 安全な取引および公序良俗・法令順守の観点から、手紙の開封・メッセージやり取り・連絡先開示等の特定機能の利用にあたり、公的身分証明書を用いた本人確認（eKYC）およびSMS電話番号認証の完了を求める場合があります。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第3条（サービス利用料金・決済・返金）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本サービスへの会員登録、手紙（ボトルメール）の投函、および自分宛ての手紙の検索・一覧閲覧はすべて無料（0円）です。<br />
        2. お相手からの手紙の開封、思い出クイズの解答による想い出照合および連絡先開示（引き渡し）システムを利用する際、一回あたり 600円〜1,200円（税込 / eKYC公的認証費用を含む一括買い切り型）のシステム利用料が発生します。<br />
        3. 本サービスには月額会費や自動更新されるサブスクリプション費用は一切発生いたしません。<br />
        4. デジタルコンテンツおよびシステム即時開通の性質上、決済完了後の各種手数料（600円〜1,200円等）および開発応援寄付金等の返金・換金には原則として応じられません（本人確認eKYC審査で不合格となった場合は自動的に仮売上全額取消・返金が行われます）。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第4条（AI安全自動診断・モデレーションおよびコンテンツ監視）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 当事務局は、本サービスの健全性維持、ストーカー行為の未然抑止、プライバシー保護、誹謗中傷排除のため、投稿・更新された手紙（ボトルメール）およびメッセージに対して、最新のAI（人工知能）モデレーションエンジンおよびシステムによる自動診断・検閲を常時実施します。<br />
        2. AIまたはシステムにより禁止事項（過度な個人情報の直接掲載、脅迫・付きまといの兆候、公序良俗・法令違反等）に該当すると判定された投稿は、事前通知なく自動的に即時非公開（安全隔離）または削除される場合があります。<br />
        3. ユーザーは、本サービスを利用してテキストを送信・更新することにより、安全確保およびモデレーションを目的とした当該AI自動診断処理の実行に明示的に同意したものとみなされます。<br />
        4. AI判定の誤検知・不検知、またはこれに伴う一時的な非公開措置によりユーザーに生じた機会損失や不利益について、当事務局は故意または重過失がある場合を除き一切の責任を負いません。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第5条（禁止事項）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ユーザーは、本サービスの利用にあたり、不特定多数に対する無差別な出会い目的の利用、他者への誹謗中傷、ストーカー行為、偽装情報の登録、ならびに商業目的のスパム投稿を行ってはなりません。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第6条（奇跡の再会報告・体験談の投稿および利用許諾）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. ユーザーは、本サービスを通じて大切な方と再会できた際、任意で「奇跡の再会報告（体験談）」投稿フォームより感謝・再会メッセージを当事務局へ送信することができます。<br />
        2. ユーザーが投稿したメッセージ・年代・性別情報は、当事務局による目視およびAIによる事前審査（個人情報の除外・完全匿名化処理）を経た上で、本サービス公式Webサイト（トップページ、体験談ページ等）に無償・非独占的に掲載・紹介されることに同意するものとします。<br />
        3. ユーザーは、虚偽の事実、他者の名誉・プライバシーを侵害する内容、または第三者の権利を害するメッセージを投稿してはなりません。<br />
        4. 掲載された体験談の削除または非公開化を希望する場合、ユーザーはお問い合わせフォーム等よりいつでも当事務局へ申し出ることができ、当事務局は速やかに対応するものとします。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第7条（リアルタイム速報通知およびメール配信）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本サービスでは、ユーザーが投函した手紙に対してお相手が思い出クイズに正解した場合、または手紙・連絡先が開示された場合等に、WebSocket接続によるリアルタイム画面速報通知および登録メールアドレス宛への自動通知メール配信を行います。<br />
        2. 通信障害、端末設定、またはメール受信拒否等に起因する通知の遅延や不達について、当事務局は故意または重過失がある場合を除き責任を負いません。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第8条（退会およびデータの取り扱い）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ユーザーは、マイページよりいつでも退会手続きを行うことができます。退会時、アカウント情報および関連データは速やかに削除または適切に匿名化処理されます。ただし、法令に基づく保管義務がある情報やセキュリティ監査ログについては一定期間安全に保存される場合があります。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第9条（本サービスの変更・中断・終了および免責）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 当事務局は、運用上、技術上、経営上の都合その他やむを得ない事由により、本サービス上での事前告知等をもって、本サービスの提供を一時中断、休止、または終了（サービス閉鎖）することができるものとします。<br />
        2. 運営不能やサービス閉鎖を含む本サービスの終了が生じた場合であっても、過去にユーザーが支払った各種利用手数料（手紙開封・開通手数料 600円〜1,200円、eKYC審査実費等）およびサポーター寄付金・開発支援金について、理由の如何を問わず返金、返還、損害賠償等の請求には一切応じられません。<br />
        3. 当事務局は、本サービスを介して実現した再会ややり取りにおける当事者間のトラブル、ならびに本サービスの中断・閉鎖によりユーザーに生じた損害や機会損失について、故意または重過失がある場合を除き一切の責任を負いません。
      </p>
    </section>
    <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
      <div>制定日・施行日：2026年8月15日（本番サービス運用開始日）</div>
      <div>最終改定日：2026年8月20日（AI安全自動診断・モデレーション条項の追加明記）</div>
    </div>
  </div>
);

export const PrivacyContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">1. 取得する情報</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        当事務局は、本サービスの提供にあたり、以下の情報を取得・保持する場合があります。<br />
        ・アカウント登録情報（ニックネーム、メールアドレス、パスワードハッシュ等）<br />
        ・OAuth認証情報（外部SNSプロバイダより取得する基本識別子）<br />
        ・本人確認（eKYC）時に取得する身分証明書の認証結果ステータスおよび確認日時<br />
        ・SMS認証時に使用する電話番号ハッシュ値、決済関連情報（Stripe等により安全に処理）<br />
        ・投稿テキスト（手紙・メッセージ）およびそのAI安全自動診断結果（モデレーションフラグ・安全判定理由）<br />
        ・奇跡の再会報告（体験談）投稿時に任意で提供いただくメッセージ、出会った年代、性別、および掲載同意情報<br />
        ・アクセスログ、IPアドレス、ご利用端末情報、リアルタイム通知（WebSocket）接続識別子
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">2. 利用目的</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        取得した情報は、以下の目的のためにのみ利用します。<br />
        ・本人確認および不正利用（成りすまし・スパム・ストーカー行為）の防止<br />
        ・AI（人工知能）安全モデルを用いた投稿内容のリアルタイム診断による、ストーカー行為・個人情報露出・嫌がらせ・法令違反の未然抑止および健全なコミュニティ維持<br />
        ・思い出ボトルの照合・質問正解時のリアルタイム速報およびメール配信<br />
        ・手紙の開封・想い出照合および連絡先開示（引き渡し）手続きの安全な実施<br />
        ・ユーザーから任意で投稿された再会体験談の審査、匿名化編集、および本サービスWebサイト上での適法な掲載・紹介<br />
        ・お問い合わせ対応およびサービスの安定運用・品質向上
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">3. 第三者提供および法的照会</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        当事務局は、法令に基づく場合、または捜査機関（警察等）からの正当な法的照会（捜査関係事項照会書等）を受領した場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。なお、体験談の掲載にあたっては、実名・電話番号・住所等の個人を特定可能な情報を完全に除外・匿名化して公開します。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">4. セキュリティ・安全管理</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。全通信はSSL/TLSにより暗号化され、暗号化ストレージにて厳重に管理されています。
      </p>
    </section>
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">5. AI診断におけるデータ処理方針</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        当事務局がコンテンツの安全性診断に利用するAIシステム（Google Gemini API等）においては、入力された投稿データがAIモデルの一般的な公開機械学習に二次利用されることはなく、セキュアな暗号化通信環境下で安全検査・モデレーションの目的のみに限定して処理されます。
      </p>
    </section>
    <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
      <div>制定・公表日：2026年8月15日（本番サービス運用開始日）</div>
      <div>最終改定日：2026年8月20日（AI安全診断およびデータ処理方針の追加明記）</div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-sans text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 text-black">
      <PageHeader
        icon={<FileText size={24} className="text-slate-600" />}
        iconBoxClassName="bg-slate-100 text-slate-600 border border-slate-200"
        category="Terms of Service"
        title="利用規約"
        description="ReMEETsを安全かつ円滑にご利用いただくための利用規約です。"
      />
      <TermsContent />
    </div>
  </div>
);

export const PrivacyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-sans text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 text-black font-sans">
      <PageHeader
        icon={<ShieldCheck size={24} className="text-slate-600" />}
        iconBoxClassName="bg-slate-100 text-slate-600 border border-slate-200"
        category="Privacy Policy"
        title="プライバシーポリシー"
        description="お客様の個人情報の取り扱いおよびデータ保護方針について記載しています。"
      />
      <PrivacyContent />
    </div>
  </div>
);

export const GuidelinesPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-sans text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 bg-white rounded-3xl border border-brand-border shadow-sm">
      <PageHeader
        icon={<Sparkles size={24} className="text-amber-600" />}
        iconBoxClassName="bg-amber-50 text-amber-600 border border-amber-100"
        category="Community Guidelines"
        title="投稿ガイドライン"
        description="すべての方が温かく安全に思い出と向き合えるためのルールとポリシーです。"
      />
      <div className="space-y-6 text-brand-dark/90 leading-relaxed text-sm font-sans text-black">
        <section className="space-y-3">
          <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-black">1. 健全な再会のための基本方針</h3>
          <p>
            ReMEETsは、大切な思い出を共有する特定の当事者同士が再びつながるための場所です。メッセージやクイズの設定は、特定のお相手が懐かしく振り返り、心温まる再会ができる内容に限定してください。
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-black">2. 検索の仕組みとキーワードの工夫</h3>
          <p>
            本サービスでは、お探しの当事者が自分宛ての手紙を「名前・ゆかりの地域・年代・エピソード」などで検索（エゴサーチ等）することで発見されます。<br />
            投函する際は、お相手が検索しやすいよう共通の思い出の場所やニックネーム、年代などの「手がかりキーワード」を分かりやすく設定してください。
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-black">3. 禁止される投稿内容</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-black/80">
            <li><strong>過剰な個人情報の直書き制限:</strong> 電話番号や詳細な自宅住所、他人の実名や連絡先を無断で全公開で直接掲載することは禁止されています。お互いしか知り得ないエピソードや「思い出クイズ」を活用してください。</li>
            <li><strong>他者への誹謗中傷・嫌がらせ:</strong> 特定の個人を侮辱・批判したり、プライバシーを侵害するおそれのある投稿は固く禁止します。</li>
            <li><strong>ストーカー行為・一方的な付きまとい:</strong> 相手が恐怖や嫌悪感を抱くような執拗な表現、または一方的な恋愛感情の押し付けなどはAI判定及び目視で即座に検知され、非公開化・削除の対象となります。</li>
            <li><strong>性的、暴力的な表現・商業スパム:</strong> 公序良俗に反するテキストやビジネス・勧誘目的の投稿。</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-black">4. リアルタイムAI自動診断と二重防御安全システム</h3>
          <p>
            ボトルメールが投函・更新された際、システム内部のNGワードフィルターに加え、高度なAI（Google Gemini）による文脈診断が自動実行されます。<br />
            ストーカー行為の兆候、個人情報の過度な露出、脅迫や誹謗中傷と判定された投稿は、第三者の目に触れる前に<strong>自動的に非公開（隔離）</strong>され、管理者へ緊急通報が行われます。安心・安全な再会の場を守るため、事前のAI安全検査にご理解とご協力をお願いいたします。
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-black">5. 奇跡の再会報告（体験談）の投稿基準</h3>
          <p>
            再会が成立した際の体験談をご投稿いただく場合、以下の点にご配慮をお願いいたします。<br />
            ・お相手の実名、電話番号、現在のお勤め先や詳細な居住地等の個人情報は含めず、当時の思い出や再会の喜びを中心にご記載ください。<br />
            ・投稿いただいた内容は、管理者がプライバシー配慮および安全基準に基づき確認・匿名化を実施した上で掲載されます。
          </p>
        </section>
        <section className="space-y-3">
          <h3 className="text-lg font-bold border-b border-brand-border pb-2 text-black">6. 手紙開通・連絡先開示における公的本人確認 (eKYC) の真正性</h3>
          <p>
            お相手との手紙開通・連絡先引き渡し時においては、なりすましや不正利用を防止するため、公的身分証明書（運転免許証、マイナンバーカード等）による生体顔照合およびOCR照合（eKYC）を実施しています。<br />
            身分証画像は専門機関で瞬時に照合され、自社サーバーには保存されない「ゼロデータリテンション（非保持）」モデルを採用しており、高い安全性とプライバシー保護を両立しています。
          </p>
        </section>
        <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
          <div>制定日・施行日：2026年8月15日（本番サービス運用開始日）</div>
          <div>最終改定日：2026年8月24日（公的本人確認eKYC生体照合および監査手順の明記・改訂）</div>
        </div>
      </div>
    </div>
  </div>
);

export const CompanyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-sans text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 bg-white rounded-3xl border border-brand-border shadow-sm space-y-8">
      <PageHeader
        icon={<Building2 size={24} className="text-slate-600" />}
        iconBoxClassName="bg-slate-100 text-slate-600 border border-slate-200"
        category="Company & Legal"
        title="特定商取引法に基づく表記 ＆ 運営主体"
        description="特定商取引法に基づく販売者情報、運営組織および連絡先情報です。"
      />
      <div className="divide-y divide-zinc-100 text-xs text-black">
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">サービス名</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">ReMEETs (リミーツ)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">運営主体名</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">ReMEETs  TEAM / 代表：本間 高</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">郵便番号・所在地</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル 2F-B (バーチャルオフィス契約)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">電話番号</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">050-3183-8842 (受付時間：平日 10:00〜17:00 / 録音対応)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">メールアドレス</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">support@remeets.link</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">役務の内容</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">
            思い出の手紙（ボトルメール）の投函・検索プラットフォームの提供、および手紙開封・メッセージやり取り・連絡先開示（引き渡し）システムサービスの提供。
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">役務の対価（販売価格）</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">
            ・アカウント登録・ボトル投函・自分宛ての手紙検索・一覧閲覧：完全無料（0円）<br />
            ・手紙開封・想い出照合および連絡先開示システム利用料：一回あたり 600円〜1,200円（税込 / eKYC本人認証実費を含む一括買い切り型）<br />
            ※月額会費や自動更新のサブスクリプション費用は一切発生しません。
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">お支払い方法</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">クレジットカード決済（Stripe安全決済システム）</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">お支払時期・役務の提供時期</span>
          <span className="md:col-span-2 text-neutral-900 font-medium">
            決済手続き完了時にお支払いが確定し、手続き完了後即時にシステム上で手紙の開封・想い出照合および連絡先開示が完了します。
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">返品・キャンセル・返金について</span>
          <span className="md:col-span-2 text-neutral-900 font-medium leading-relaxed">
            デジタルコンテンツおよびシステム開通・照合サービスの性質上、お支払い完了後のキャンセルおよび返金・換金には原則として一切応じられません。<br />
            ※システムの障害等により正常にサービスが提供されなかった場合は、個別確認のうえ全額返金または振替処理を行います（本人確認eKYC審査で不合格となった場合は自動キャンセル・仮売上全額取消が行われます）。<br />
            ※運用上の都合や経営判断等により将来的に本サービスが急遽閉鎖・終了となった場合であっても、過去に支払われた各種利用手数料（手紙開封・開通手数料600円〜1,200円等）および開発応援寄付金・サポーター支援金等の返金・補償には応じられませんのであらかじめご了承ください。
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 py-4 gap-2">
          <span className="font-bold text-neutral-700">制定・公表日</span>
          <span className="md:col-span-2 text-neutral-900 font-mono">2026年8月15日（本番サービス運用開始日） / 最終改定日: 2026年8月16日</span>
        </div>
      </div>
    </div>
  </div>
);

// サポーター寄付 Stripe決済モーダル
export const SupporterDonationModal = ({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { user, token } = useAuth();
  const [units, setUnits] = useState(1); // 1口 = 500円 〜 20口 = 10,000円
  const [customMessage, setCustomMessage] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user?.fullName || user?.nickname || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const totalAmount = units * 500;

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/payments/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          user_name: cardName || user?.nickname || 'サポーターユーザー',
          user_email: user?.email || 'supporter@example.com',
          amount: totalAmount,
          type: 'donation',
          status: 'completed',
          payment_method: 'stripe_card',
          transaction_id: `ch_don_${Math.random().toString(36).substring(2, 12)}`,
          ekyc_status: 'none',
          description: `ReMEETsプラットフォーム運営 支援寄付金（¥${totalAmount.toLocaleString()}）${customMessage ? ` - メッセージ: ${customMessage}` : ''}`
        })
      });

      if (res.ok) {
        localStorage.setItem('remeets_is_supporter', 'true');
        setIsCompleted(true);
        if (onSuccess) onSuccess();
      } else {
        alert('決済処理中にエラーが発生しました。もう一度お試しください。');
      }
    } catch (err) {
      console.error('Donation error:', err);
      alert('通信エラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-pink-200 relative overflow-hidden space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          ✕
        </button>

        {isCompleted ? (
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              💖
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs font-extrabold rounded-full inline-block">
                寄付手続き完了
              </span>
              <h3 className="text-xl font-bold font-serif text-slate-900">
                心より感謝申し上げます！✨
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                いただいた温かいご支援（¥{totalAmount.toLocaleString()}）は、ReMEETsのサーバー安全運用および再会のプラットフォーム維持のために大切に活用させていただきます。
              </p>
            </div>

            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-900">
                <Sparkles size={16} className="text-pink-500 shrink-0" />
                <span>⭐ サポーター特典が適用されました</span>
              </div>
              <p className="text-[11px] text-pink-800 leading-relaxed">
                マイページおよび各種画面にて「⭐ 公式サポーター」バッジが点灯いたします。引き続きReMEETsをよろしくお願いいたします。
              </p>
            </div>

            <button
              onClick={() => {
                setIsCompleted(false);
                onClose();
              }}
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl transition-all shadow-md cursor-pointer"
            >
              閉じる
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonateSubmit} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-pink-100 pb-4">
              <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
                💖
              </div>
              <div>
                <h3 className="font-extrabold text-base md:text-lg text-slate-900 font-serif">
                  運営応援（サポーター寄付）
                </h3>
                <p className="text-[11px] text-slate-500 font-sans">
                  Stripeセキュア決済による都度寄付
                </p>
              </div>
            </div>

            {/* Requested Emotional Copy */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-pink-50 border border-pink-200/80 rounded-2xl space-y-2 text-slate-800">
              <p className="text-xs md:text-sm font-medium leading-relaxed font-serif text-slate-900">
                「ReMEETsは、大切な思い出を持つすべての方が無料で手紙を流せるよう、個人運営とAI安全監査費を寄付で賄っています。この海が消えてしまわないよう、1杯のコーヒー代で応援していただけませんか？」
              </p>
            </div>

            {/* Pulldown Menu: 1口500円〜20口10,000円 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>寄付金額（口数）を選択</span>
                <span className="text-xs font-extrabold text-pink-700 font-serif">
                  合計: ¥{totalAmount.toLocaleString()} (税込)
                </span>
              </label>

              <select
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full h-12 px-4 bg-slate-50 border-2 border-pink-200 rounded-xl text-slate-900 font-bold text-xs md:text-sm focus:border-pink-500 focus:bg-white outline-none transition-all cursor-pointer font-sans"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}口 (¥{(num * 500).toLocaleString()}) {num === 1 ? '☕ 1杯のコーヒー代' : num === 2 ? '☕☕ 2口分' : num === 5 ? '🌟 人気サポーター口数' : num === 10 ? '💖 特別サポーター' : num === 20 ? '👑 最高峰サポーター' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                応援メッセージ（任意）
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="運営チームへの応援コメントをご記入いただけます..."
                className="w-full text-xs p-3 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 font-sans h-16 resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-800 block">
                クレジットカード情報 (Stripeセキュア決済)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="カード番号 (4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-sans"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-sans"
                  />
                  <input
                    type="text"
                    required
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-sans"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="カード名義人 (例: TARO YAMADA)"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-pink-500 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Coffee size={18} className="text-white shrink-0" />
              <span>{isProcessing ? '決済処理中...' : `¥${totalAmount.toLocaleString()} で ReMEETsを応援（寄付）`}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center font-sans leading-relaxed">
              ※ 月額サブスクリプションではありません。単発での応援決済となります。<br />
              ※ 運営支援寄付の性質上、サービス終了・閉鎖時等も含め、決済完了後の返金・換金には一切応じられませんのであらかじめご了承ください。
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export const PricingPage = () => {
  const { user, updateUser } = useAuth();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#supporter-donation') {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById('supporter-donation');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-teal-500/50', 'scale-[1.01]');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-teal-500/50', 'scale-[1.01]');
          }, 2000);
        }
      }, 200);
      return () => clearTimeout(scrollTimer);
    }
  }, [location.hash, location.pathname]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 font-sans text-slate-800 animate-in fade-in duration-300">
      <Link to="/" className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 font-serif">
        <ArrowLeft size={16} />
        <span>トップへ戻る</span>
      </Link>

      <div className="glass-card p-6 md:p-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-10">
        {/* 共通の PageHeader */}
        <PageHeader
          icon={<CreditCard size={26} className="text-emerald-700" />}
          iconBoxClassName="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
          category="Service Pricing"
          title="利用料金表"
          description="ReMEETsは、月額会費や自動更新が一切発生しない「完全買い切り・透明安心モデル」です。お手紙の投函や通常検索はいつでも完全無料（0円）でご利用いただけます。"
        />

        {/* 重要コピー：視認性抜群の安心宣言ボックス */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 rounded-2xl border-2 border-emerald-300/90 shadow-xs space-y-1.5 text-center">
          <p className="text-sm md:text-base font-serif font-bold text-slate-900 leading-relaxed">
            ReMEETsは、<span className="text-emerald-700 font-extrabold underline decoration-emerald-400 underline-offset-4">月額会費や自動更新（サブスク）が一切発生しない</span>安心設計です。
          </p>
          <p className="text-xs md:text-sm text-slate-700 font-sans leading-relaxed">
            手紙の投函・検索・思い出クイズ回答は<strong>いつでも完全無料（0円）</strong>。<br className="hidden sm:inline" />
            お相手の手紙を開封するときだけ<strong>1通600円（税込・買い切り）</strong>でご利用いただけます。
          </p>
        </div>

        {/* 2大メイン料金プランカード（横並び） */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h2 className="text-base md:text-lg font-serif font-bold text-slate-900">
              基本プラン ＆ 手紙開封費用
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左カード：基本機能（エメラルド＆ティール） */}
            <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-b from-emerald-50/90 via-teal-50/30 to-white border border-emerald-300 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full shadow-2xs">
                    基本機能
                  </span>
                  <span className="text-xs text-emerald-800 font-bold font-serif">月額 0 円</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-emerald-950">
                    会員登録・投函・検索
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    手紙を海に流し、大切な人を探すための基本機能はすべて永続無料です。
                  </p>
                </div>
                <div className="pt-2">
                  <div className="text-3xl font-extrabold text-emerald-900 font-serif">
                    0 <span className="text-sm font-sans font-normal text-slate-500">円</span>
                  </div>
                </div>
                <div className="border-t border-emerald-100 pt-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>アカウント登録・維持費（永久無料）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>思い出ボトルメールの投函（無制限）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>実名・地域・キーワードでの全体検索</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>秘密の質問（思い出クイズ）への回答・照合</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>ソーシャル年齢確認（LINE / Google）</span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-200 text-center text-xs font-bold text-emerald-800 shadow-2xs">
                いつでも気軽にご利用いただけます
              </div>
            </div>

            {/* 右カード：手紙開封・連絡先開示（インディゴ＆パープル） */}
            <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-b from-indigo-50/90 via-purple-50/40 to-white border border-indigo-300 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl tracking-wider">
                正解・開封時のみ
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-full shadow-2xs">
                    買い切り型
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-indigo-950">
                    手紙開封 ＆ 連絡先開示
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    クイズ正解後、お相手からの手紙全文と直通連絡先（LINE ID等）を開示します。
                  </p>
                </div>
                <div className="pt-2 flex items-baseline gap-1.5">
                  <div className="text-3xl font-extrabold text-indigo-950 font-serif">
                    600 <span className="text-sm font-sans font-normal text-slate-600">円</span>
                  </div>
                  <span className="text-xs text-slate-500 font-sans">（税込 / 1通買い切り）</span>
                </div>
                <div className="border-t border-indigo-200/80 pt-4 space-y-2.5 text-xs text-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span><strong>手紙全文の閲覧</strong>（想い出のメッセージ解凍）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span><strong>差出人の直通連絡先</strong>（LINE・メール等）開示</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span><strong>ワンタップ直通連絡</strong>（LINE起動・メール作成）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                    <span><strong>お返事メッセージの送信</strong></span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-indigo-100/70 rounded-xl border border-indigo-200/80 text-center text-xs font-bold text-indigo-900 shadow-2xs">
                月額課金なし・1通ごとの都度決済
              </div>
            </div>
          </div>
        </div>

        {/* 下段ワイド：公的本人確認 eKYC（アンバー＆ゴールド） */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-50/90 via-yellow-50/40 to-white border border-amber-300 shadow-xs space-y-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-2xs shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block font-sans">
                  Identity Verification
                </span>
                <h3 className="text-lg md:text-xl font-serif font-bold text-amber-950">
                  公的本人確認 (eKYC) について
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-full whitespace-nowrap">
                任意機能
              </span>
              <div className="text-sm font-bold text-amber-950 font-serif whitespace-nowrap">
                事前登録 0円 <span className="text-xs font-normal font-sans text-slate-600">(手紙開封時に一括精算)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
              <span className="font-bold text-amber-950 block flex items-center gap-1.5">
                <span>🛡️</span> 信頼マークの付与
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                運転免許証・マイナンバー等による確認でプロフィールに「🛡️ 公的本人確認済」マークが点灯します。
              </p>
            </div>
            <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
              <span className="font-bold text-amber-950 block flex items-center gap-1.5">
                <span>✨</span> 返信率の大幅向上
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                お相手に「サクラやなりすましではない実在の本人」という絶対の安心を届け、再会の成功率を高めます。
              </p>
            </div>
            <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200/80 space-y-1.5 shadow-2xs">
              <span className="font-bold text-amber-950 block flex items-center gap-1.5">
                <span>🔄</span> 100%全額即時返金保証
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                万が一、年齢不一致や書類不備で審査不承認となった場合は、Stripe仮売上により即座に全額自動返金されます。
              </p>
            </div>
          </div>
        </div>

        {/* 誰が払うの？スッキリ負担比較表 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Coins size={20} className="text-indigo-600" />
            <h2 className="text-base md:text-lg font-serif font-bold text-slate-900">
              差出人と受取人のご負担比較
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-xs text-left text-slate-700 font-sans">
              <thead className="text-[11px] uppercase bg-slate-100/90 text-slate-800 font-serif border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">利用シーン</th>
                  <th scope="col" className="px-5 py-3.5 text-center">費用</th>
                  <th scope="col" className="px-5 py-3.5">内容・お支払いタイミング</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <th scope="row" className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">送</span>
                    手紙を書いた人（差出人）
                  </th>
                  <td className="px-5 py-4 text-center font-bold text-emerald-700 bg-emerald-50/50 whitespace-nowrap">
                    0 円（完全無料）
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    手紙の投稿、ボトル流し、事前eKYC登録、お返事の受信まで一切費用はかかりません。
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <th scope="row" className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0">受</span>
                    手紙を見つけて開封する人（受取人）
                  </th>
                  <td className="px-5 py-4 text-center font-extrabold text-indigo-900 bg-indigo-50/60 whitespace-nowrap">
                    600 円（税込）
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    思い出クイズに正解し、手紙と連絡先を開示するときのみお支払いいただきます（買い切り）。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3大安心・安全ポリシー */}
        <div className="p-6 md:p-8 bg-slate-50 rounded-3xl border border-slate-200/90 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h2 className="text-base md:text-lg font-serif font-bold text-slate-900">
              安心・安全のための3つのお約束
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <span className="text-emerald-600">🛡️</span> 自動更新・月額なし
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                使った分だけその都度決済される完全買い切り方式。勝手に毎月課金される心配はありません。
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <span className="text-emerald-600">🔄</span> 100%全額即時返金
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Stripe仮売上（オーソリ）方式を採用。本人確認不承認時やお相手開示不能時は即座に全額返金されます。
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <span className="text-emerald-600">🔒</span> 256bit暗号化保護
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                カード情報や身分証データは金融機関レベルの暗号化で安全に保護され、第三者へ漏洩しません。
              </p>
            </div>
          </div>
        </div>

        {/* よくあるご質問（FAQ） */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <HelpCircle size={20} className="text-indigo-600" />
            <h2 className="text-base md:text-lg font-serif font-bold text-slate-900">
              よくあるご質問（FAQ）
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900">Q. 月額料金や後からの追加請求はありますか？</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                いいえ、一切ございません。ReMEETsはサブスクリプションではなく、手紙開封時の600円（税込）買い切りのみです。
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900">Q. 公的本人確認（eKYC）は必須ですか？</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                いいえ、任意です。基本はLINE/Google連携による年齢確認（無料）でご利用いただけますが、公的証明バッジを取得することで相手への安心感や返信率を高めることができます。
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900">Q. もし本人確認審査に通らなかったら返金されますか？</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                はい。Stripe決済の仮売上（オーソリ）機能により、審査不備や不承認時はシステムが自動的に即時全額返金（決済取消）いたします。
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900">Q. 手紙を開封した後はどのように連絡を取り合いますか？</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                開示された画面にお相手のLINE IDやメールアドレスが表示されます。「LINEを開く」や「メール作成」ボタンから直接ご連絡いただけます。
              </p>
            </div>
          </div>
        </div>

        {/* サポーター応援寄付（任意） */}
        <div id="supporter-donation" className="p-6 md:p-8 bg-gradient-to-br from-amber-50/60 via-pink-50/40 to-rose-50/60 rounded-3xl border border-rose-200 space-y-4 scroll-mt-24 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-rose-200/60 pb-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl shrink-0">
              <Coffee size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block font-sans">
                Optional Supporter
              </span>
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900">
                ReMEETsの運営を応援する（選択式寄付）
              </h3>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
            <p className="text-slate-600 leading-relaxed max-w-xl text-[11px]">
              ReMEETsは、すべての方が無料で手紙を流せるよう、個人運営とAI安全監査費を温かい寄付で支えていただいています。コーヒー1杯分（500円〜）から応援いただけます。
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDonationModal(true)}
                className="py-2.5 px-5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Coffee size={14} />
                <span>☕ 応援寄付をする</span>
              </button>
              <Link
                to="/supporter"
                className="py-2.5 px-4 border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl transition-all"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SupportModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        onSuccess={() => {
          if (updateUser) updateUser({ is_supporter: true });
        }}
      />
    </div>
  );
};
export const SafetyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 text-black font-sans animate-in fade-in duration-300">
    <Link to="/" className="inline-flex items-center gap-2 text-sm opacity-60 hover:opacity-100 mb-6 font-serif text-black">
      <ArrowLeft size={16} />
      <span>トップへ戻る</span>
    </Link>
    <div className="glass-card p-8 md:p-16 space-y-12 bg-white rounded-3xl border border-brand-border shadow-sm relative overflow-hidden">
      {/* 背景イラスト（上部に灯台を配置＆左右上下フェードグラデーション - 寒色トーン） */}
      <div className="absolute top-0 inset-x-0 flex justify-center items-start pointer-events-none overflow-hidden select-none z-0">
        <div className="relative w-full max-w-4xl h-[500px] md:h-[650px] opacity-80">
          <img 
            src={safetyGuardianCool} 
            alt="安全を守る静寂の灯台とボトル" 
            className="w-full h-full object-cover object-top"
          />
          {/* 左右グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
          {/* 上下グラデーション（上部は自然に、下部は白へ滑らかにフェードアウト） */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent via-30% to-white" />
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-brand-border pb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm backdrop-blur-xs">
          <ShieldCheck size={26} />
        </div>
        <div>
          <span className="text-[10px] md:text-xs font-bold text-brand-primary uppercase tracking-[0.3em] block mb-0.5 font-sans">
            Safety & Security
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-brand-dark tracking-widest leading-tight">
            安全対策・セキュリティへの取り組み
          </h1>
          <p className="text-xs md:text-sm text-brand-dark/70 font-sans leading-relaxed mt-1">
            安心・安全に思い出の人と繋がれるよう、厳格なセキュリティポリシーと最新の技術対策を導入しています。
          </p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <p className="text-[13px] leading-relaxed text-black/85 font-serif bg-white/70 p-4 rounded-2xl backdrop-blur-xs border border-slate-100/80">
          私たちは、一般的なマッチングアプリやSNSなどの「面識のない異性に無差別な偶然の出会いを提供するサービス」が抱える、ストーキング、なりすまし、未成年売春、特殊詐欺といった犯罪の温床となるリスク構造を極限まで排除しています。
        </p>

        <section className="space-y-8 pt-4">
          <h2 className="text-lg font-serif font-bold border-b border-brand-border pb-2 flex items-center gap-2 text-black">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span>主な安全システム</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-brand-border bg-slate-50/80 backdrop-blur-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xs font-bold font-mono">1</span>
                <span className="font-serif font-bold text-sm text-black">共有記憶クイズ（メモリキー）認証</span>
              </div>
              <p className="text-xs text-black/75 leading-relaxed font-sans">
                手紙を開封してお返事を届けるには、お相手が設定した「共通の思い出」に関する質問（クイズ）に完全正解する必要があります。関係のない第三者がアクセスしたり、ストーカーが推測して無差別に接触することを不可能にします。
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border bg-slate-50/80 backdrop-blur-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xs font-bold font-mono">2</span>
                <span className="font-serif font-bold text-sm text-black">お相手のフルネーム設定 ＆ 差出人のプライバシー保護</span>
              </div>
              <p className="text-xs text-black/75 leading-relaxed font-sans">
                探したいお相手（ターゲット）は当時の氏名（フルネーム）で正確に指定・検索することが可能です。一方で、差出人ご自身の現在の本名や個人情報が第三者に一般公開・晒されることがないよう、差出人の公開範囲制限と安全保護フィルターが機能します。
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border bg-slate-50/80 backdrop-blur-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xs font-bold font-mono">3</span>
                <span className="font-serif font-bold text-sm text-black">公開エリアの連絡先保護 ＆ 質問正解後の安全なSNS ID開示</span>
              </div>
              <p className="text-xs text-black/75 leading-relaxed font-sans">
                手紙本文などの全体公開エリアでは、SNS IDや電話番号などの連絡先の直接投稿を自動伏字化（マスキング）して無防備な露出を防御します。質問（共有記憶クイズ）に正解し、安全なお手続きを完了した正規のお相手にのみ、安全に差出人のSNS ID・連絡先が開示される安心のセキュリティ構造です。
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border bg-slate-50/80 backdrop-blur-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center text-xs font-bold font-mono">4</span>
                <span className="font-serif font-bold text-sm text-black">Gemini AI による執念・付きまとい監視</span>
              </div>
              <p className="text-xs text-black/75 leading-relaxed font-sans">
                文章に流れる「執拗な感情（リベンジポルノ・恐怖売渡を目的とするストーキングなど）」の文脈を、最先端のGemini AIが裏でリアルタイム解析。高リスクと判定されたアカウントは自動的に「ステルス隔離（シャドウ）」されます。
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-6 bg-slate-900/95 backdrop-blur-xs text-white rounded-3xl p-8 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-400" />
            <h3 className="text-base font-serif font-bold text-white">警察等司法機関との堅固な協調体制</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-serif text-white/95">
            万が一、利用を仮装した悪質なストーキング行為、嫌がらせ、なりすまし等が発生した場合、各都道府県警察の生活安全課、サイバー犯罪対策課などの刑事捜査事項照会に対して、私たちは最高速度で応じるポータルAPIを用意しています。
            提出書類の受理後, 瞬時に署名ログ・接続端末IP・アクセス履歴をフォレンジック抽出して提供し、徹底的な犯人検挙、犯罪撲滅に完全協力することをお約束いたします。
          </p>
        </section>

        <div className="pt-6 text-center">
          <p className="text-xs text-black/55 mb-2">何らかの不都合や個人情報の違法掲載、削除が必要なボトルがございましたら：</p>
          <Link to="/deletion-request" className="btn-primary inline-flex animate-none text-xs">
            削除申請（オプトアウト）はこちら
          </Link>
        </div>
      </div>
    </div>
  </div>
);








export const DeletionRequestPage = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const queryPostId = searchParams.get('id') || searchParams.get('post_id') || '';
  const queryName = searchParams.get('name') || '';
  const queryContent = searchParams.get('content') || '';
  
  const [postId, setPostId] = useState(queryPostId);
  const [targetPost, setTargetPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [name, setName] = useState(user?.nickname || user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [content, setContent] = useState(queryContent);
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // 対象手紙の情報を自動取得
  useEffect(() => {
    const targetIdToFetch = postId || queryPostId;
    if (targetIdToFetch) {
      setLoadingPost(true);
      fetch(`/api/posts/${targetIdToFetch}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setTargetPost(data);
            if (!content) {
              const summary = `【宛先】${data.target_name || ''} 様 / 【年代】${data.era || ''}年代 / 【関係性】${data.category === 'friend' ? '友人' : data.category === 'love' ? '初恋・他' : 'その他'} / 【メッセージ抜粋】${data.searcher_profile || ''}`;
              setContent(summary);
            }
            if (!url) {
              setUrl(window.location.origin ? `${window.location.origin}/posts/${data.id}` : `https://remeets.dev/post/${data.id}`);
            }
          }
        })
        .catch(err => console.error('Failed to fetch post details for deletion request:', err))
        .finally(() => setLoadingPost(false));
    }
  }, [postId, queryPostId]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.nickname || user.username || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('削除申請を送信するには、ログインしている必要があります。');
      setStatus('error');
      return;
    }
    if (!postId || !reason || !content) {
      setErrorMsg('必須項目（手紙ID、手紙の特徴・掲載内容、申請理由）をご入力ください。');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/deletion-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id: parseInt(postId),
          name: name || '匿名申請者',
          url: url || `https://remeets.dev/post/${postId}`,
          content: content,
          reason: reason,
          explanation: explanation,
          email: email
        })
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || '申請の送信に失敗しました。');
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'エラーが発生しました。');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-black font-sans">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-primary mb-6 font-sans transition-colors">
        <ArrowLeft size={16} />
        <span>トップページへ戻る</span>
      </Link>
      <div className="glass-card p-6 md:p-10 space-y-8 bg-white rounded-3xl border border-slate-200/90 shadow-lg">
        {/* ヘッダー */}
        <div className="flex items-start gap-4 border-b border-slate-150 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <Trash2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] md:text-xs font-bold text-rose-600 uppercase tracking-[0.25em] font-sans">
                Deletion & Privacy Protection
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                24時間体制受付
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-900 tracking-wide leading-tight">
              手紙（ボトルメール）の削除・掲載停止依頼
            </h1>
            <p className="text-xs text-slate-600 font-sans leading-relaxed mt-1">
              ご自身の情報が掲載されている場合や、削除をご希望の手紙について、迅速に非公開・完全削除の申請を受理いたします。
            </p>
          </div>
        </div>

        {/* 対象手紙の自動検知プレビューカード */}
        {targetPost && (
          <div className="bg-gradient-to-r from-teal-50/80 to-slate-50 border-2 border-teal-200/90 rounded-2xl p-4 md:p-5 space-y-2 text-left animate-fadeIn shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-teal-150 pb-2">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-sans">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>対象の手紙情報（自動読み込み完了）</span>
              </span>
              <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                手紙ID: #{targetPost.id}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 text-slate-850">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">宛先のお名前:</span>
                <span className="font-bold text-slate-900">{targetPost.target_name || '未設定'} 様</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">差出人・年代:</span>
                <span>{targetPost.searcher_name || '差出人'} / {targetPost.era ? `${targetPost.era}年代` : '未設定'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">ゆかりの地域:</span>
                <span>{targetPost.target_hometown || '非公開'}</span>
              </div>
            </div>
            {targetPost.searcher_profile && (
              <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-teal-100 mt-2 font-sans line-clamp-2">
                「{targetPost.searcher_profile}」
              </div>
            )}
          </div>
        )}

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4 text-center text-black"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-lg font-serif font-bold text-emerald-900">手紙の削除申請を受理いたしました</h2>
            <p className="text-xs text-emerald-800/90 max-w-md leading-relaxed text-black font-sans">
              対象手紙<strong>「手紙ID: #{postId}」</strong>に関する削除・非公開申請を正常に受け付けました。<br />
              運営事務局にて内容を確認後、速やかに掲載停止・削除処置を実施いたします。完了のご案内はご登録のメールアドレス宛てにお知らせいたします。
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate('/')} className="btn-primary py-2.5 px-6 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold">
                トップページへ戻る
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {!token && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-sans">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-bold">削除申請を行うにはアカウントでのログインが必要です。</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    悪意ある第三者による無差別な手紙の嫌がらせ削除を防ぎ、削除依頼の真正性を確認・記録するため、ログインの上でお手続きをお願い申し上げます。
                  </p>
                  <div className="mt-2.5">
                    <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="inline-flex items-center gap-1 font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg shadow-xs transition-colors">
                      <span>ログインして申請を続ける</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between font-sans">
                  <span>対象手紙のID（必須）</span>
                  {postId && <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">✓ 自動入力済み</span>}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    placeholder="例: 42"
                    value={postId}
                    onChange={e => setPostId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-xs text-black font-mono focus:bg-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                  {loadingPost && (
                    <span className="absolute right-3 top-3 text-[10px] text-teal-600 animate-pulse font-sans font-bold">
                      情報照会中...
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  ※手紙詳細ページから遷移された場合は自動で入力されています。
                </p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block font-sans">
                  申請理由（必須）
                </label>
                <select 
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-xs text-black font-sans focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="" disabled>削除理由を選択してください</option>
                  <option value="自分の個人情報が掲載されている（本名・旧姓・あだ名等）">自分の個人情報が掲載されている（本名・旧姓等）</option>
                  <option value="差出人に心当たりがなく不安・削除してほしい">差出人に心当たりがなく不安・削除してほしい</option>
                  <option value="投稿者本人によるボトルの取り下げ・削除希望">投稿者本人によるボトルの取り下げ・削除希望</option>
                  <option value="誹謗中傷・プライバシー侵害・不快な内容">誹謗中傷・プライバシー侵害・不快な内容</option>
                  <option value="ストーカー・一方的な付きまといの懸念">ストーカー・一方的な付きまといの懸念</option>
                  <option value="誤った情報の記載・誤認投稿">誤った情報の記載・誤認投稿</option>
                  <option value="その他安全上の理由">その他安全上の理由</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between font-sans">
                <span>対象手紙の掲載内容・特徴（必須）</span>
                {content && <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">✓ 自動入力済み</span>}
              </label>
              <textarea 
                required
                rows={3}
                placeholder="宛先名、年代、本文の特徴など。手紙詳細から開いた場合は自動入力されます。"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-xs text-black font-sans focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block font-sans">
                詳細なご事情・オプトアウトのご要望（任意）
              </label>
              <textarea 
                rows={3}
                placeholder="「自分の旧姓と出身中学校が書かれており削除を希望する」など、詳しいご事情があればご記入ください。"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-xs text-black font-sans focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block font-sans">ご連絡用お名前</label>
                <input 
                  type="text"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-xs text-black font-sans focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block font-sans">ご連絡用メールアドレス</label>
                <input 
                  type="email"
                  placeholder="example@yourdomain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white text-xs text-black font-sans focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-sans">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={status === 'submitting' || !token} 
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer font-sans disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {status === 'submitting' ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>申請を送信中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>手紙の削除申請を安全に送信する</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

