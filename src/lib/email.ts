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

export async function sendReportIssuedEmail(email: string, projectName: string, reportLink: string) {
  const apiToken = process.env.ZEPTOMAIL_API_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "contact@habitus.africa";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Habitus";
  const bounceAddress = process.env.ZEPTOMAIL_BOUNCE_ADDRESS || "bounce@bounce.habitus.africa";
  const apiUrl = process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email";

  const subject = `Your Habitus Inspection Report is Ready: ${projectName}`;
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
    <p>We are pleased to inform you that your construction inspection report for project <strong>${projectName}</strong> has been completed and issued by our auditor.</p>
    <p>You can view the full assessment status, key findings, and attached media evidence in your dashboard.</p>
    <p>
      <a href="${reportLink}" class="button" style="color: #ffffff;">View Report</a>
    </p>
    <p>If you have any questions or require further details, please reach out to your assigned coordinator.</p>
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

We are pleased to inform you that your construction inspection report for project "${projectName}" has been completed and issued by our auditor.

You can view the full assessment status, key findings, and attached media evidence in your dashboard by visiting:

${reportLink}

If you did not request this verification or have questions, please contact our support.

Habitus
Build Back Home With Confidence.
  `.trim();

  if (!apiToken || apiToken === "fake-key") {
    console.warn("Zoho Zeptomail API token not configured. Report email logged:");
    console.log(`>>> REPORT NOTIFICATION FOR: ${email} (Project: ${projectName})`);
    console.log(`>>> VIEW REPORT LINK: ${reportLink}`);
    return;
  }

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
      console.error("Zeptomail report notification failed:", errorText);
    }
  } catch (error) {
    console.error("Failed to send report notification email:", error);
  }
}

export async function sendContactFormEmail(values: {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp?: string;
  message: string;
}) {
  const apiToken = process.env.ZEPTOMAIL_API_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "contact@habitus.africa";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Habitus Support";
  const bounceAddress = process.env.ZEPTOMAIL_BOUNCE_ADDRESS || "bounce@bounce.habitus.africa";
  const apiUrl = process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email";

  const subject = `New Contact Form Submission from ${values.firstName} ${values.lastName}`;
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333333; background-color: #F7F5F2; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 32px; }
    .logo { color: #1F7A5A; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
    .field { margin-bottom: 16px; }
    .label { font-weight: bold; color: #1F7A5A; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; }
    .value { font-size: 15px; color: #2D3748; }
    .message-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin-top: 8px; white-space: pre-wrap; }
    .footer { margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 14px; color: #666666; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Habitus Contact Form</div>
    <div class="field">
      <span class="label">Sender Name</span>
      <span class="value">${values.firstName} ${values.lastName}</span>
    </div>
    <div class="field">
      <span class="label">Email Address</span>
      <span class="value">${values.email}</span>
    </div>
    ${values.whatsapp ? `
    <div class="field">
      <span class="label">WhatsApp Number</span>
      <span class="value">${values.whatsapp}</span>
    </div>
    ` : ""}
    <div class="field">
      <span class="label">Message</span>
      <div class="message-box">${values.message}</div>
    </div>
    <div class="footer">
      Habitus Platform Notifications
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
New Contact Form Submission:

Sender Name: ${values.firstName} ${values.lastName}
Email Address: ${values.email}
${values.whatsapp ? `WhatsApp Number: ${values.whatsapp}\n` : ""}
Message:
${values.message}
  `.trim();

  // Fallback logging in local dev if no apiToken is configured
  if (!apiToken || apiToken === "fake-key") {
    console.warn("Zoho Zeptomail API token not configured. Contact email payload:");
    console.log(textContent);
    return;
  }

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
          address: "contact@habitus.africa",
          name: "Habitus Support",
        },
      },
    ],
    reply_to: [
      {
        email_address: {
          address: values.email,
          name: `${values.firstName} ${values.lastName}`,
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
    console.error("Failed to send contact form email via Zoho Zeptomail:", error);
    throw error;
  }
}
