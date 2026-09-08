import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "mock-user@ethereal.email",
    pass: process.env.SMTP_PASS || "mock-pass",
  },
});

export const renderRichEmailHtml = ({ title, subtitle, mainMessage, buttonText, buttonUrl, noteText }: {
  title: string;
  subtitle: string;
  mainMessage: string;
  buttonText: string;
  buttonUrl: string;
  noteText?: string;
}) => {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F5EFEB;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN','Meiryo',sans-serif;color:#2C3E50;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F5EFEB;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #E6DFD5;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #1B2B34 0%, #2A4351 100%);padding:32px 30px;text-align:center;">
              <h1 style="margin:0;font-size:22px;color:#FFFFFF;font-weight:600;letter-spacing:0.05em;font-family:serif;">🕊️ ReMEETs 〜再会のボトルメール〜</h1>
              <p style="margin:8px 0 0 0;font-size:13px;color:#D1E0E3;letter-spacing:0.03em;">あの頃の想い出を、もう一度つなぐ。</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px 0;font-size:18px;color:#1B2B34;border-bottom:2px solid #F27D26;padding-bottom:10px;font-weight:bold;">${subtitle}</h2>
              <div style="font-size:15px;line-height:1.8;color:#4A5568;margin-bottom:32px;">
                ${mainMessage.replace(/\n/g, '<br>')}
              </div>
              
              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${buttonUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #F27D26 0%, #E06010 100%);color:#FFFFFF;text-decoration:none;font-size:16px;font-weight:bold;padding:16px 36px;border-radius:50px;box-shadow:0 4px 15px rgba(242,125,38,0.35);letter-spacing:0.03em;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              ${noteText ? `
              <div style="margin-top:32px;padding:16px;background-color:#FAF7F2;border-radius:8px;border-left:4px solid #D1E0E3;font-size:13px;color:#718096;line-height:1.6;">
                ${noteText.replace(/\n/g, '<br>')}
              </div>` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#FAF7F2;padding:24px 32px;border-top:1px solid #E6DFD5;font-size:12px;color:#A0AEC0;text-align:center;line-height:1.6;">
              <p style="margin:0 0 8px 0;">※本メールは送信専用です。ご返信いただいてもお答えできませんのでご了承ください。</p>
              <p style="margin:0 0 8px 0;">※本サービスは18歳未満の方のご利用を禁止しております。</p>
              <p style="margin:0;color:#718096;">© 2026 ReMEETs 事務局（制定日: 2026年8月15日）</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};


export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = renderRichEmailHtml({
    title: '【ReMEETs】メールアドレスの本人確認をお願いいたします',
    subtitle: 'メールアドレスの本人確認手続き',
    mainMessage: `ReMEETs（再会のボトルメール）にご登録いただき誠にありがとうございます。\n\nあなたの大切な想い出を安全にお預かりし、幸せな再会につなげるため、ご入力いただいたメールアドレスの確認を行っております。\n\n下記のボタンをクリックして、認証手続きを完了させてください。`,
    buttonText: 'メールアドレスを認証する',
    buttonUrl: url,
    noteText: '※このボタンの有効期限は24時間です。\n※お心当たりがない場合は、誠に恐れ入りますが本メールを破棄してください。'
  });

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ReMEETs事務局 <noreply@remeets.jp>',
          to: email,
          subject: '【ReMEETs】メールアドレスの本人確認をお願いいたします',
          html
        })
      });
    } catch (e) {
      console.error('Failed to send verification email via Resend:', e);
    }
  } else {
    console.log(`[EMAIL DISPATCH] Verification email generated for ${email} (URL: ${url})`);
  }
};


export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = renderRichEmailHtml({
    title: '【ReMEETs】パスワード再設定のご案内',
    subtitle: 'パスワード再設定リクエスト',
    mainMessage: `アカウントのパスワード再設定リクエストを受け付けました。\n\n下記のボタンをクリックして、新しいパスワードのご登録をお願いいたします。`,
    buttonText: '新しいパスワードを設定する',
    buttonUrl: url,
    noteText: '※このURLの有効期限は30分間です。\n※パスワード再設定に心当たりがない場合は、第三者が誤って入力した可能性があります。アカウントの安全性は保たれておりますので、本メールを破棄してください。'
  });

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ReMEETs事務局 <noreply@remeets.jp>',
          to: email,
          subject: '【ReMEETs】パスワード再設定のご案内',
          html
        })
      });
    } catch (e) {
      console.error('Failed to send password reset email via Resend:', e);
    }
  } else {
    console.log(`\n==================================================\n[EMAIL SIMULATION] Password Reset Email to: ${email}\nReset URL: ${url}\n==================================================\n`);
  }
};

export const sendRegistrationCodeEmail = async (email: string, code: string, userName: string = 'ユーザー') => {
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【ReMEETs】新規アカウント登録の認証コード（有効期限30分）</title>
</head>
<body style="margin:0;padding:0;background-color:#F5EFEB;font-family:'Helvetica Neue',Arial,'Hiragino Kaku Gothic ProN','Meiryo',sans-serif;color:#2C3E50;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F5EFEB;padding:40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);border:1px solid #E6DFD5;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0284c7 0%, #1e40af 100%);padding:32px 30px;text-align:center;">
              <h1 style="margin:0;font-size:22px;color:#FFFFFF;font-weight:600;letter-spacing:0.05em;font-family:serif;">🕊️ ReMEETs 〜再会のボトルメール〜</h1>
              <p style="margin:8px 0 0 0;font-size:13px;color:#E0F2FE;letter-spacing:0.03em;">新規アカウント登録・認証コードのご案内</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px 0;font-size:18px;color:#0f172a;border-bottom:2px solid #0284c7;padding-bottom:10px;font-weight:bold;">
                ${userName} 様
              </h2>
              <div style="font-size:14px;line-height:1.8;color:#334155;margin-bottom:24px;">
                ReMEETs（再会のボトルメール）へのご登録リクエストをいただき、誠にありがとうございます。<br><br>
                アカウント登録を完了させるため、以下の<strong>【6桁の認証コード】</strong>を登録画面にご入力ください。
              </div>
              
              <!-- Verification Code Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:2px dashed #0284c7;border-radius:16px;padding:24px 32px;display:inline-block;text-align:center;box-shadow:0 4px 12px rgba(2,132,199,0.08);">
                      <div style="font-size:12px;font-weight:bold;color:#0369a1;letter-spacing:0.1em;margin-bottom:8px;text-transform:uppercase;">
                        VERIFICATION CODE
                      </div>
                      <div style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#0f172a;font-family:'Courier New',Courier,monospace;">
                        ${code}
                      </div>
                      <div style="font-size:11px;color:#0369a1;margin-top:8px;font-weight:bold;">
                        ⏳ 有効期限: 発行から30分間
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="margin-top:32px;padding:16px 20px;background-color:#FFFBEB;border-radius:12px;border-left:4px solid #F59E0B;font-size:12px;color:#92400E;line-height:1.7;">
                <strong>⚠️ ご注意事項:</strong><br>
                ・この認証コードの有効期限は発行から<strong>30分間</strong>です。<br>
                ・第三者への認証コードの共有・開示は絶対に行わないでください。<br>
                ・<strong>本メールにお心当たりがない場合</strong>は、第三者がメールアドレスを誤って入力した可能性があります。アカウントは作成されておりませんので、本メールをそのまま破棄してください。
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#FAF7F2;padding:24px 32px;border-top:1px solid #E6DFD5;font-size:11px;color:#94A3B8;text-align:center;line-height:1.6;">
              <p style="margin:0 0 6px 0;">※本メールは送信専用アドレスより自動配信されています。ご返信いただいても対応できかねますのでご了承ください。</p>
              <p style="margin:0 0 6px 0;">※本サービスは18歳未満の方のご利用を禁止しております。</p>
              <p style="margin:0;color:#64748B;">© 2026 ReMEETs 事務局（制定日: 2026年8月15日）</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ReMEETs事務局 <noreply@remeets.jp>',
          to: email,
          subject: '【ReMEETs】新規アカウント登録の認証コード（有効期限30分）',
          html
        })
      });
    } catch (e) {
      console.error('Failed to send registration code email via Resend:', e);
    }
  } else {
    console.log(`[EMAIL DISPATCH] Registration code email generated for ${email} -> CODE: [ ${code} ]`);
  }
};


