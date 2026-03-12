import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth : {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
});

export const sendVerificationEmail= async (
    to: string,
    code: string

): Promise<void> => {
    await transporter.sendMail({
    from: `"PocketLedger" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your PocketLedger Verification Code",
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">PocketLedger</h2>
        <p>Your email verification code is:</p>
        <div style="
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 12px;
          color: #4F46E5;
          padding: 16px;
          background: #EEF2FF;
          border-radius: 8px;
          text-align: center;
          margin: 24px 0;
        ">${code}</div>
        <p style="color: #6B7280; font-size: 14px;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
};