import nodemailer from "nodemailer";
const FROM = process.env.SMTP_FROM || "no-reply@example.com";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  return transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text, // plain-text fallback
    html: opts.html,
  });
}
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: to,
        subject: 'Reset your password',
        // html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
        html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,

    };
    await transporter.sendMail(mailOptions);
    // console.log("email sending ...");
    // console.log("reseturl : ", resetUrl);
    // console.log("email port : ", process.env.SMTP_PORT);
    // console.log("email user : ", process.env.SMTP_USER);
    // console.log("esmail password : ", process.env.SMTP_PASS);
    // console.log("email host : ", process.env.SMTP_HOST);
    // const from = process.env.SMTP_FROM || "no-reply@easyfeed.com";
    // await transporter.sendMail({
    //     from,
    //     to,
    //     subject: "Reset your password",
    //     text: `Click the link to reset your password: ${resetUrl}`,
    //     html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    // });
    console.log("email sended !");
}
export async function sendVerificationEmail(to: string, verifyUrl: string) {
  // Reuse your existing transport/provider (same as sendPasswordResetEmail)
  // Example with your existing sender function pattern:
  return await sendMail({
    to,
    subject: "Confirm your account",
    html: `
      <div style="font-family:Inter,Arial,sans-serif">
        <h2>Confirm your account</h2>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This link expires soon. If you didn’t request this, you can ignore it.</p>
      </div>
    `,
  });
}