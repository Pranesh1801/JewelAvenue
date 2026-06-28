/**
 * email.ts — Resend-backed email service for Jewel Avenue.
 *
 * All credentials come from environment variables.
 * To swap providers, replace only this file.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Jewel Avenue <noreply@jewelavenue.in>";

const BASE_URL =
  process.env.NEXTAUTH_URL ?? "http://localhost:3000";

// ── Shared email chrome ───────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jewel Avenue</title>
</head>
<body style="margin:0;padding:0;background:#f8f5ef;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ef;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#D4AF37;font-weight:600;">
                ✦ JEWEL AVENUE ✦
              </p>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#fff;border-radius:16px;border:1px solid rgba(212,175,55,0.2);padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#999;letter-spacing:0.08em;">
                © ${new Date().getFullYear()} Jewel Avenue. All rights reserved.
              </p>
              <p style="margin:6px 0 0;font-size:10px;color:#bbb;">
                This email was sent to you because an action was performed on your account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td align="center">
        <a href="${href}"
           style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;
                  padding:14px 36px;border-radius:100px;font-size:13px;font-weight:600;
                  letter-spacing:0.18em;text-transform:uppercase;border:1px solid rgba(212,175,55,0.3);">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

// ── Password reset email ──────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  toEmail: string,
  token: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0a;letter-spacing:-0.01em;">
      Reset your password
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
      We received a request to reset the password for your Jewel Avenue account.
      Click the button below to choose a new password.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="margin:0 0 8px;font-size:12px;color:#888;line-height:1.6;">
      This link expires in <strong>30 minutes</strong> and can only be used once.
    </p>
    <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not change.
    </p>
    <hr style="margin:24px 0;border:none;border-top:1px solid rgba(212,175,55,0.15);" />
    <p style="margin:0;font-size:11px;color:#bbb;word-break:break-all;">
      Or copy this link into your browser:<br/>
      <span style="color:#D4AF37;">${resetUrl}</span>
    </p>
  `);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Skipping password reset email to:", toEmail);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Reset your Jewel Avenue password",
    html,
  });
}

// ── Email verification email ──────────────────────────────────────────────────

export async function sendVerificationEmail(
  toEmail: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;

  const html = emailWrapper(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0a;letter-spacing:-0.01em;">
      Verify your email address
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
      Welcome to Jewel Avenue! Please verify your email address to activate your account
      and start shopping our curated jewelry collection.
    </p>
    ${ctaButton(verifyUrl, "Verify Email")}
    <p style="margin:0 0 8px;font-size:12px;color:#888;line-height:1.6;">
      This link expires in <strong>24 hours</strong>.
    </p>
    <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
      If you didn't create an account, you can safely ignore this email.
    </p>
    <hr style="margin:24px 0;border:none;border-top:1px solid rgba(212,175,55,0.15);" />
    <p style="margin:0;font-size:11px;color:#bbb;word-break:break-all;">
      Or copy this link into your browser:<br/>
      <span style="color:#D4AF37;">${verifyUrl}</span>
    </p>
  `);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Skipping verification email to:", toEmail);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Verify your Jewel Avenue account",
    html,
  });
}
