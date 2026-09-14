import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, ArrowRight, BookOpen, Building2, CheckCircle2,
  Coffee, Coins, CreditCard, FileText, HelpCircle, MessageSquare,
  RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Trash2,
  Lock, Check, Heart, User, Shield, Copy, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCardPaymentForm } from '../components/CreditCardPaymentForm';
import { motion } from 'framer-motion';
import { PageHeader } from '../lib/utils';
import { BackToHomeButton } from '../components/SharedComponents';

export const TermsContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第1条（目的及び本規約の適用範囲）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本利用規約（以下「本規約」）は、ReMEETs運営事務局（以下「当事務局」）が提供する、かつての知人等との合意に基づく再会を支援するWebインフラ「ReMEETs」（以下「本サービス」）の利用条件を定めるものです。<br />
        2. 本サービスは、過去に実在した同級生、恩師、知人等との健全な再会を目的とした専用サービスであり、不特定多数に対する無差別な異性交際を斡旋する「インターネット異性紹介事業（出会い系サイト）」には該当いたしません。<br />
        3. 本サービスにアクセス、または会員登録されたすべてのユーザーは、本規約の全条項に同意したものとみなされます。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第2条（利用資格および年齢制限）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本サービスは、青少年保護および健全なサービス治安維持の観点から、<strong>18歳以上（高校生を除く）</strong>の方のみがご利用いただけます。18歳未満または高校生の方のアカウント登録およびご利用は一切できません。<br />
        2. ユーザーが年齢を偽装して本サービスを利用した場合、当事務局は事前の通知なくアカウントを即時強制停止（BAN）し、過去の決済手数料の返金には応じません。また、当該行為に起因して生じたトラブルについて当事務局は一切の責任を負いません。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第3条（アカウント管理およびSNS認証・本人確認）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 利用者は、自己の責任において本サービスのアカウントを適切に管理するものとします。<br />
        2. 本サービスでは、パスワード漏洩リスクの排除、重複登録アタックの防止、および成りすまし行為の排除を目的として、信頼性の高い外部SNS（LINE、Google等）を用いたOAuth基盤認証ならびにメール認証を導入しています。<br />
        3. ユーザーは、実体のない使い捨てSNSアカウントを用いた嫌がらせ・荒らし・不正アクセス目的の大量登録を行ってはなりません。<br />
        4. メッセージの開封・連絡先開示等の特定機能の利用にあたり、公的身分証明書を用いた本人確認（eKYC）およびSMS電話番号認証の完了を任意または必須として求める場合があります。なお、eKYC時に送信される身分証明書の画像生データは提携eKYC事業者のセキュア環境下でのみ処理・検証され、当事務局サーバー側には一切保存されません。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第4条（サービス利用料金・決済・サポーター寄付）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本サービスへの会員登録、メッセージ（ボトルメール）の投函、自分宛てのメッセージの検索・一覧閲覧、新着メール通知アラートの登録、および思い出クイズへの回答はすべて<strong>永久無料（0円）</strong>です。<br />
        2. お相手からのメッセージの開封および連絡先開示（引き渡し）システムを利用する際、1通あたり<strong>600円（税込・買い切り）</strong>のシステム利用料が発生します。<br />
        3. 公的本人確認（eKYC）を希望する場合、審査実費として1回あたり<strong>600円（税込）</strong>の本人確認手数料が発生します（メッセージ開封と同時に利用する場合は合計1,200円）。<br />
        4. 本サービスの健全な運営とAI安全監査体制を支援するための「サポーター寄付（1口 500円〜）」は完全任意であり、税務上の寄付金控除の対象外となります。<br />
        5. 本サービスには月額会費や自動更新されるサブスクリプション費用は一切発生いたしません。<br />
        6. デジタルコンテンツおよびシステム即時開通の性質上、決済完了後の各種手数料および寄付金の返金・換金には原則として応じられません（ただし、eKYC審査で不合格となった場合は自動的に仮売上の全額取消・返金が行われます）。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第5条（AI安全自動診断・モデレーションおよびコンテンツ監視）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 当事務局は、本サービスの健全性維持、ストーカー行為の未然抑止、プライバシー保護、誹謗中傷排除のため、投稿・更新されたメッセージ（ボトルメール）およびメッセージに対して、最新のAIモデレーションエンジン（Gemini API等）およびシステムによる自動診断・検閲を常時実施します。<br />
        2. AIまたはシステムにより禁止事項（過度な個人情報の直接掲載、脅迫・付きまといの兆候、公序良俗・法令違反等）に該当すると判定された投稿は、事前通知なく自動的に即時非公開（安全隔離・物理保全）または削除される場合があります。<br />
        3. ユーザーは、本サービスを利用してテキストを送信・更新することにより、安全確保およびモデレーションを目的とした当該AI自動診断処理の実行に明示的に同意したものとみなされます。<br />
        4. AI判定の誤検知・不検知、またはこれに伴う一時的な非公開措置によりユーザーに生じた機会損失や不利益について、当事務局は故意または重過失がある場合を除き一切の責任を負いません。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第6条（禁止事項）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。<br />
        ・不特定の異性との交際・出会いを目的とした利用（出会い系・マッチング目的利用、売春・パパ活等）<br />
        ・他者へのストーカー行為、付きまとい、威嚇、強要、名誉毀損または誹謗中傷<br />
        ・メッセージ本文欄への直接的な連絡先情報（LINE ID、電話番号、詳細住所等）の記載<br />
        ・bot等の自動化プログラムを用いた思い出クイズの総当たり回答（ブルートフォースアタック）<br />
        ・実在しない人物の偽装登録、第三者への成りすまし、または虚偽の事実の投稿<br />
        ・商業目的の宣伝・勧誘・スパム送信、マルチ商法・宗教勧誘行為<br />
        ・法令、公序良俗、または本規約に違反する一切の行為
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第7条（捜査機関への情報提供・法的照会対応）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 当事務局は、本サービス内において犯罪行為、ストーカー事案、重大な権利侵害等が発生した場合、治安維持および被害防止に全面協力します。<br />
        2. 刑事訴訟法第197条第2項に基づく捜査関係事項照会書、裁判所の令状、または法令に基づく正当な開示請求を受領した場合、当事務局はユーザーの同意を得ることなく、登録情報、接続IPアドレス、タイムスタンプ、決済ログ、およびAI安全隔離されたメッセージ等の記録を警察・検察・公安等の捜査機関に提供・開示できるものとし、ユーザーはこれに予め同意するものとします。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第8条（奇跡の再会報告・体験談の投稿および利用許諾）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. ユーザーは、本サービスを通じて大切な方と再会できた際、任意で「奇跡の再会報告（体験談）」投稿フォームより感謝・再会メッセージを当事務局へ送信することができます。<br />
        2. ユーザーが投稿したメッセージ・年代・性別情報は、当事務局による目視およびAIによる事前審査（個人情報の除外・完全匿名化処理）を経た上で、本サービス公式Webサイト（トップページ、体験談ページ等）に無償・非独占的に掲載・紹介されることに同意するものとします。<br />
        3. ユーザーは、虚偽の事実、他者の名誉・プライバシーを侵害する内容、または第三者の権利を害するメッセージを投稿してはなりません。<br />
        4. 掲載された体験談の削除または非公開化を希望する場合、ユーザーはお問い合わせフォーム等よりいつでも当事務局へ申し出ることができ、当事務局は速やかに対応するものとします。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第9条（リアルタイム速報通知およびメール配信）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本サービスでは、ユーザーが投函したメッセージに対してお相手が思い出クイズに正解した場合、またはメッセージ・連絡先が開示された場合等に、WebSocket接続によるリアルタイム画面速報通知および登録メールアドレス宛への自動通知メール配信を行います。<br />
        2. 通信障害、端末設定、またはメール受信拒否等に起因する通知の遅延や不達について、当事務局は故意または重過失がある場合を除き責任を負いません。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第10条（退会およびデータの取り扱い）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. ユーザーは、マイページよりいつでも退会手続きを行うことができます。<br />
        2. 退会時、アカウント情報および関連データは速やかに削除または適切に匿名化処理されます。ただし、法令に基づく保管義務がある情報やセキュリティ監査ログ、および不正利用防止のための接続ログについては一定期間安全に保存されます。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第11条（本サービスの変更・中断・終了および免責）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 当事務局は、運用上、技術上、経営上の都合その他やむを得ない事由により、本サービス上での事前告知等をもって、本サービスの提供を一時中断、休止、または終了（サービス閉鎖）することができるものとします。<br />
        2. 運営不能やサービス閉鎖を含む本サービスの終了が生じた場合であっても、過去にユーザーが支払った各種利用手数料（メッセージ開封・開通手数料 600円、eKYC審査実費等）およびサポーター寄付金について、理由の如何を問わず返金、返還、損害賠償等の請求には応じられません。<br />
        3. 当事務局は、本サービスの連絡先開示機能を通じて開示された連絡先を用いて行われる当事者間の連絡、実際の対面、交際、その他一切のやり取りにおけるトラブルについて、当事者間で解決するものとし、当事務局は故意または重過失がある場合を除き一切の責任を負いません。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">第12条（準拠法および管轄裁判所）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 本規約の解釈および適用にあたっては、日本法を準拠法とします。<br />
        2. 本サービスまたは本規約に関して当事務局とユーザーとの間に紛争が生じた場合、当事務局の所在地を管轄する地方裁判所または簡易裁判所を第一審の専属的合意管轄裁判所とします。
      </p>
    </section>

    <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
      <div>制定日・施行日：2026年8月15日（本番サービス運用開始日）</div>
      <div>最終改定日：2026年8月20日（SNS連携規定・利用資格・警察照会連携の明記改定）</div>
    </div>
  </div>
);

export const PrivacyContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">1. 基本方針（プライバシー保護への姿勢）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ReMEETs運営事務局（以下「当事務局」）は、ユーザーの皆様の大切な想い出と個人情報の重要性を深く認識し、個人情報の保護に関する法律（個人情報保護法）その他関連法令・ガイドラインを遵守し、以下の方針に基づき個人情報を適切かつ安全に取り扱います。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">2. 取得する情報および取得方法</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        当事務局は、本サービスの円滑な提供および治安維持のため、以下の情報を取得・保持する場合があります。<br />
        ・<strong>SNS連携（OAuth）認証情報：</strong> LINE、Google等の外部認証プロバイダより取得するアカウント識別子（UID）、表示ニックネーム、プロフィール画像URL、およびメールアドレス（※パスワードは当事務局側では一切取得・保持いたしません）。<br />
        ・<strong>本人確認（eKYC）認証情報：</strong> 提携eKYC事業者より返却される公的身分証明書の審査結果ステータス（合格/不合格）および承認日時（※運転免許証等の画像生データは当事務局サーバーには保存されません）。<br />
        ・<strong>決済関連情報：</strong> Stripe決済システムにより安全に処理される決済トークン、取引ID、決済日時、決済金額（※クレジットカード番号やCVC等の決済生データは当事務局サーバーを一切通過・保持いたしません）。<br />
        ・<strong>投稿・メッセージ情報：</strong> ボトルメール本文、想い出クイズ（質問・正解）、開示用連絡先（LINE ID等）、およびそのAI安全自動診断結果（モデレーション判定フラグ・隔離理由）。<br />
        ・<strong>奇跡の再会報告（体験談）情報：</strong> ユーザーから任意で投稿いただく感謝メッセージ、出会った年代、性別、およびWeb掲載同意情報。<br />
        ・<strong>アクセス・通信ログ：</strong> 接続元IPアドレス、アクセス日時タイムスタンプ、ご利用端末・ブラウザ情報（User-Agent）、リアルタイム通知（WebSocket）接続識別子。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">3. 個人情報の利用目的</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        取得した個人情報は、以下の目的のためにのみ利用します。<br />
        ・アカウントの認証、本人特定、および重複登録・成りすまし行為の排除<br />
        ・想い出ボトルの検索・マッチング、思い出クイズによる本人照合、および連絡先開示（引き渡し）手続きの安全な実施<br />
        ・AI（人工知能）安全モデルを用いた投稿内容のリアルタイム診断による、ストーカー行為・個人情報漏洩・誹謗中傷・法令違反の未然抑止および治安維持<br />
        ・思い出ボトルの照合・クイズ正解時のリアルタイム速報通知および登録メールアドレスへの自動配信<br />
        ・ユーザーから任意で投稿された再会体験談の審査、匿名化編集、および公式Webサイト上での適法な掲載・紹介<br />
        ・お問い合わせへの対応、システムの安定運用、セキュリティ監査、およびサービス品質の向上
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">4. 機微個人情報の完全非保持および安全管理措置</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. <strong>身分証明書画像生データの非保持（金庫モデル）：</strong> ユーザーが提出する運転免許証・マイナンバーカード等の画像データは、提携eKYC事業者のセキュアな認証サーバー側でのみ処理され、当事務局のサーバーには一切保存されません。当事務局は認証ステータス（合格/不合格）と承認日時のみを安全に保持します。<br />
        2. <strong>クレジットカード情報の非保持：</strong> 決済処理は国際規格（PCI-DSS Level 1）に準拠したStripe基盤により直接処理され、当事務局サーバーにカード番号等が通過・蓄積されることはありません。<br />
        3. <strong>通信・保管の暗号化：</strong> 全通信はSSL/TLSにより暗号化され、データベース内の機微情報は高度な暗号化ストレージにて厳重に管理されます。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">5. 第三者提供および捜査機関（警察・公安）からの法的照会対応</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        1. 当事務局は、ユーザーの同意を得ることなく個人情報を第三者に提供することはありません。ただし、法令に基づく正当な開示請求がある場合はこの限りではありません。<br />
        2. 刑事訴訟法第197条第2項に基づく捜査関係事項照会書、裁判所の令状、または捜査機関（警察・公安・検察等）からの正当な法的照会を受領した場合、当事務局は治安維持および被害防止のため、登録情報、接続IPアドレス、アクセス日時、決済ログ、およびAI安全隔離されたメッセージ等のログを関係機関に提供・開示します。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">6. AI自動検閲システムにおけるデータ保護方針（二次学習不利用の保証）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        当事務局が投稿テキストの安全性診断に利用するAIシステム（Google Gemini API等）においては、入力されたデータがAIモデルの一般的な公開機械学習に二次利用されることはなく、セキュアな暗号化通信環境下で安全検査・モデレーションの目的のみに限定して処理されます。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">7. 位置情報・プライバシーの保護方針（都道府県までの公開）</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ボトルメール投函時にお相手のゆかりの地として市区町村まで入力された場合でも、Webサイト上で一般公開されるのは「都道府県」までとなります。市区町村以下の詳細な住所情報が一般公開されることはなく、個人の現在地およびプライバシーを厳格に保護します。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">8. 保有個人データの開示・訂正・利用停止・削除請求</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        ユーザーは、マイページより登録情報の確認・変更・退会手続きを行うことができます。また、個人情報保護法に基づく保有個人データの開示、訂正、追加、削除、利用停止等をご希望の場合は、お問い合わせフォームよりご請求いただけます。ご本人確認を行った上で、法令に従い合理的な期間内に対応いたします。
      </p>
    </section>

    <section className="space-y-2">
      <h3 className="text-lg font-bold mb-3 border-b border-brand-border pb-2 text-black font-serif">9. プライバシーポリシーの改定およびお問い合わせ窓口</h3>
      <p className="leading-relaxed text-xs text-black font-sans">
        当事務局は、法令の改正やサービスの改善に伴い、本プライバシーポリシーを改定することがあります。重要な変更がある場合は、本サービスWebサイト上での告知等により周知いたします。<br />
        個人情報の取り扱いに関するご質問、苦情、およびご相談は、本サービス内のお問い合わせフォームよりご連絡ください。
      </p>
    </section>

    <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
      <div>制定・公表日：2026年8月15日（本番サービス運用開始日）</div>
      <div>最終改定日：2026年8月20日（SNS連携規定・非保持金庫モデル・警察照会連携の明記改定）</div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
    <BackToHomeButton />
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
    <BackToHomeButton />
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

export const GuidelinesContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    {/* 1. 基本姿勢 */}
    <section className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans">01</span>
        <span>健全な想い出再会のための基本姿勢（出会い系目的の完全排除）</span>
      </h3>
      <p className="leading-relaxed text-xs text-slate-700 font-sans">
        ReMEETsは、過去に実在した同級生、恩師、幼馴染、昔の知人など、大切な思い出を共有する特定の当事者同士が再びつながるための「想い出再会専用プラットフォーム」です。<br />
        不特定多数との無差別な異性交際を目的とした利用（出会い系・マッチング・パパ活・ナンパ等）は固く禁止されており、発見次第アカウントを即時停止（BAN）いたします。
      </p>
    </section>

    {/* 2. キーワード設定の工夫 */}
    <section className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-sans">02</span>
        <span>お相手に届くキーワード設定の工夫（検索性向上のヒント）</span>
      </h3>
      <p className="leading-relaxed text-xs text-slate-700 font-sans">
        お探しの当事者が自分宛てのメッセージを検索（エゴサーチ等）した際に発見できるよう、以下の「手がかりキーワード」を丁寧に設定してください。
      </p>
      <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 leading-relaxed">
        <li><strong>相手の名前：</strong> 漢字表記に加え、旧姓やひらがな、当時呼んでいたニックネーム等を活用。</li>
        <li><strong>ゆかりの地：</strong> 二人が出会った地域や学校、部活動の場所を設定（※一般公開されるのは「都道府県」までです）。</li>
        <li><strong>年代・カテゴリ：</strong> 交流のあった年代（例：1990年代）や関係性（同級生、元同僚等）を正確に選択。</li>
      </ul>
    </section>

    {/* 3. 連絡先直書き禁止ルール */}
    <section className="space-y-2 p-5 bg-amber-50/80 rounded-2xl border-2 border-amber-300 shadow-2xs">
      <h3 className="text-base font-bold text-amber-950 font-serif flex items-center gap-2 border-b border-amber-200 pb-2">
        <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-sans">03</span>
        <span>【重要】メッセージ本文への「連絡先直書き」の禁止ルール</span>
      </h3>
      <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed font-sans space-y-1.5">
        <p className="font-bold text-rose-700">
          ⚠️ メッセージの本文欄に、LINE ID、メールアドレス、電話番号、詳細な住所などを直接記載してはなりません。
        </p>
        <p className="text-slate-700 text-[11px]">
          メッセージ本文はクイズ正解前の画面にも一部露出するため、安全保護の観点からAI検閲により即時自動隔離（非公開化）の対象となります。連絡先情報は、必ず所定の<strong>「開示用連絡先」専用欄</strong>にご入力ください（思い出クイズに全問正解し、手続きを完了したお相手にのみ安全に開示されます）。
        </p>
      </div>
    </section>

    {/* 4. クイズ作成ガイドライン */}
    <section className="space-y-3 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-sans">04</span>
        <span>思い出クイズ作成ガイドライン（良問のコツと不適切例）</span>
      </h3>
      <p className="text-xs text-slate-700 leading-relaxed">
        思い出クイズ（2問）は、探しているご本人であるかを確実に確かめるための最重要防衛システムです。第三者には推測できない「ふたりだけの記憶」を設定してください。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
          <span className="font-bold text-emerald-900 flex items-center gap-1">
            ⭕ 適切な出題例（ふたりだけの固有の記憶）
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            ・「高2の文化祭で一緒に作った出し物の看板文字は？」（例: 喫茶ポエム）<br />
            ・「放課後によく二人で通っていた駄菓子屋の名前は？」（例: きくや商店）<br />
            ・「中学の卒業式の日、帰り道に埋めたタイムカプセルの場所は？」
          </p>
        </div>
        <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
          <span className="font-bold text-rose-900 flex items-center gap-1">
            ❌ 避けるべき不適切例（第三者が推測できるもの）
          </span>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            ・「私の誕生月は何月？」（SNS等で容易に特定可能）<br />
            ・「私の好きな食べ物は？」（当てずっぽうで正解される恐れあり）<br />
            ・「私たちの出身中学校の名前は？」（卒業名簿等で特定されるリスクあり）
          </p>
        </div>
      </div>
    </section>

    {/* 5. 禁止される投稿・行為 */}
    <section className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-sans">05</span>
        <span>禁止される投稿・行為（ストーカー・誹謗中傷・商業スパムの厳罰化）</span>
      </h3>
      <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
        <li><strong>過剰な個人情報の直書き:</strong> 他人の実名、電話番号、詳細な自宅住所などを無断で掲載する行為。</li>
        <li><strong>他者への誹謗中傷・嫌がらせ:</strong> 特定の個人を侮辱・批判したり、プライバシーを侵害するおそれのある投稿。</li>
        <li><strong>ストーカー行為・一方的な付きまとい:</strong> 相手が恐怖や嫌悪感を抱くような執拗な表現、一方的な恋愛感情の押し付け行為。</li>
        <li><strong>性的・暴力的な表現、商業スパム:</strong> 公序良俗に反するテキスト、マルチ商法・宗教勧誘・アフィリエイト目的の投稿。</li>
        <li><strong>bot等によるクイズ総当たり攻撃:</strong> 不正なプログラムを用いた自動回答行為。</li>
      </ul>
    </section>

    {/* 6. AI水際検閲と警察連携 */}
    <section className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-sans">06</span>
        <span>AI水際検閲（Gemini API）と自動隔離・警察捜査連携体制</span>
      </h3>
      <p className="leading-relaxed text-xs text-slate-700 font-sans">
        ボトルメールが投函・更新された際、システム内部のNGワード判定に加え、高度なAI（Google Gemini API）による文脈診断が24時間自動実行されます。<br />
        ストーカー行為の兆候、個人情報の過度な露出、脅迫や誹謗中傷と判定された投稿は、第三者の目に触れる前に<strong>自動的に非公開（安全隔離・物理保全）</strong>されます。また、重大事案については刑事訴訟法第197条第2項に基づき、接続IPアドレスおよびアクセスログを警察・公安機関へ速やかに提供いたします。
      </p>
    </section>

    {/* 7. eKYCゼロデータ保持モデル */}
    <section className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-sans">07</span>
        <span>メッセージ開通・公的本人確認（eKYC）におけるゼロデータ保持モデル</span>
      </h3>
      <p className="leading-relaxed text-xs text-slate-700 font-sans">
        お相手とのメッセージ開通時において公的本人確認（eKYC）を実施する場合、提出される運転免許証・マイナンバーカード等の画像生データは提携専門機関のセキュア環境でのみ照合され、当事務局サーバーには保存されない「ゼロデータリテンション（非保持）」モデルを採用しています。情報漏洩リスクを完全に排除し、安全な再会をお守りします。
      </p>
    </section>

    {/* 8. 奇跡の再会報告（体験談）の投稿基準 */}
    <section className="space-y-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-sans">08</span>
        <span>奇跡の再会報告（体験談）の投稿・掲載基準</span>
      </h3>
      <p className="leading-relaxed text-xs text-slate-700 font-sans">
        再会が成立した際の体験談をご投稿いただく場合、お相手の実名、電話番号、現在のお勤め先や詳細な居住地等の個人情報は含めず、当時の思い出や再会の喜びを中心にご記載ください。投稿いただいた内容は、プライバシー配慮および安全基準に基づき匿名化編集を実施した上で公式Webサイトに掲載されます。
      </p>
    </section>

    <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
      <div>制定日・施行日：2026年8月15日（本番サービス運用開始日）</div>
      <div>最終改定日：2026年8月24日（公的本人確認eKYC生体照合および監査手順の明記・改訂）</div>
    </div>
  </div>
);

export const GuidelinesPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
    <BackToHomeButton />
    <div className="glass-card p-8 md:p-16 text-black font-sans">
      <PageHeader
        icon={<Sparkles size={24} className="text-slate-600" />}
        iconBoxClassName="bg-slate-100 text-slate-600 border border-slate-200"
        category="Community Guidelines"
        title="投稿ガイドライン"
        description="すべての方が温かく安全に思い出と向き合えるためのルールとポリシーです。"
      />
      <GuidelinesContent />
    </div>
  </div>
);

export const CompanyContent = () => (
  <div className="space-y-6 text-brand-dark/90 text-[13px] leading-relaxed text-black font-sans">
    <div className="divide-y divide-zinc-200 text-xs text-black bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 bg-slate-50/60">
        <span className="font-bold text-neutral-800">サービス名</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">ReMEETs (リミーツ)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
        <span className="font-bold text-neutral-800">運営事業者 / 運営責任者</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">ReMEETs TEAM / 代表・運営責任者：本間 高</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 bg-slate-50/60">
        <span className="font-bold text-neutral-800">郵便番号・所在地</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">〒150-0043 東京都渋谷区道玄坂1丁目10番8号 渋谷道玄坂東急ビル 2F-B (バーチャルオフィス契約)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
        <span className="font-bold text-neutral-800">電話番号</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">050-3183-8842 (受付時間：平日 10:00〜17:00 / 録音・伝言対応)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 bg-slate-50/60">
        <span className="font-bold text-neutral-800">メールアドレス / お問い合わせ</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">
          support@remeets.link<br />
          <span className="text-[11px] text-slate-500">※お問い合わせはWebサイト内のお問い合わせフォームより24時間受け付けております。</span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
        <span className="font-bold text-neutral-800">役務の内容</span>
        <span className="md:col-span-2 text-neutral-900 font-medium leading-relaxed">
          想い出のメッセージ（ボトルメール）の投函・検索プラットフォームの提供、思い出クイズによる本人照合、およびメッセージ開封・連絡先開示（引き渡し）システムサービスの提供。
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 bg-slate-50/60">
        <span className="font-bold text-neutral-800">役務の対価（販売価格）</span>
        <span className="md:col-span-2 text-neutral-900 font-medium leading-relaxed space-y-1 block">
          ・<strong>基本機能（登録・投函・検索・クイズ回答・新着通知アラート）：</strong> 完全無料（0円）<br />
          ・<strong>メッセージ開封・連絡先開示手数料：</strong> 1通あたり 600円（税込・買い切り）<br />
          ・<strong>公的本人確認（eKYC）審査手数料（任意オプション）：</strong> 1回あたり 600円（税込）（※メッセージ開封と同時利用時 1,200円）<br />
          ・<strong>サポーター寄付（任意）：</strong> 1口 500円〜（都度決済・税務上の寄付金控除対象外）<br />
          <span className="text-[11px] text-emerald-800 font-bold block pt-0.5">※月額会費や自動更新のサブスクリプション費用は一切発生いたしません。</span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
        <span className="font-bold text-neutral-800">役務の対価以外に必要な費用</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">
          インターネット接続料金、パケットデータ通信料金等はお客様のご負担となります。
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 bg-slate-50/60">
        <span className="font-bold text-neutral-800">お支払い方法</span>
        <span className="md:col-span-2 text-neutral-900 font-medium leading-relaxed">
          クレジットカード決済（Visa, Mastercard, JCB, American Express, Diners Club, Discover 等）<br />
          <span className="text-[11px] text-slate-500">※国際最高基準（PCI-DSS Level 1）に準拠したStripe暗号化決済システムにより安全に処理されます。</span>
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
        <span className="font-bold text-neutral-800">お支払時期・役務の提供時期</span>
        <span className="md:col-span-2 text-neutral-900 font-medium leading-relaxed">
          決済手続き完了時にお支払いが確定し、手続き完了後即時にシステム上でメッセージの開封・想い出照合および連絡先開示が完了します。
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 bg-slate-50/60">
        <span className="font-bold text-neutral-800">返品・キャンセル・返金特約</span>
        <span className="md:col-span-2 text-neutral-900 font-medium leading-relaxed">
          デジタルコンテンツおよびシステム開通・照合サービスの性質上、お支払い完了後のキャンセルおよび返金・換金には原則として一切応じられません。<br />
          ※公的本人確認（eKYC）審査で不合格となった場合は、自動的に仮売上の全額取消・返金が行われます。<br />
          ※システムの障害等により正常にサービスが提供されなかった場合は、個別確認のうえ速やかに再提供または全額返金処理を行います。<br />
          ※運用上の都合等により将来的に本サービスが終了となった場合であっても、過去に支払われた各種利用手数料およびサポーター寄付金の返金には応じられませんのであらかじめご了承ください。
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2">
        <span className="font-bold text-neutral-800">推奨動作環境</span>
        <span className="md:col-span-2 text-neutral-900 font-medium">
          スマートフォン・タブレット・PCにおけるモダンブラウザ最新版（Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox）
        </span>
      </div>
    </div>
    <div className="pt-4 border-t border-brand-border/60 text-right text-[11px] text-neutral-500 font-mono space-y-1">
      <div>制定日・施行日：2026年8月15日（本番サービス運用開始日）</div>
      <div>最終改定日：2026年8月16日</div>
    </div>
  </div>
);

export const CompanyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-black">
    <BackToHomeButton />
    <div className="glass-card p-8 md:p-16 text-black font-sans">
      <PageHeader
        icon={<Building2 size={24} className="text-slate-600" />}
        iconBoxClassName="bg-slate-100 text-slate-600 border border-slate-200"
        category="Company & Legal"
        title="特定商取引法に基づく表記 ＆ 運営主体"
        description="特定商取引法に基づく販売者情報、運営組織および連絡先情報です。"
      />
      <CompanyContent />
    </div>
  </div>
);

export const PricingPage = () => {
  const { user, updateUser } = useAuth();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12 font-sans text-slate-800 animate-in fade-in duration-300">
      <BackToHomeButton />

      <div className="glass-card p-6 md:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-10">
        {/* 共通の PageHeader */}
        <PageHeader
          icon={<CreditCard size={26} className="text-emerald-700" />}
          iconBoxClassName="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
          category="Service Pricing"
          title="利用料金表"
          description="ReMEETsは、月額会費や自動更新が一切発生しない「完全買い切り・透明安心モデル」です。基本機能はずっと0円、必要なときだけ都度ご利用いただけます。"
        />

        {/* ① 差出人と受取人のご利用料金 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Coins size={20} className="text-indigo-600" />
              <h2 className="text-base md:text-lg font-serif font-bold text-slate-900">
                差出人と受取人のご利用料金
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-sans hidden sm:inline">基本0円・開封時のみ都度決済</span>
          </div>

          {/* 差出人＆受取人カード（PC: 2カラム / スマホ: 1カラム） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
            {/* 差出人カード */}
            <div className="p-5 bg-gradient-to-b from-emerald-50/90 via-emerald-50/40 to-white rounded-3xl border border-emerald-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-emerald-200/80 pb-3 gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">送</span>
                    <div>
                      <h3 className="font-bold text-emerald-950 text-sm leading-snug">差出人</h3>
                      <span className="text-[11px] text-emerald-700/90 font-medium block">（メッセージを届ける側）</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-0.5 text-emerald-800">
                      <span className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">0</span>
                      <span className="text-xs sm:text-sm font-bold">円</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/90 px-2 py-0.5 rounded-full mt-0.5">
                      基本完全無料
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 text-slate-700 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>会員登録・ログイン：</strong>0 円（LINE/Google連携）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ボトルメールの投函：</strong>0 円（何通でも無制限）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>お返事の受信・直接の連絡：</strong>0 円</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>公的本人確認eKYC（任意）：</strong>600 円（返信率UP）</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-emerald-100 text-[11px] text-slate-500">
                ※ 投函から再会後のやり取りまで、追加料金は一切かかりません。
              </div>
            </div>

            {/* 受取人カード */}
            <div className="p-5 bg-gradient-to-b from-indigo-50/90 via-indigo-50/40 to-white rounded-3xl border border-indigo-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-indigo-200/80 pb-3 gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">受</span>
                    <div>
                      <h3 className="font-bold text-indigo-950 text-sm leading-snug">受取人</h3>
                      <span className="text-[11px] text-indigo-700/90 font-medium block">（メッセージを開封する側）</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-0.5 text-indigo-950">
                      <span className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">600</span>
                      <span className="text-xs sm:text-sm font-bold">円</span>
                    </div>
                    <span className="text-[10px] text-indigo-800 font-bold bg-indigo-100/90 px-2 py-0.5 rounded-full mt-0.5">
                      開封時のみ / 税込
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 text-slate-700 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>会員登録・メッセージ検索・クイズ回答：</strong>0 円</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CreditCard size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>メッセージ開封・連絡先開示：</strong>600 円（正解時のみ都度精算）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>公的本人確認eKYC（任意）：</strong>600 円（安心保証付）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>メッセージ開封後の直接やり取り：</strong>0 円</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-indigo-100 text-[11px] text-slate-500">
                ※ クイズ正解後のメッセージ開封時のみ発生する完全買い切り価格です。
              </div>
            </div>
          </div>
        </div>

        {/* ② 公的本人確認 (eKYC) について */}
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-white rounded-3xl border border-amber-200 shadow-2xs space-y-4 font-sans">
            {/* ヘッダー部分 */}
            <div className="flex items-start justify-between border-b border-amber-200/80 pb-3 gap-2">
              <div className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">証</span>
                <div>
                  <h3 className="font-bold text-amber-950 text-sm leading-snug">公的本人確認</h3>
                  <span className="text-[11px] text-amber-700/90 font-medium block">（eKYC手続き）</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-baseline gap-0.5 text-amber-950">
                  <span className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight">600</span>
                  <span className="text-xs sm:text-sm font-bold">円</span>
                </div>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-100/90 px-2 py-0.5 rounded-full mt-0.5">
                  希望時のみ / 税込
                </span>
              </div>
            </div>

            {/* 本文説明 */}
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              公的本人確認（eKYC）は、運転免許証やマイナンバーカード等を用いた安全な身元確認手続きです。基本利用はLINE/Google認証（0円）で可能ですが、差出人・受取人どちらも希望時のみ本人確認（1回600円）を行っていただけます。
            </p>

            {/* 差出人・受取人の詳細2枠 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white/90 rounded-2xl border border-amber-100 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 block text-xs">✉️ 差出人が受ける場合</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  メッセージの投函時やマイページでいつでも実施可能。プロフィールに「🛡️ 公的本人確認済」バッジが付与され、お相手がメッセージを見つけた際の信頼感と返信率が大幅に向上します。
                </p>
              </div>
              <div className="p-3 bg-white/90 rounded-2xl border border-amber-100 space-y-1 shadow-2xs">
                <span className="font-bold text-slate-900 block text-xs">🔍 受取人が受ける場合</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  メッセージ開封時（開封600円＋eKYC600円＝計1,200円）や、事前・事後にいつでも選択可能。安心・安全な身元確認を行ってお相手と連絡を取り合えます。
                </p>
              </div>
            </div>

            {/* 3つの特徴 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 border-t border-amber-100/80">
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 space-y-0.5 shadow-2xs">
                <span className="font-bold text-slate-900 block text-[11.5px] flex items-center gap-1">
                  <span>🛡️</span> 信頼マークの付与
                </span>
                <p className="text-slate-500 leading-relaxed text-[10.5px]">
                  公的身分証の確認で「🛡️ 公的本人確認済」マークが点灯します。
                </p>
              </div>
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 space-y-0.5 shadow-2xs">
                <span className="font-bold text-slate-900 block text-[11.5px] flex items-center gap-1">
                  <span>✨</span> 返信率の大幅向上
                </span>
                <p className="text-slate-500 leading-relaxed text-[10.5px]">
                  実在の本人である安心を届け、再会の成功率を格段に高めます。
                </p>
              </div>
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 space-y-0.5 shadow-2xs">
                <span className="font-bold text-slate-900 block text-[11.5px] flex items-center gap-1">
                  <span>🔄</span> 100%全額即時返金
                </span>
                <p className="text-slate-500 leading-relaxed text-[10.5px]">
                  審査不備や不承認時はStripe仮売上より即座に全額自動返金されます。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ③ サポーター応援寄付（任意・ヘッダーと統一感のあるオーシャンブルーデザイン） */}
        <div id="supporter-donation" className="p-6 md:p-8 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-amber-50/60 rounded-3xl border border-amber-200/90 space-y-4 scroll-mt-24 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-amber-200/60 pb-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-xl shrink-0 shadow-2xs">
              <Coffee size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-850 uppercase tracking-widest block font-sans">
                Optional Supporter
              </span>
              <h3 className="text-base md:text-lg font-bold font-serif text-slate-900">
                ReMEETsの運営を応援する（選択式寄付）
              </h3>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans">
            <div className="space-y-0.5 max-w-xl">
              <p className="text-slate-700 leading-relaxed text-[11.5px]">
                ReMEETsは、すべての方が無料でメッセージを流せるよう、個人運営とAI安全監査費を温かい寄付で支えていただいています。コーヒー1杯分（500円〜）から応援いただけます。
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                ※ 月額自動課金なし・1回限りの都度決済（寄付金控除対象外）
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/supporter"
                className="py-2.5 px-5 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-800 hover:from-amber-600 hover:via-orange-700 hover:to-amber-900 text-white font-bold text-xs rounded-xl shadow-xs shadow-amber-950/20 hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-400/40"
              >
                <BookOpen size={14} />
                <span>📖 サポーター寄付の趣旨・詳細を見る</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export const SafetyPage = () => (
  <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 text-black font-sans animate-in fade-in duration-300">
    <BackToHomeButton />
    <div className="glass-card p-6 sm:p-8 md:p-14 space-y-10 bg-white rounded-3xl border border-brand-border shadow-sm relative overflow-hidden">
      {/* ページヘッダー */}
      <div className="flex items-center gap-4 border-b border-brand-border/60 pb-6 relative z-10">
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
          <p className="text-xs md:text-sm text-brand-dark/70 font-sans leading-relaxed mt-1 [text-wrap:pretty]">
            安心・安全に大切な人と繋がれるよう、厳格なセキュリティと安全対策を導入しています。
          </p>
        </div>
      </div>

      {/* コピー */}
      <div className="relative z-10 py-2 sm:py-3">
        <p className="text-xs sm:text-sm md:text-[15px] font-serif font-bold text-slate-900 leading-relaxed md:leading-loose tracking-wide">
          私たちは、一般的なマッチングアプリやSNSなどの<span className="font-extrabold text-black border-b-2 border-emerald-500/80 pb-0.5">「面識のない異性に無差別な偶然の出会いを提供するサービス」</span>が抱える、ストーキング、なりすまし、未成年売春、特殊詐欺といった犯罪の温床となるリスク構造を極限まで排除しています。
        </p>
      </div>

      {/* 6大セキュリティ体系（イラストの下端より下に独立配置） */}
      <section className="space-y-8 pt-6 border-t border-brand-border/80 relative z-10">
        <div className="flex items-center justify-between border-b border-brand-border pb-3 flex-wrap gap-2">
          <h2 className="text-lg md:text-xl font-serif font-bold flex items-center gap-2 text-black">
            <ShieldCheck size={22} className="text-emerald-600" />
            <span>ReMEETsの安心・安全を守る 6大セキュリティ体系</span>
          </h2>
          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
            多層防御システム稼働中
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. 共有記憶クイズ認証 ＆ 5回誤答ロック */}
            <div className="p-5 md:p-6 rounded-2xl border border-brand-border bg-slate-50/90 backdrop-blur-xs space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-2xs">1</span>
                  <h3 className="font-serif font-bold text-sm text-slate-900">共有記憶クイズ ＆ 5回誤答ロック</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  当事者しか知り得ない「二人の共通の思い出」に関する質問に完全正解しない限り、メッセージは一切開封されません。当てずっぽうの推測やスクリプトによる総当たり攻撃（ブルートフォース）を自動検知し、5回連続の誤答で即座にアクセスを安全ロックします。
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <span>✓ 第三者の無差別接触・推測を完全遮断</span>
              </div>
            </div>

            {/* 2. 公的本人確認（eKYC）＆ 18歳以上厳格年齢認証 */}
            <div className="p-5 md:p-6 rounded-2xl border border-brand-border bg-slate-50/90 backdrop-blur-xs space-y-3 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-2xs">2</span>
                  <h3 className="font-serif font-bold text-sm text-slate-900">公的eKYC ＆ 18歳以上厳格認証</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  運転免許証・マイナンバーカード等による「公的証明バッジ」制度を導入。また、アカウント登録時の生年月日判定により18歳未満（高校生を含む）の登録を自動排除し、青少年の保護と安心できる大人同士の真摯な再会空間を維持します。
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-indigo-800 font-bold flex items-center gap-1">
                <span>✓ 青少年保護 ＆ 公的身元確認バッジ</span>
              </div>
            </div>

            {/* 3. Gemini AI ＆ リアルタイムNGフィルター二重監視 */}
            <div className="p-5 md:p-6 rounded-2xl border border-brand-border bg-slate-50/90 backdrop-blur-xs space-y-3 flex flex-col justify-between hover:border-rose-300 transition-all shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-rose-600 text-white rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-2xs">3</span>
                  <h3 className="font-serif font-bold text-sm text-slate-900">Gemini AI ＆ NGフィルター監視</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  270語以上の悪質単語辞書による即時検閲に加え、Google Gemini AIが文章に流れる「執拗な感情・ストーキング・脅迫・リベンジポルノ」の文脈をリアルタイム解析。高リスクと判定された投稿は自動的にステルス隔離され、被害を未然に防止します。
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-rose-800 font-bold flex items-center gap-1">
                <span>✓ ストーキング・誹謗中傷の自律隔離</span>
              </div>
            </div>

            {/* 4. クレジットカード決済による身元保証 ＆ セキュア・ブリッジ */}
            <div className="p-5 md:p-6 rounded-2xl border border-brand-border bg-slate-50/90 backdrop-blur-xs space-y-3 flex flex-col justify-between hover:border-teal-300 transition-all shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-teal-700 text-white rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-2xs">4</span>
                  <h3 className="font-serif font-bold text-sm text-slate-900">クレカ身元保証 ＆ セキュア開示</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  メッセージ開封時にStripe暗号化決済（600円）を経由することで、カード会社側の本人照合により架空人物やいたずら開封を強固に排除。アプリ内に無駄なチャットを残さず、想い出照合後に直通連絡先を安全に引き渡してプラットフォームが完結します。
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-teal-850 font-bold flex items-center gap-1">
                <span>✓ 架空人物排除 ＆ トラブル無用で完結</span>
              </div>
            </div>

            {/* 5. 個人情報の自動伏字化 ＆ 差出人のプライバシー保護 */}
            <div className="p-5 md:p-6 rounded-2xl border border-brand-border bg-slate-50/90 backdrop-blur-xs space-y-3 flex flex-col justify-between hover:border-amber-300 transition-all shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-amber-600 text-white rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-2xs">5</span>
                  <h3 className="font-serif font-bold text-sm text-slate-900">個人情報マスキング ＆ プライバシー</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  メッセージ本文などの全体公開エリアでは、電話番号やSNS ID、住所などの連絡先投稿を自動で伏字化（マスキング）。差出人ご自身の本名や個人情報は第三者に晒されず、クイズに正解した正規のお相手のみに安全に開示される非公開制御を徹底しています。
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-amber-900 font-bold flex items-center gap-1">
                <span>✓ ネット上の晒し・情報漏洩を100%防止</span>
              </div>
            </div>

            {/* 6. 暗号化監査ログ保全 ＆ 警察捜査への迅速な協力体制 */}
            <div className="p-5 md:p-6 rounded-2xl border border-brand-border bg-slate-50/90 backdrop-blur-xs space-y-3 flex flex-col justify-between hover:border-slate-400 transition-all shadow-2xs">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-slate-800 text-white rounded-xl flex items-center justify-center text-xs font-bold font-mono shadow-2xs">6</span>
                  <h3 className="font-serif font-bold text-sm text-slate-900">暗号化ログ保全 ＆ 捜査関係照会対応</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  悪質な付きまといや嫌がらせ等の不正利用に備え、接続IP・端末識別子・電子的利用宣誓ログを高度暗号化して物理保全。各都道府県警察（生活安全課・サイバー犯罪対策課等）からの刑事訴訟法に基づく正式な捜査照会に対し、迅速かつ厳正にデータを提供する体制を整えています。
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-800 font-bold flex items-center gap-1">
                <span>✓ 刑事訴訟法に基づく捜査照会即応体制</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3.5 bg-white rounded-2xl p-6 sm:p-8 border-[3px] border-slate-400 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={22} className="text-slate-700 shrink-0" />
            <h3 className="text-base font-serif font-bold text-slate-900">警察・法執行機関の捜査照会に対する迅速な協力体制</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            万が一、利用を仮装した悪質なストーキング行為、嫌がらせ、なりすまし等の犯罪行為が発生した場合、各都道府県警察（生活安全課、サイバー犯罪対策課等）や裁判所からの刑事訴訟法に基づく捜査関係事項照会に対し、迅速かつ厳正にデータ開示を行います。
            正式な照会書類を受理後、電子的利用宣誓ログ・接続端末IPアドレス・アクセス履歴をフォレンジック抽出して捜査機関へ提供し、事件の早期解決および被害者保護・犯罪撲滅に全面的に協力いたします。
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
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [ticketToken, setTicketToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const deletionReasons = [
    { value: "自分の個人情報が掲載されている（本名・旧姓・あだ名・勤務先等）", label: "🪪 自分の個人情報が掲載されている（本名・旧姓・あだ名等）" },
    { value: "差出人に心当たりがなく不安・削除してほしい（オプトアウト）", label: "⚠️ 差出人に心当たりがなく不安・削除してほしい（オプトアウト）" },
    { value: "ストーカー・一方的な付きまとい・威迫の懸念がある", label: "🚨 ストーカー・一方的な付きまとい・威迫の懸念がある（最優先審査）" },
    { value: "誹謗中傷・プライバシー侵害・不快な内容が含まれる", label: "🛑 誹謗中傷・プライバシー侵害・不快な内容が含まれる" },
    { value: "投稿者本人によるボトルの取り下げ・完全削除希望", label: "📝 投稿者本人によるボトルの取り下げ・完全削除希望" },
    { value: "誤った情報の記載・誤認投稿", label: "🔄 誤った情報の記載・誤認投稿" },
    { value: "肖像権・写真・画像の無断掲載", label: "🔒 肖像権・写真・画像の無断掲載" },
    { value: "その他安全上の理由", label: "❓ その他安全上の理由" }
  ];

  // 対象メッセージの情報を自動取得（ID変更時）
  useEffect(() => {
    const targetIdToFetch = postId ? postId.trim() : queryPostId;
    if (targetIdToFetch && /^\d+$/.test(targetIdToFetch)) {
      setLoadingPost(true);
      fetch(`/api/posts/${targetIdToFetch}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.id) {
            setTargetPost(data);
            if (!content) {
              const summary = `【宛先】${data.target_name || ''} 様 / 【年代】${data.era || ''}年代 / 【地域】${data.target_hometown || '非公開'} / 【メッセージ抜粋】${data.searcher_profile || ''}`;
              setContent(summary);
            }
            if (!url) {
              setUrl(window.location.origin ? `${window.location.origin}/posts/${data.id}` : `https://remeets.jp/posts/${data.id}`);
            }
          } else {
            setTargetPost(null);
          }
        })
        .catch(err => {
          console.error('Failed to fetch post details for deletion request:', err);
          setTargetPost(null);
        })
        .finally(() => setLoadingPost(false));
    } else {
      setTargetPost(null);
    }
  }, [postId, queryPostId]);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.nickname || user.username || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  const handleCopyTicket = () => {
    if (!ticketToken) return;
    navigator.clipboard.writeText(ticketToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!postId || !reason || !content) {
      setErrorMsg('必須項目（メッセージID、申請理由、掲載内容・特徴）をご入力ください。');
      return;
    }

    if (!agreedToPrivacy) {
      setErrorMsg('個人情報の取り扱いへの同意をお願いいたします。');
      return;
    }

    setStatus('submitting');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/deletion-requests', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          post_id: parseInt(postId),
          name: name || (user?.nickname || user?.username || '匿名申請者'),
          url: url || `https://remeets.jp/posts/${postId}`,
          content: content,
          reason: reason,
          explanation: explanation,
          email: email || (user?.email || '')
        })
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || '削除申請の送信に失敗しました。');
      }

      setTicketToken(body.ticket_token || '');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'エラーが発生しました。時間をおいて再度お試しください。');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-12 text-black font-sans">
      <BackToHomeButton />
      
      {/* 🏛️ Standard Unified Glass Card */}
      <div className="glass-card p-6 sm:p-8 md:p-12 space-y-8 bg-white rounded-3xl border border-brand-border shadow-sm">
        {/* 🌟 Unified PageHeader */}
        <PageHeader
          icon={<Trash2 size={26} className="text-rose-600" />}
          iconBoxClassName="bg-rose-50 text-rose-600 border border-rose-200"
          category="Deletion & Privacy Protection"
          title="メッセージ（ボトルメール）の削除・掲載停止依頼"
          description="ご自身の個人情報が掲載されている場合や、差出人に心当たりがないメッセージについて、24時間体制で迅速に非公開・完全削除の申請を受理いたします。"
        />

        {/* 🔒 24時間体制・オプトアウト保障バッジ */}
        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2.5 text-rose-950 font-sans">
            <ShieldCheck size={18} className="text-rose-600 shrink-0" />
            <span>
              <strong>プライバシー保護体制：</strong>申請を受理後、運営事務局にて原則 <strong className="text-rose-700">24時間以内</strong> に掲載停止・物理削除処置を実施いたします。
            </span>
          </div>
          <span className="px-3 py-1 bg-white text-rose-800 font-bold rounded-xl border border-rose-300 shrink-0 text-xs shadow-2xs font-sans">
            24時間受付中
          </span>
        </div>

        {/* 対象メッセージの自動検知プレビューカード */}
        {targetPost && (
          <div className="bg-gradient-to-r from-teal-50/80 to-slate-50 border-2 border-teal-200/90 rounded-2xl p-4 md:p-5 space-y-2 text-left animate-fadeIn shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-teal-150 pb-2">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5 font-sans">
                <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                <span>対象のメッセージ情報（自動照会完了）</span>
              </span>
              <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                メッセージID: #{targetPost.id}
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
            className="flex flex-col items-center justify-center p-6 sm:p-10 bg-emerald-50/80 rounded-3xl border border-emerald-200 space-y-5 text-center text-black"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase font-sans">
                Deletion Request Received
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-emerald-950">
                メッセージの削除申請を受理いたしました
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800/90 max-w-lg leading-relaxed font-sans mx-auto">
                対象メッセージ<strong>「メッセージID: #{postId}」</strong>に関する削除・非公開申請を正常に受け付けました。<br />
                運営事務局にて内容を確認後、速やかに掲載停止・削除処置を実施いたします。処置完了のご案内はご登録のメールアドレス宛てにお知らせいたします。
              </p>
            </div>

            {/* 🎟️ Ticket Token Display */}
            {ticketToken && (
              <div className="p-4 bg-white rounded-2xl border border-emerald-200/90 max-w-md mx-auto space-y-1.5 shadow-2xs w-full">
                <span className="text-[11px] font-bold text-slate-500 font-sans block">
                  削除申請受付番号（チケットID）
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-slate-900 tracking-wider">
                    {ticketToken}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    title="受付番号をコピー"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] text-emerald-600 font-bold font-sans animate-fade-in">
                    ✓ 受付番号をクリップボードにコピーしました
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/')} 
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer font-sans"
              >
                トップページへ戻る
              </button>
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all font-sans"
              >
                お問い合わせ窓口へ
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 対象メッセージID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between font-sans">
                  <span>対象メッセージのID（必須）</span>
                  {postId && targetPost && (
                    <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      ✓ メッセージ照会成功
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    required
                    placeholder="例: 42"
                    value={postId}
                    onChange={e => setPostId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-zinc-50/50 text-xs md:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all"
                  />
                  {loadingPost && (
                    <span className="absolute right-3 top-3.5 text-[10px] text-teal-600 animate-pulse font-sans font-bold">
                      情報照会中...
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  ※メッセージ詳細画面から遷移された場合は自動で入力されています。
                </p>
              </div>
              
              {/* 申請理由 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between font-sans">
                  <span>申請理由（必須）</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">必須</span>
                </label>
                <div className="relative">
                  <select 
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-zinc-50/50 text-xs md:text-sm text-slate-900 font-sans focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all appearance-none pr-10 cursor-pointer"
                  >
                    <option value="" disabled>削除理由を選択してください</option>
                    {deletionReasons.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 対象メッセージの掲載内容・特徴 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between font-sans">
                <span>対象メッセージの掲載内容・特徴（必須）</span>
                {content && <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">✓ 自動入力済み</span>}
              </label>
              <textarea 
                required
                rows={3}
                placeholder="宛先名、年代、本文の特徴など。メッセージID入力時に自動取得されます。"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-zinc-50/50 text-xs md:text-sm text-slate-900 font-sans focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all leading-relaxed resize-none placeholder:text-slate-400"
              />
            </div>

            {/* 詳細なご事情・オプトアウトのご要望 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between font-sans">
                <span>詳細なご事情・オプトアウトのご要望（任意）</span>
                <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold">任意</span>
              </label>
              <textarea 
                rows={3}
                placeholder="「自分の旧姓と出身中学校が書かれており削除を希望する」「心当たりがないため取り下げてほしい」など、詳しいご事情があればご記入ください。"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-zinc-50/50 text-xs md:text-sm text-slate-900 font-sans focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all leading-relaxed resize-none placeholder:text-slate-400"
              />
            </div>

            {/* 連絡先情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block font-sans">
                  ご連絡用お名前（ニックネーム可）
                </label>
                <input 
                  type="text"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-zinc-50/50 text-xs md:text-sm text-slate-900 font-sans focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between font-sans">
                  <span>ご連絡用メールアドレス（処置完了通知用）</span>
                  <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">必須</span>
                </label>
                <input 
                  type="email"
                  required
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-zinc-50/50 text-xs md:text-sm text-slate-900 font-sans focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 🛡️ 警察・緊急時のセーフティ注記 */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed font-sans">
              <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950 mb-0.5 text-[11px]">⚠️ 緊急時・身の危険を感じる場合のご案内</strong>
                <p className="m-0 text-amber-900/90 text-[11px] leading-relaxed">
                  脅迫、ストーカー、重大な犯罪被害など身の危険を感じる場合は、本申請フォームと並行して、直ちに最寄りの警察署（生活安全課）または警察相談専用電話「#9110」へご連絡ください。当サービスでは警察・捜査機関からの公的な照会に迅速に協力いたします。
                </p>
              </div>
            </div>

            {/* プライバシーポリシー同意チェック */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-700 font-sans leading-relaxed">
                <input 
                  type="checkbox"
                  required
                  checked={agreedToPrivacy}
                  onChange={e => setAgreedToPrivacy(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-600 h-4 w-4 shrink-0 cursor-pointer"
                />
                <span>
                  当サービスの <Link to="/privacy" target="_blank" className="text-rose-700 font-bold underline hover:text-rose-800">プライバシーポリシー</Link>（個人情報の取り扱い）を確認し、同意の上で削除申請を送信します。
                </span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs md:text-sm font-sans">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={status === 'submitting' || !agreedToPrivacy} 
                className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-2xl text-xs md:text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md font-sans"
              >
                {status === 'submitting' ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>申請を送信中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>メッセージの削除申請を安全に送信する</span>
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

