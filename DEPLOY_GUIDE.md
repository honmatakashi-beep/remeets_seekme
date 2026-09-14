# 🚀 ReMEETs（再会のボトルメール）本番デプロイ＆運用開始マニュアル

本ドキュメントは、ReMEETsを本番環境（クラウドサーバー・マネージドDB）へデプロイし、安全に商用運用を開始するための公式手順書です。

---

## 📋 1. デプロイ前準備（環境変数の設定）

サーバー（Cloud Run / Render / VPS 等）の環境変数に、[`.env.example`](.env.example) を参考に以下の変数を設定します。

| 環境変数名 | 説明 | 取得先・形式 |
|:---|:---|:---|
| `PORT` | サーバー待受ポート（デフォルト: `3000`） | 任意 |
| `NODE_ENV` | 実行環境（`production`） | 固定値 |
| `APP_URL` | 本番公開ドメイン（例: `https://remeets.jp`） | 独自ドメイン |
| `JWT_SECRET` | 認証トークン署名用シークレットキー | 64文字以上のランダム文字列 |
| `DATABASE_URL` | 本番PostgreSQL接続URL（Cloud SQL / Supabase） | `postgresql://...` |
| `GEMINI_API_KEY` | Google Gemini AI 検閲・モデレーション用APIキー | Google AI Studio |
| `STRIPE_SECRET_KEY` | Stripe本番秘密鍵 | Stripe Dashboard (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook署名シークレット | Stripe Webhook (`whsec_...`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe公開可能鍵 | Stripe Dashboard (`pk_live_...`) |
| `RESEND_API_KEY` | メール配信APIキー | Resend Dashboard (`re_...`) |
| `LINE_CHANNEL_ID` | LINE Login チャネルID | LINE Developers Console |
| `LINE_CHANNEL_SECRET` | LINE Login チャネルシークレット | LINE Developers Console |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth クライアントシークレット | Google Cloud Console |

---

## 🐳 2. コンテナビルド＆デプロイ手順

### A. Docker / Cloud Run でデプロイする場合（推奨）
```bash
# 1. コンテナイメージのビルド
docker build -t remeets-app:latest .

# 2. ローカルまたはステージングでの動作確認
docker run -p 3000:3000 --env-file .env remeets-app:latest

# 3. Google Cloud Run へのワンライナーデプロイ
gcloud run deploy remeets-prod \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

### B. Node.js サーバー直接デプロイの場合
```bash
# 1. 依存関係インストール & ビルド
npm ci
npm run build

# 2. 統合テストの実行（全41項目検証）
npm test

# 3. プロダクションサーバー起動
npm start
```

---

## 🎯 3. 本番ローンチ初日の運用開始手順

本番サーバー起動後、管理者アカウントでログインし、以下の手順を実施します。

1. **管理者ダッシュボードへのログイン**:
   - URL: `https://your-domain.com/admin`
   - 初期アカウント: `admin` / パスワード初期設定
2. **開発用テストデータのクリーンアップ**:
   - 管理画面「危険ゾーン / システム管理」より「テストデータ初期化」を実行。
3. **情緒豊かな初期サンプルボトルメール（50件〜300件）の展開**:
   - 管理画面より「本番用初期サンプルデータ自動Seeding」を実行し、全国・各年代の想い出のメッセージを自動配置。
4. **Stripe 本番決済 ＆ Webhook 疎通確認**:
   - 実際にテストユーザーでメッセージ開封・eKYC決済（600円 / 1,200円）を行い、売上台帳および通知がリアルタイムに更新されるか確認。

---

## 🚔 4. 緊急時・警察捜査照会時の対応手順

刑事訴訟法第197条第2項に基づく「捜査関係事項照会書」を警察署・サイバー犯罪対策課から受領した際の手順です。

1. 管理者ダッシュボード（`/admin`）の「ユーザー管理」または「法執行・捜査照会」を開く。
2. 対象ユーザーのIDまたはユーザー名を入力。
3. **「警察照会用データ出力（PDF/JSON）」ボタン**をクリック。
4. 自動生成される以下の法執行提出用ログ一式を印刷またはセキュア提出：
   - 氏名・公的eKYC承認履歴
   - 登録メールアドレス / SNS連携UID
   - 投函メッセージ履歴・秘密のクイズ内容
   - 送受信メッセージ全文
   - アクセスIP・タイムスタンプ・User Agent

---

## 🧪 5. 定期セキュリティ保守コマンド

日々のメンテナンスや機能追加時は、以下のコマンドで安全性を検証してください。

```bash
# 全41項目のセキュリティ＆E2E自動テストを一括実行
npm test

# 型チェック
npm run lint

# プロダクションビルド検証
npm run build
```
