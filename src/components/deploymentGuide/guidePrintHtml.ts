import {
  getDeploymentGuideMD,
  getCostEstimateMD,
  getPermitQAMD,
  getPoliceSecurityDocMD,
  getPoliceConsultFlowMD,
  getRequirementsDefinitionMD,
  getSiteEvaluationReportMD,
  getPrStrategyPlanMD,
  getLegalGuidanceMD,
  getCostListDetailedMD,
  renderCustomMarkdownHtml
} from './markdownDocs';
import { POLICE_PRESENTATION_SCENARIOS } from './deploymentGuideConstants';

  const handlePrintDocument = () => {
    let titleStr = "ReMEETs 治安行政・防衛システム文書";
    let subtitleStr = "治安行政・防衛システムセキュリティ設計書（公式監査書類）";
    if (docType === 'matrix') {
      titleStr = "⑤ セキュリティ適合性監査マトリクス";
      subtitleStr = "治安・防衛コンプライアンス管理事務局（公式監査用マトリクス）";
    }
    let fontLink = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">`;

    let html = '';

    if (docType === 'matrix') {
      // Print Security Compliance Matrix (Document ⑤) Landscape A4 layout
      const matrixRows = `
        <tr>
          <td class="phase-col">① プロフィール設定</td>
          <td class="threat-col">本名フルネーム登録による個人特定危険</td>
          <td class="program-col">アカウント登録・ニックネーム設定時に、日本人の典型的な姓名辞書データベースと照合。一致度が高過ぎるフルネーム（例：漢字2字＋漢字2字等）は警告し、イニシャルやあだ名へ変更を促します。</td>
          <td class="ai-col">自己紹介文などの自由入力エリアを自動判定。「本名」「住所」「SNSハンドル」が含まれている比率をAI判定し、不具合警告。</td>
          <td class="log-col">登録時のグローバルIP・UA・登録タイミングスタンプを永続セキュリティ保存。</td>
        </tr>
        <tr>
          <td class="phase-col">② 手紙ボトル投函（基本）</td>
          <td class="threat-col">手紙内の「実名・連絡先交換」によるプラットフォーム外への誘導・ハラスメント</td>
          <td class="program-col">文字入力ボックスフックに、メール/電話Regex、LINE/インスタ等SNSアカウントの検知Regexをバインド。外部手段の直接掲載自体を仕組みから厳格に弾きます。</td>
          <td class="ai-col"><strong>【レッドアラート格納】</strong><br/>「L!NE」「L_I_N_E」などの伏字や、SNSを示唆する回避文章をGemini AIが文脈解釈。「未承認」に落とし一般漂流から1秒で完全シャット。</td>
          <td class="log-col">AIが判定したアラート文面、危険度判定ログ、ボトル投函元の会員アカウント情報を完全ログ化。</td>
        </tr>
        <tr>
          <td class="phase-col">③ 手紙ボトル投函（他人特定）</td>
          <td class="threat-col">標的のお相手以外の第三者プライバシー権利侵害・特定情報の掲載</td>
          <td class="program-col">宛先を規定の「お名前」「都道府県」「出会った当時の関係性」などの曖昧なデータに制約。具体的なアパート名、個別地番、職場名称などは入力不可。</td>
          <td class="ai-col">「想い出メッセージ」にお相手のプライバシーや実質的なストーキングに繋がる極めて狭い情報を記述していないかをAIモデレーション検知。</td>
          <td class="log-col">投函緯度経度・IP履歴などセキュリティログを自動追跡保管。</td>
        </tr>
        <tr>
          <td class="phase-col">④ 想い出クイズの設定</td>
          <td class="threat-col">クイズ文面を悪用した誹謗中傷、嫌がらせ、ネットいじめ</td>
          <td class="program-col">質問の入力ボックス内にNGワード（誹謗・性的侮辱表現など）を監視する文字バリデーションをコール。</td>
          <td class="ai-col">質問全体のセンチメント（感情強度）判定。執拗な執着、脅迫、恋愛感情の強制的な強要を発見した場合に自動的に対象ボトルの一般流出を一時停止（漂流停止）。</td>
          <td class="log-col">クイズ問題データ、設定者アカウントデータ、不承認検知履歴を管理者向け監査として完全保存。</td>
        </tr>
        <tr>
          <td class="phase-col">⑤ お相手検索行為</td>
          <td class="threat-col">第三者が宛先に対して手当たり次第に総当たり検索しストーキングを試行</td>
          <td class="program-col">一定時間に繰り返される異なる氏名、または多拠点の都道府県切り替え無差別検索動作に対してレートペナルティ（お名前検索の回数制限）を設定。</td>
          <td class="ai-col">特定のアカウントによる総当たり型のクエリ動作、不正ボットに近い高サイクルログを自動検知して管理パネル通報。</td>
          <td class="log-col">検索の監査ログ（search_logs）の完全暗号化保存（パーマリンク）。</td>
        </tr>
        <tr>
          <td class="phase-col">⑥ クイズ解答試行</td>
          <td class="threat-col">あてずっぽうなどクイズの総当たり解答による手紙の不正な解凍（個人情報リーク）</td>
          <td class="program-col">同じボトル、または同じIP/セッションから一定回数（基本は5回）連続で回答を誤った場合に、<strong>プログラム的に手紙の回答権を24時間完全にロックアウト</strong>。</td>
          <td class="ai-col">不自然な多回数失敗ボトルの検知。バーストした過剰なアタックセッションを検疫。</td>
          <td class="log-col">失敗時の試行ワード履歴、元セッション・IP情報を保存。管理者によるアカウント拒否権と連動。</td>
        </tr>
        <tr>
          <td class="phase-col">⑦ 連絡先開示（セキュアブリッジ）</td>
          <td class="threat-col">なりすまし突破成功後のストーカー・嫌がらせ接触、事件化</td>
          <td class="program-col">連絡先開示前に、<strong>18歳以上（高校生を除く）</strong>、<strong>ストーカーや無断面識を目的としない安全第一の利用宣誓</strong>への電子的合意を必須化。</td>
          <td class="ai-col">-</td>
          <td class="log-col">同意した電子的宣誓ログ（合意タイムスタンプ、IPアドレス、ユーザー識別子）を「証拠開示用」として管理者サーバーデータベースに高セキュリティ保全。</td>
        </tr>
      `;

      html = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <title>ReMEETs セキュリティ適合性監査マトリクス</title>
          ${fontLink}
          <style>
            @media print {
              body {
                background: #ffffff;
                color: #1a1a1a;
              }
            }
            @page {
              size: A4 landscape;
              margin: 12mm 10mm 12mm 10mm;
            }
            body {
              font-family: 'Noto Sans JP', sans-serif;
              color: #1a1a1a;
              line-height: 1.4;
              font-size: 8pt;
              background: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header {
              border-bottom: 2px solid #3B627F;
              padding-bottom: 8px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .header h1 {
              font-size: 13pt;
              margin: 0;
              color: #1a2735;
              font-weight: 700;
              font-family: 'Noto Serif JP', serif;
            }
            .header .subtitle {
              font-size: 8pt;
              color: #3B627F;
              font-weight: bold;
              margin-top: 2px;
            }
            .header .date {
              font-size: 8pt;
              color: #64748b;
              text-align: right;
            }
            .title-desc {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 7.5pt;
              color: #475569;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
            }
            th, td {
              border: 1.5px solid #3b627f;
              padding: 8px 10px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f8fafc;
              color: #3B627F;
              font-weight: bold;
              font-size: 8.5pt;
              font-family: 'Noto Serif JP', serif;
            }
            td {
              font-size: 8pt;
              line-height: 1.45;
            }
            .phase-col { font-weight: bold; color: #1f2937; width: 15%; }
            .threat-col { color: #b91c1c; width: 17%; }
            .program-col { width: 28%; }
            .ai-col { width: 22%; }
            .log-col { font-family: monospace; font-size: 7.5pt; color: #475569; width: 18%; }
            .footer {
              margin-top: 20px;
              font-size: 7.5pt;
              text-align: center;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>ReMEETs セキュリティ適合性監査マトリクス</h1>
              <div class="subtitle">治安・防衛コンプライアンス管理事務局（公式監査用マトリクス）</div>
            </div>
            <div class="date">
              出力日時: ${new Date().toLocaleString('ja-JP')}
            </div>
          </div>
          <div class="title-desc">
            本資料は犯罪抑止・セキュリティ対策に特化したSNS「ReMEETs」におけるすべての利用動線（会員登録から手紙投函、クイズゲート、メッセージ開通、事件防止まで）に対し、想定されるストーカー行為や不正アビューズ脅威をマッピング。一次プログラム防衛策と二次防衛策（Gemini AIによる評価）、および管轄警察署サイバー対策課協議用の永続フォレンジックロギング（痕跡保管）設計の監査適合性を示した全編マトリクス公式書面（A4横適合版）です。
          </div>
          <table>
            <thead>
              <tr>
                <th>防御フェーズ</th>
                <th>想定脅威（アビューズ）</th>
                <th>プログラム防衛策（バリデーション等）</th>
                <th>AIモデレーション（Gemini審査等）</th>
                <th>監査用ログ・痕跡データ (Forensic)</th>
              </tr>
            </thead>
            <tbody>
              ${matrixRows}
            </tbody>
          </table>
          <div class="footer">
            ReMEETs 治安行政・防衛システム監査監査官用ポータル &copy; 2026. All Rights Reserved.
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;
    } else {
      // Print Markdown Guidelines (Documents ①, ②, ③, ④) Portrait A4 layout
      if (docType === 'deployment') {
        titleStr = "① ReMEETs 本番デプロイガイド ＆ 運営コンプライアンス設計書";
        subtitleStr = "治安行政・防衛システムセキュリティ設計書（システム構築仕様編）";
      } else if (docType === 'cost_estimate') {
        titleStr = "①-B 本番運用コスト＆初期費用";
        subtitleStr = "持続可能な安全再会インフラのための財務コスト試算シミュレーション（運営費用見積）";
      } else if (docType === 'permit') {
        titleStr = "② ReMEETs 開業知識・官公庁届出Q＆A";
        subtitleStr = "インターネット異性紹介事業【非該当】の論理客観的証明（法務コンプライアンス編）";
      } else if (docType === 'police') {
        titleStr = "③ ReMEETs 警察署・生活安全課協議用セキュリティ報告書";
        subtitleStr = "所管警察署生活安全課・サイバー犯罪対策課事前協議用公式説明ガイド";
      } else if (docType === 'consult') {
        titleStr = "④ ReMEETs 警察署事前相談フロー";
        subtitleStr = "ストーカー規制法関連緊急時データ開示および捜査事項照会即応手続き";
      } else if (docType === 'scenario') {
        titleStr = "⑦ 警察向けプレゼンテーション公式口頭発表シナリオ";
        subtitleStr = "治安・防衛コンプライアンス適合に関する公式説明用発言原稿（スクリプト）";
      } else if (docType === 'requirements') {
        titleStr = "⑧ ReMEETs システム基本要件定義書 (System Requirements Definition Document)";
        subtitleStr = "開発・安全対策・公安コンプライアンス適合性を定義した公式システム要求仕様";
      } else if (docType === 'evaluation') {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー";
        subtitleStr = "コンセプト・デザイン・機能・安全性・今後の展望に関する総合評価報告書";
      } else if (docType === 'pr_plan') {
        titleStr = "⑩ ReMEETs 広報・マーケティング・PR立ち上げ戦略プラン";
        subtitleStr = "コンセプト・デザイン・安全性に基づいた公式広報・PRマーケティング立ち上げ戦略書";
      } else if (docType === 'legal_guide') {
        titleStr = "⑪ 主要関係法令適合性＆警察署相談ガイダンス";
        subtitleStr = "本サービスにおける法務コンプライアンス適合性と関係法令基準・警察相談実務フローの一覧解説";
      }

      html = `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="utf-8">
          <title>${titleStr}</title>
          ${fontLink}
          <style>
            @media print {
              body {
                background: #ffffff;
                color: #1a1a1a;
              }
            }
            @page {
              size: A4 portrait;
              margin: 18mm 15mm 18mm 15mm;
            }
            body {
              font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
              color: #1a1a1a;
              line-height: 1.8;
              font-size: 9.5pt;
              background: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header {
              border-bottom: 2px solid #3B627F;
              padding-bottom: 12px;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .header h1 {
              font-size: 13pt;
              margin: 0;
              color: #1a2735;
              font-weight: 700;
              font-family: 'Noto Serif JP', serif;
              line-height: 1.3;
            }
            .header .subtitle {
              font-size: 8.5pt;
              color: #3B627F;
              font-weight: bold;
              margin-top: 4px;
            }
            .header .date {
              font-size: 8.5pt;
              color: #64748b;
              text-align: right;
            }
            .title-desc {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 8.5pt;
              color: #475569;
              margin-bottom: 25px;
              line-height: 1.5;
            }
            .container {
              max-width: 100%;
            }
            .doc-h1 {
              font-size: 13pt;
              border-bottom: 2px solid #3B627F;
              padding-bottom: 8px;
              color: #1a2735;
              margin-top: 28px;
              margin-bottom: 12px;
              font-family: 'Noto Serif JP', serif;
            }
            .doc-h2 {
              font-size: 11pt;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-top: 22px;
              margin-bottom: 10px;
              color: #3B627F;
              font-family: 'Noto Serif JP', serif;
            }
            .doc-h3 {
              font-size: 10pt;
              color: #1e293b;
              margin-top: 18px;
              margin-bottom: 6px;
              font-weight: bold;
              font-family: 'Noto Sans JP', sans-serif;
            }
            .doc-p {
              margin-bottom: 12px;
              color: #334155;
              line-height: 1.8;
            }
            .doc-list {
              padding-left: 20px;
              margin-bottom: 15px;
            }
            .doc-list li {
              margin-bottom: 6px;
              list-style-type: square;
              color: #334155;
            }
            .doc-quote {
              border-left: 4px solid #3B627F;
              padding: 10px 14px;
              color: #475569;
              margin: 15px 0;
              font-style: italic;
              background: #f8fafc;
              border-radius: 0 6px 6px 0;
            }
            .doc-table {
              width: 100%;
              border-collapse: collapse;
              margin: 18px 0;
            }
            .doc-table th, .doc-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              font-size: 8.5pt;
              text-align: left;
            }
            .doc-table th {
              background: #f8fafc;
              color: #1a2735;
              font-weight: bold;
              font-family: 'Noto Serif JP', serif;
            }
            .doc-table td {
              color: #334155;
            }
            .footer {
              margin-top: 40px;
              font-size: 8pt;
              text-align: center;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${titleStr}</h1>
              <div class="subtitle">${subtitleStr}</div>
            </div>
            <div class="date">
              出力日時: ${new Date().toLocaleString('ja-JP')}
            </div>
          </div>
          <div class="title-desc">
            本資料は犯罪抑止・セキュリティ対策に特化した再会支援SNS「ReMEETs」における治安コプライアンス監査実証ドキュメントです。A4規格印刷・PDF出力に完全適合するよう最適にフォーマットされています。
          </div>
          <div class="container">
            ${parseMarkdownToHtml(markdown)}
          </div>
          <div class="footer">
            ReMEETs 治安・防衛コンプライアンス管理事務局 &copy; 2026. All Rights Reserved.
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
        </html>
      `;
    }

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${titleStr}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDFOutline = () => {
    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">`;
    const styles = `
      <style>
        @media print {
          body {
            background: #ffffff;
            color: #1a1a1a;
          }
        }
        @page {
          size: A4 portrait;
          margin: 18mm 15mm 18mm 15mm;
        }
        body {
          font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          font-size: 10pt;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }
        .header {
          border-bottom: 2px solid #E11D48;
          padding-bottom: 12px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-family: 'Noto Sans JP', sans-serif;
        }
        .header h1 {
          font-size: 14pt;
          margin: 0;
          color: #1a1a1a;
          font-weight: 700;
          font-family: 'Noto Serif JP', serif;
        }
        .header .subtitle {
          font-size: 8.5pt;
          color: #E11D48;
          font-weight: bold;
          margin-top: 4px;
        }
        .header .date {
          font-size: 8.5pt;
          color: #64748b;
          text-align: right;
        }
        .title-desc {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 9pt;
          color: #475569;
          margin-bottom: 25px;
        }
        .grid-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .slide-block {
          page-break-inside: avoid;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .slide-meta {
          font-size: 8pt;
          font-weight: bold;
          color: #E11D48;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }
        .slide-num {
          font-family: monospace;
        }
        .slide-category {
          background: #ffe4e6;
          color: #9f1239;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 7.5pt;
        }
        .slide-title {
          font-size: 11pt;
          font-weight: bold;
          color: #0f172a;
          margin: 0 0 10px 0;
          font-family: 'Noto Serif JP', serif;
          line-height: 1.4;
        }
        .slide-subtitle {
          font-size: 8.5pt;
          color: #475569;
          margin: 0 0 10px 0;
          padding: 6px 12px;
          background: #f1f5f9;
          border-left: 3px solid #64748b;
          border-radius: 0 6px 6px 0;
        }
        .slide-points {
          margin: 0;
          padding-left: 18px;
          font-size: 9pt;
          color: #334155;
        }
        .slide-points li {
          margin-bottom: 6px;
          list-style-type: square;
        }
        .footer {
          margin-top: 40px;
          font-size: 8pt;
          text-align: center;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
        }
      </style>
    `;

    const content = slides.map((s, idx) => {
      const sub = s.subtitle ? `<div class="slide-subtitle">${s.subtitle}</div>` : '';
      const pts = s.points && s.points.length > 0
        ? `<ul class="slide-points">${s.points.map(pt => `<li>${pt}</li>`).join('')}</ul>`
        : '';
      return `
        <div class="slide-block">
          <div class="slide-meta">
            <span class="slide-num">SLIDE ${idx + 1} / ${slides.length}</span>
            <span class="slide-category">${s.category}</span>
          </div>
          <h2 class="slide-title">${s.title}</h2>
          ${sub}
          ${pts}
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>ReMEETs プレゼンテーション全編構成案</title>
        ${fontLink}
        ${styles}
      </head>
      <body>
        <div class="header">
          <div>
            <h1>ReMEETs プレゼンテーション全編構成案</h1>
            <div class="subtitle">治安行政・防衛システムセキュリティ設計書（全${slides.length}スライド）</div>
          </div>
          <div class="date">
            出力日時: ${new Date().toLocaleString('ja-JP')}
          </div>
        </div>
        <div class="title-desc">
          本資料は犯罪抑止・セキュリティ対策に特化したSNS「ReMEETs」における、警察や各公安関係への説明・プレゼンテーション資料の全構成案（テキスト・箇条書き・カテゴリ）を網羅した公式の監査構成文書です。A4印刷またはPDF出力にフィットするよう最適化されています。
        </div>
        <div class="grid-container">
          ${content}
        </div>
        <div class="footer">
          ReMEETs 治安・防衛コンプライアンス管理事務局
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Compliance_Slides.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintSlidePreview = () => {
    document.body.classList.add('printing-active-slide-preview');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-active-slide-preview');
    }, 1000);
  };

  const handleDownloadHTMLDocument = () => {
    let titleStr = "ReMEETs 治安行政・防衛システム文書";
    if (docType === 'deployment') titleStr = "① ReMEETs 本番デプロイガイド ＆ 運営コンプライアンス設計書";
    else if (docType === 'cost_estimate') titleStr = "①-B 本番運用コスト＆初期費用シミュレータ";
    else if (docType === 'cost_list_detailed') titleStr = "①-C 本番運用コスト＆初期費用 総合見積もりリスト";
    else if (docType === 'permit') titleStr = "② ReMEETs 開業知識・官公庁届出Q＆A";
    else if (docType === 'police') titleStr = "③ ReMEETs 警察署・生活安全課協議用セキュリティ報告書";
    else if (docType === 'consult') titleStr = "④ ReMEETs 警察署事前相談フロー";
    else if (docType === 'matrix') titleStr = "⑤ セキュリティ適合性監査マトリクス";
    else if (docType === 'scenario') titleStr = "⑦ 警察向けプレゼンテーション公式口頭発表シナリオ";
    else if (docType === 'requirements') titleStr = "⑧ ReMEETs システム基本要件定義書 (System Requirements Definition Document)";
    else if (docType === 'evaluation') titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー";
    else if (docType === 'pr_plan') titleStr = "⑩ ReMEETs 広報・マーケティング・PR立ち上げ戦略プラン";
    else if (docType === 'legal_guide') titleStr = "⑪ 主要関係法令適合性＆警察署相談ガイダンス";

    const pToB = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s*<ul>/gim, '')
        .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
        .replace(/<\/ul>\s*<ul>/gim, '')
        .replace(/^([a-zA-Z0-9_\s.\-]+.*)$/gim, '<p>$1</p>')
        .replace(/<\/p>\s*<p>/gim, '<br>');
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleStr}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      background-color: #fdfaf2;
    }
    .container {
      background: #fff;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      border: 1px solid #e1d8c7;
    }
    h1 {
      font-size: 24px;
      border-bottom: 2px solid #3B627F;
      padding-bottom: 15px;
      color: #1a2735;
      margin-top: 20px;
    }
    h2 {
      font-size: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-top: 35px;
      color: #3B627F;
    }
    h3 {
      font-size: 16px;
      color: #444;
      margin-top: 25px;
    }
    p, li {
      font-size: 14px;
      color: #444;
    }
    ul, ol {
      padding-left: 20px;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 12px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 13px;
      margin: 20px 0;
    }
    code {
      background: rgba(0,0,0,0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
    }
    pre code {
      background: none;
      padding: 0;
    }
    hr {
      border: 0;
      border-top: 1px solid #eee;
      margin: 40px 0;
    }
    blockquote {
      border-left: 4px solid #3B627F;
      padding-left: 20px;
      color: #666;
      margin: 25px 0;
      font-style: italic;
      background: #f4f7f9;
      padding-top: 10px;
      padding-bottom: 10px;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      font-size: 12px;
      color: #999;
      text-align: center;
      margin-top: 60px;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    @media print {
      body { background: #fff; margin: 0; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size:11px;color:#7A8E9E;font-weight:bold;margin-bottom:15px;text-transform:uppercase;letter-spacing:1px;">ReMEETs COMPLIANCE OFFICIAL RECORD</div>
    <h1>${titleStr}</h1>
    <div style="margin-top:30px;">
      ${pToB(markdown)}
    </div>
    <div class="footer">
      ReMEETs 治安行政・防衛システム監査監査官用ポータル &copy; 2026. All Rights Reserved.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    let dlName = `${titleStr}.html`;
    link.href = url;
    link.setAttribute('download', dlName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMarkdown = async () => {
    let fileName = 'ReMEETs_Deployment_Guide.md';
    let titleStr = "ReMEETs 治安行政・防衛システム文書";
    if (docType === 'permit') fileName = 'ReMEETs_Permit_QA_Guide.md';
    else if (docType === 'cost_estimate') fileName = 'ReMEETs_Monetization_Guide.md';
    else if (docType === 'cost_list_detailed') fileName = 'ReMEETs_Cost_List_Guide.md';
    else if (docType === 'police') fileName = 'ReMEETs_Police_Compliance_Guide.md';
    else if (docType === 'consult') fileName = 'ReMEETs_Police_Consultation_Flow.md';
    else if (docType === 'matrix') fileName = 'ReMEETs_Risk_Mitigation_Matrix.md';
    else if (docType === 'scenario') fileName = 'ReMEETs_Police_Presentation_Scenario.md';
    else if (docType === 'requirements') fileName = 'ReMEETs_Requirements_Definition.md';
    else if (docType === 'evaluation') {
      if (evaluationDateTab === '2026-08-24') {
        fileName = 'ReMEETs_Overall_Evaluation_20260824.md';
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月24日 改定版)";
      } else if (evaluationDateTab === '2026-08-15') {
        fileName = 'ReMEETs_Overall_Evaluation_20260815.md';
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月15日 初版)";
      } else {
        fileName = 'ReMEETs_Overall_Evaluation.md';
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年9月5日 最新改定版)";
      }
    }
    else if (docType === 'pr_plan') fileName = 'ReMEETs_PR_Plan.md';
    else if (docType === 'legal_guide') fileName = 'ReMEETs_Legal_Compliance_Guide.md';
    
    if (docType === 'deployment') titleStr = "① ReMEETs 本番デプロイガイド ＆ 運営コンプライアンス設計書";
    else if (docType === 'cost_estimate') titleStr = "①-B 本番運用コスト＆初期費用シミュレータ";
    else if (docType === 'cost_list_detailed') titleStr = "①-C 本番運用コスト＆初期費用 総合見積もりリスト";
    else if (docType === 'permit') titleStr = "② ReMEETs 開業知識・官公庁届出Q＆A";
    else if (docType === 'police') titleStr = "③ ReMEETs 警察署・生活安全課協議用セキュリティ報告書";
    else if (docType === 'consult') titleStr = "④ ReMEETs 警察署事前相談フロー";
    else if (docType === 'matrix') titleStr = "⑤ セキュリティ適合性監査マトリクス";
    else if (docType === 'scenario') titleStr = "⑦ 警察向けプレゼンテーション公式口頭発表シナリオ";
    else if (docType === 'requirements') titleStr = "⑧ ReMEETs システム基本要件定義書 (System Requirements Definition Document)";
    else if (docType === 'evaluation') {
      if (evaluationDateTab === '2026-08-24') {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月24日 改定版)";
      } else if (evaluationDateTab === '2026-08-15') {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年8月15日 初版)";
      } else {
        titleStr = "⑨ ReMEETs サイト全体評価 ＆ 専門家技術レビュー (2026年9月5日 最新改定版)";
      }
    }
    else if (docType === 'pr_plan') titleStr = "⑩ ReMEETs 広報・マーケティング・PR立ち上げ戦略プラン";
    else if (docType === 'legal_guide') titleStr = "⑪ 主要関係法令適合性＆警察署相談ガイダンス";

    let downloadName = `${titleStr}.md`;

    try {
      const response = await fetch(`/${fileName}`);
      if (response.ok) {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      alert('エラーが発生しました。');
    }
  };

  const handleDownloadAuditCSV = () => {
    const csvContent = 
      "\ufeff" + // UTF-8 BOM
      "ログ日時 (Timestamp),ログ分類 (Category),対象ホスト/IP (Client IP),ユーザー識別子 (User Hash),操作/検知イベント (Event Action),モデレーション評価 (AI Safety Check),監査適合ステータス (Status)\n" +
      '"2026-06-05 13:02:11","USER_SIGNUP_CONSENT","192.168.12.44","usr_d8f37a90b1e34","年齢18歳以上宣誓完了・電子承諾済","PASS (SafetyScore: 1.00)","SUCCESS (適合)"\n' +
      '"2026-06-05 13:02:45","QUIZ_POST_PROPOSAL","192.168.12.44","usr_d8f37a90b1e34","思い出ボトル投函 (キーワード: 高校陸上部、担任の名前)","PASS (SafetyScore: 0.98)","SUCCESS (適合)"\n' +
      '"2026-06-05 13:03:15","IDENTITY_VERIFICATION_START","192.168.12.44","usr_d8f37a90b1e34","オンライン本人確認 (eKYC) の申請受理、事業者認証セッション接続","PENDING","LAUNCHED (認証開始)"\n' +
      '"2026-06-05 13:04:02","IDENTITY_VERIFICATION_COMPLETED","192.168.12.44","usr_d8f37a90b1e34","eKYC公的身元照合成功、生年月日照合完了。生身分証データは即時完全パージ破棄済","VERIFIED (TokenHash: ab93f7e...)","SUCCESS (公的適合)"\n' +
      '"2026-06-05 13:05:22","NG_WORD_MODERATION","203.0.113.88","usr_93f8fe9c6d32","手紙本文の自動スキャン (アビューズ示唆を検知して遮断)","BLOCKED (NGワード: LINEなどの直接交渉・ハラスメントの疑い)","PREVENTED (防衛成功)"\n' +
      '"2026-06-05 13:12:04","POLICE_FORENSIC_EXPORT","127.0.0.1 (ADMIN)","admin_root","監査官用ログダンプの任意抽出・エクスポート実行","PASS_AUTHORITY","SUCCESS (適合)"\n' +
      '"2026-06-05 13:20:00","LOG_INTEGRITY_SEAL","SYSTEM_DAEMON","N/A","データベース整合性暗号署名の永続ロギング完了","INTEGRITY_SECURE","ACTIVE (正常)"\n' +
      '"2026-06-05 13:31:05","USER_CONSENT_REVOCATION","198.51.100.12","usr_12a76f5e8b41","利用者からのアカウント自己削除・全全データ不活性化(パージ法適合)","USER_ACTION","PURGED (適合)"\n' +
      '"2026-06-05 13:40:44","BLACKLISTED_USER_PREVENT","198.51.100.99","usr_temp_92fa","eKYC身元照合時、実名ハッシュが永久BlackListに一致。別垢による登録バイパスを未然遮断","REJECTED (ハッシュ特定: fx83a29...)","PREVENTED (防衛成功)"\n' +
      '"2026-06-05 13:42:19","THREAT_IP_COOLDOWN","198.51.100.55","usr_guest_unauth","短時間での思い出クイズ総当たり入力アタックを検知","BLOCKED (不正クイズハック検知)","IP_COOLING (遮断)"';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ReMEETs_Audit_Forensic_Sample_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


export { handlePrintDocument, handleDownloadAuditCSV };
