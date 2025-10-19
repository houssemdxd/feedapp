import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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