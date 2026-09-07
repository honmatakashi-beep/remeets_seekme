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
    console.log(`[EMAIL DISPATCH] Password reset email generated for ${email} (URL: ${url})`);
  }
};

