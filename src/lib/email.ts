import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "fake-key",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "fake-secret",
  },
});

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const fromEmail = process.env.SES_FROM_EMAIL || "no-reply@habitus.africa";
  
  const subject = "Reset your Habitus password";
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333333; background-color: #F7F5F2; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 32px; }
    .logo { color: #1F7A5A; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #1F7A5A; color: #FFFFFF !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 14px; color: #666666; }
    .slogan { font-weight: bold; color: #1F7A5A; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Habitus</div>
    <p>Hello,</p>
    <p>We received a request to reset your password.</p>
    <p>Click the button below to reset your password.</p>
    <p>
      <a href="${resetLink}" class="button" style="color: #ffffff;">Reset Password</a>
    </p>
    <p>This link expires in 1 hour.</p>
    <p>If you did not request this change, you can safely ignore this email.</p>
    <div class="footer">
      Habitus<br>
      <span class="slogan">Build Back Home With Confidence.</span>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
Hello,

We received a request to reset your password.

Click the link below to reset your password.

${resetLink}

This link expires in 1 hour.

If you did not request this change, you can safely ignore this email.

Habitus
Build Back Home With Confidence.
  `.trim();

  // Fallback logging in local dev
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID === "fake-key" ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    console.warn("AWS credentials not configured. Reset link generated:");
    console.log(`>>> RESET LINK: ${resetLink}`);
    return;
  }

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: htmlContent,
        },
        Text: {
          Data: textContent,
        },
      },
    },
  });

  try {
    await ses.send(command);
  } catch (error) {
    console.error("Failed to send email via AWS SES. Reset link generated:");
    console.log(`>>> RESET LINK: ${resetLink}`);
    throw error;
  }
}
