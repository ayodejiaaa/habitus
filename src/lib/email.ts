export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const apiToken = process.env.ZEPTOMAIL_API_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "contact@habitus.africa";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Habitus";
  const bounceAddress = process.env.ZEPTOMAIL_BOUNCE_ADDRESS || "bounce@bounce.habitus.africa";
  const apiUrl = process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email";

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

  // Fallback logging in local dev if no apiToken is configured
  if (!apiToken || apiToken === "fake-key") {
    console.warn("Zoho Zeptomail API token not configured. Reset link generated:");
    console.log(`>>> RESET LINK: ${resetLink}`);
    return;
  }

  // Format authorization header (prepend prefix if it doesn't already start with "Zoho-")
  const authHeader = apiToken.startsWith("Zoho-") ? apiToken : `Zoho-enczapitoken ${apiToken}`;

  const payload = {
    bounce_address: bounceAddress,
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: email,
          name: email.split("@")[0] || "User",
        },
      },
    ],
    subject: subject,
    htmlbody: htmlContent,
    textbody: textContent,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zeptomail API responded with status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Failed to send email via Zoho Zeptomail. Reset link generated:");
    console.log(`>>> RESET LINK: ${resetLink}`);
    throw error;
  }
}

export async function sendEmailVerificationEmail(email: string, verificationLink: string) {
  const apiToken = process.env.ZEPTOMAIL_API_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "contact@habitus.africa";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Habitus";
  const bounceAddress = process.env.ZEPTOMAIL_BOUNCE_ADDRESS || "bounce@bounce.habitus.africa";
  const apiUrl = process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email";

  const subject = "Verify your Habitus account";
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
    <p>Welcome to Habitus.</p>
    <p>Please verify your email address to activate your account.</p>
    <p>
      <a href="${verificationLink}" class="button" style="color: #ffffff;">Verify Email</a>
    </p>
    <p>This link expires in 24 hours.</p>
    <p>If you did not create this account, you can safely ignore this email.</p>
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

Welcome to Habitus.

Please verify your email address to activate your account.

${verificationLink}

This link expires in 24 hours.

If you did not create this account, you can safely ignore this email.

Habitus
Build Back Home With Confidence.
  `.trim();

  // Fallback logging in local dev if no apiToken is configured
  if (!apiToken || apiToken === "fake-key") {
    console.warn("Zoho Zeptomail API token not configured. Verification link generated:");
    console.log(`>>> VERIFICATION LINK: ${verificationLink}`);
    return;
  }

  // Format authorization header (prepend prefix if it doesn't already start with "Zoho-")
  const authHeader = apiToken.startsWith("Zoho-") ? apiToken : `Zoho-enczapitoken ${apiToken}`;

  const payload = {
    bounce_address: bounceAddress,
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: email,
          name: email.split("@")[0] || "User",
        },
      },
    ],
    subject: subject,
    htmlbody: htmlContent,
    textbody: textContent,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zeptomail API responded with status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Failed to send verification email via Zoho Zeptomail. Link generated:");
    console.log(`>>> VERIFICATION LINK: ${verificationLink}`);
    throw error;
  }
}
