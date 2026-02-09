import nodemailer from "nodemailer";

export const sendEmails = async ({ to, subject, html }) => {
  try {
    console.log("📨 Sending email to:", to);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: `"Social App" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.accepted);
    return info.accepted.length > 0;
  } catch (err) {
    console.error("❌ Email error:", err);
    return false;
  }
};

export const subject = {
  register: "Activate Account",
  resetPassword: "Reset Password",
  updateEmail: "Update Email",
};
