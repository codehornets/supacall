import { Resend } from "resend"
import { RESEND_API_KEY } from "./constants"


export async function sendVerificationEmail(email: string, code: string) {
    const subject = "Verify your email address";
    const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify your email address</h2>
            <p>Thank you for signing up! Please use the following code to verify your email address:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                <strong>${code}</strong>
            </div>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, body);
}

export async function sendEmail(to: string, subject: string, body: string, attachments: Array<{ filename: string, content: string }> = []) {
    const resend = new Resend(RESEND_API_KEY)
    await resend.emails.send({
        from: "noreply@mail.pipeium.com",
        to: to,
        subject: subject,
        html: body,
        attachments: attachments
    })
    return {
        success: true
    }
}