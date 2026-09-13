import React from 'react';
import {
  Shield, Activity, Bot, Mail, CreditCard, Server, Award, Palette
} from 'lucide-react';

export interface ManualSection {
  id: string;
  title: string;
  description: string;
  badge?: string;
  categoryTitle?: string;
}

export interface ManualCategory {
  id: string;
  categoryTitle: string;
  icon: any;
  sections: ManualSection[];
}

export const MANUAL_CATEGORIES: ManualCategory[] = [
  {
    id: 'cat-1',
    categoryTitle: '1. 基礎・ガバナンス・法令遵守',
    icon: Shield,
    sections: [
      { id: '1-1', title: '1-1. 管理者責任と個人情報保護の基本原則', description: '通信の秘密・覗き見厳禁・個人情報ゼロ保持モデル', badge: '最重要' },
      { id: '1-2', title: '1-2. 役職ロール・権限管理 (RBAC 4階層)', description: 'Owner/Admin/Auditor/Moderatorの権限分離と任命手順' },
      { id: '1-3', title: '1-3. 連絡先開示モデルと法的建付け', description: '連絡先安全引き渡し完結モデルと異性紹介事業非該当の法的理由' }
    ]
  },
  {
    id: 'cat-2',
    categoryTitle: '2. 日常業務・コンテンツ管理',
    icon: Activity,
    sections: [
      { id: '2-1', title: '2-1. ダッシュボードKPI監視と日次ルーティン', description: 'MAU/投関数/クイズ正解率/決済数の監視と判断基準' },
      { id: '2-2', title: '2-2. 漂流ボトルメールの編集と証跡削除', description: '誤字救済編集と削除アーカイブへの理由別物理保全' },
      { id: '2-3', title: '2-3. 奇跡の物語 (Success Stories) 掲載管理', description: '感動的な再会実例の審査・編集・公開トグル' }
    ]
  },
  {
    id: 'cat-3',
    categoryTitle: '3. AI安全防衛・セキュリティ',
    icon: Bot,
    sections: [
      { id: '3-1', title: '3-1. Gemini 2.5 Flash リアルタイム文脈検閲', description: 'ストーカー・怨恨・個人情報の自律判定と自動隔離' },
      { id: '3-2', title: '3-2. 安全防衛シミュレーター (50選大図鑑)', description: 'AI判定挙動のテスト検証とスコア確認' },
      { id: '3-3', title: '3-3. ユーザー通報キュー審査とNGワード辞書', description: '通報トリアージ・アカウント即時凍結・NG辞書運用' }
    ]
  },
  {
    id: 'cat-4',
    categoryTitle: '4. ユーザー対応・配信',
    icon: Mail,
    sections: [
      { id: '4-1', title: '4-1. お問い合わせSLAと緊急度別トリアージ', description: '未対応/保留/完了管理とAI自動優先度判定' },
      { id: '4-2', title: '4-2. 送信メールテンプレート管理 (全8種)', description: '通知メール文面のプレビューとテスト送信手順' },
      { id: '4-3', title: '4-3. 全体一括プッシュ通知配信と誤送信防止', description: '規約改定・防犯啓発の全体ブロードキャスト' }
    ]
  },
  {
    id: 'cat-5',
    categoryTitle: '5. 決済・eKYC・収益試算',
    icon: CreditCard,
    sections: [
      { id: '5-1', title: '5-1. 決済トランザクション台帳とワンクリック返金', description: 'Stripe入出金一覧・手動返金実行・CSV出力' },
      { id: '5-2', title: '5-2. 売上・原価・粗利アナリティクス (+366円/件)', description: 'Stripe/SMS/eKYC原価控除後の純利益モデル' },
      { id: '5-3', title: '5-3. eKYC身元確認ログと非保持ルール', description: 'TRUSTDOCK連携・身分証画像非保持・監査証跡' },
      { id: '5-4', title: '5-4. Stripe Sandbox 模擬決済・返金テスト', description: '管理画面からのテスト決済発行とWebhook疎通確認' },
      { id: '5-5', title: '5-5. 課金モデル収益シミュレーター運用', description: '損益分岐点(BEP)・4大成長フェーズ・パラメータ調整' }
    ]
  },
  {
    id: 'cat-6',
    categoryTitle: '6. システム管理・インフラ診断',
    icon: Server,
    sections: [
      { id: '6-1', title: '6-1. 動的APIレート制限スライダー調整', description: 'Auth/Post/Search秒間上限のリアルタイム調整とDoS遮断' },
      { id: '6-2', title: '6-2. DB健康診断 (VACUUM/PRAGMA/最適化)', description: '断片化測定・インデックス再構築・実行タイミング' },
      { id: '6-3', title: '6-3. 不正アクセス監視・悪質IP遮断・監査ログ', description: '401/403/429ログ監視とIPブラックリスト登録' },
      { id: '6-4', title: '6-4. バージョン履歴 (Semantic Versioning)', description: 'Gitコミット連動の変更履歴追跡とデプロイ管理' }
    ]
  },
  {
    id: 'cat-7',
    categoryTitle: '7. M&A企業価値・マスター備忘録',
    icon: Award,
    sections: [
      { id: '7-1', title: '7-1. M&A企業価値評価 (DCF/EBITDAマルチプル)', description: 'デュアル算定エンジン・知的財産目録・IM出力' },
      { id: '7-2', title: '7-2. 17大本番デプロイマスターチェックリスト', description: 'インフラ・DB・API・規約の公開前確認手順' },
      { id: '7-3', title: '7-3. 警察・公安照会基準マニュアル (刑訴法197条)', description: '捜査関係事項照会書受領時の開示手順と保全ログ一覧' },
      { id: '7-4', title: '7-4. 責任の所在 10大決定事項チェックリスト', description: '偽造免責・SMS不達返金・AI誤検知免責の法的合意' }
    ]
  },
  {
    id: 'cat-8',
    categoryTitle: '8. デザインシステム (UI/UX Specs)',
    icon: Palette,
    sections: [
      { id: '8-1', title: '8-1. ReMEETs 4大設計原則 (情緒と法的信頼)', description: '情緒と法的信頼・改行禁止・角丸ネスト・600円明朗' },
      { id: '8-2', title: '8-2. カラー・タイポグラフィトークン仕様', description: '16色パレット(WCAG AAA/AA)・和文黄金比・余白体系' },
      { id: '8-3', title: '8-3. UIパーツ・ボタン状態・トーストテスター', description: 'ボタン状態検証・トースト発火・四季テーマ切り替え' }
    ]
  }
];
