import nodemailer from "nodemailer";

// Create reusable transporter object using the default SMTP transport
const smtpPort = process.env.SMTP_PORT || "465";
console.log("Initializing SMTP transporter. Host:", process.env.SMTP_HOST || "smtp.gmail.com", "Port:", smtpPort, "User:", process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(smtpPort),
  secure: smtpPort === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Sends a password reset email to the specified user.
 * @param email Recipient email address
 * @param resetLink Password reset URL containing the token
 */
export async function sendResetPasswordEmail(email: string, resetLink: string) {
  const mailOptions = {
    from: `"GlowTone AI Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Atur Ulang Kata Sandi Akun GlowTone AI Anda",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password GlowTone AI</title>
        <style>
          body {
            background-color: #FFF5F6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          .email-container {
            max-width: 540px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(255, 107, 129, 0.08);
            border: 1px solid rgba(255, 180, 190, 0.3);
          }
          .header-banner {
            background: linear-gradient(135deg, #FF6B81 0%, #FF8295 100%);
            padding: 40px 20px;
            text-align: center;
            color: #ffffff;
          }
          .header-icon {
            font-size: 36px;
            margin-bottom: 10px;
            display: inline-block;
          }
          .brand-title {
            margin: 0;
            font-family: 'Georgia', serif;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .brand-subtitle {
            margin: 5px 0 0 0;
            font-size: 11px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 600;
          }
          .content-body {
            padding: 40px 32px;
            color: #2C2527;
          }
          .greeting {
            font-size: 18px;
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 16px;
          }
          .description {
            font-size: 14px;
            line-height: 1.6;
            color: #5C4E52;
            margin-bottom: 30px;
          }
          .button-wrapper {
            text-align: center;
            margin: 35px 0;
          }
          .reset-btn {
            background: linear-gradient(90deg, #FF6B81 0%, #FF8295 100%);
            color: #ffffff !important;
            padding: 16px 36px;
            text-decoration: none;
            font-weight: bold;
            border-radius: 16px;
            font-size: 15px;
            display: inline-block;
            box-shadow: 0 8px 20px rgba(255, 107, 129, 0.3);
            border: none;
          }
          .security-notice {
            background-color: #FFF9FA;
            border-left: 4px solid #FF8295;
            padding: 16px;
            border-radius: 0 12px 12px 0;
            font-size: 13px;
            line-height: 1.5;
            color: #7A6B6E;
            margin-bottom: 25px;
          }
          .divider {
            border: 0;
            border-top: 1px solid #FFF0F2;
            margin: 30px 0;
          }
          .fallback-link {
            font-size: 12px;
            color: #A8989A;
            word-break: break-all;
            line-height: 1.4;
          }
          .fallback-link a {
            color: #FF6B81;
            text-decoration: none;
          }
          .footer {
            background-color: #FAF5F6;
            padding: 24px;
            text-align: center;
            font-size: 11px;
            color: #A8989A;
            line-height: 1.6;
            border-top: 1px solid rgba(255, 180, 190, 0.15);
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-banner">
            <span class="header-icon">✨</span>
            <h1 class="brand-title">GlowTone AI</h1>
            <p class="brand-subtitle">Skintone & Makeup Assistant</p>
          </div>
          
          <div class="content-body">
            <h2 class="greeting">Halo,</h2>
            <p class="description">
              Kami menerima permintaan untuk mereset kata sandi akun GlowTone AI Anda. Klik tombol di bawah ini untuk mengatur ulang sandi Anda:
            </p>
            
            <div class="button-wrapper">
              <a href="${resetLink}" target="_blank" class="reset-btn">Reset Kata Sandi</a>
            </div>
            
            <div class="security-notice">
              <strong>Penting:</strong> Link reset ini hanya akan aktif selama <strong>1 jam</strong> demi keamanan akun Anda. Jika Anda tidak pernah meminta perubahan ini, Anda dapat mengabaikan email ini dengan aman.
            </div>
            
            <hr class="divider" />
            
            <p class="fallback-link">
              Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br>
              <a href="${resetLink}" target="_blank">${resetLink}</a>
            </p>
          </div>
          
          <div class="footer">
            Email ini dikirimkan secara otomatis oleh sistem keamanan kami.<br>
            Mohon jangan membalas pesan ini secara langsung.<br>
            <br>
            &copy; 2026 <strong>GlowTone AI</strong>. Hak Cipta Dilindungi.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log(`Sending reset password email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Error in sendResetPasswordEmail:", error);
    throw error;
  }
}
