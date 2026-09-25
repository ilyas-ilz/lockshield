/**
 * Setup diagnostic — `npm run doctor`.
 *
 * WHY this exists: the failure modes when standing this up (Mongo not
 * running, no seeded user, an account locked out by the brute-force
 * protection, a rotated AUTH_SECRET) all surfaced as the same opaque
 * "CredentialsSignin" at the login screen. This reports exactly which one
 * you're hitting.
 *
 * Prints metadata only — never the value of a secret.
 *
 * `npm run doctor -- --send-test` also sends one real test email to the
 * Settings "Email Addresses" list, the same recipients a new lead goes to.
 */
import "dotenv/config";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

function mask(value: string | undefined): string {
  if (!value) return "NOT SET";
  return `set (${value.length} chars)`;
}

function describeUri(uri: string | undefined): string {
  if (!uri) return "NOT SET";
  try {
    // Strip credentials before printing.
    const withoutCreds = uri.replace(/\/\/[^@]*@/, "//<credentials>@");
    return withoutCreds;
  } catch {
    return "unparseable";
  }
}

async function main() {
  const results: string[] = [];
  let hasProblem = false;

  const problem = (msg: string) => {
    hasProblem = true;
    results.push(`  [X] ${msg}`);
  };
  const ok = (msg: string) => results.push(`  [ok] ${msg}`);
  let leadRecipients: string[] = [];

  results.push("\nEnvironment");
  const uri = process.env.MONGODB_URI;
  const secret = process.env.AUTH_SECRET;

  if (!uri) problem("MONGODB_URI is NOT SET — copy .env.example to .env and fill it in");
  else ok(`MONGODB_URI -> ${describeUri(uri)}`);

  if (!secret) problem("AUTH_SECRET is NOT SET — generate one: openssl rand -base64 32");
  else if (secret.length < 32) problem(`AUTH_SECRET is too short (${secret.length} chars, needs 32+)`);
  else ok(`AUTH_SECRET ${mask(secret)}`);

  const spacesVars = ["DO_SPACES_KEY", "DO_SPACES_SECRET", "DO_SPACES_BUCKET", "DO_SPACES_REGION"] as const;
  const missingSpaces = spacesVars.filter((name) => !process.env[name]?.trim());
  if (missingSpaces.length === 0) {
    ok(`DigitalOcean Spaces set (bucket ${process.env.DO_SPACES_BUCKET}, region ${process.env.DO_SPACES_REGION}, CDN ${process.env.DO_SPACES_CDN_URL || "built-in DO CDN"})`);
  } else if (missingSpaces.length === spacesVars.length) {
    ok("DigitalOcean Spaces NOT SET (uploads go to local disk - fine for dev, NOT persistent on Vercel)");
  } else {
    problem(`DigitalOcean Spaces partly set - missing ${missingSpaces.join(", ")} (uploads fall back to local disk)`);
  }

  results.push("\nDatabase");
  if (!uri) {
    problem("skipped — no MONGODB_URI");
  } else {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      ok("connected");

      const { User } = await import("../models/User");
      const { Settings } = await import("../models/Settings");

      const userCount = await User.countDocuments();
      const admins = await User.find({ role: "ADMIN" }).select("email active failedLoginAttempts lockUntil").lean();

      if (userCount === 0) {
        problem("no users exist — run: npm run seed");
      } else {
        ok(`${userCount} user(s), ${admins.length} admin(s)`);
        for (const admin of admins) {
          const locked = admin.lockUntil && new Date(admin.lockUntil).getTime() > Date.now();
          if (!admin.active) {
            problem(`${admin.email}: DEACTIVATED — login will always fail`);
          } else if (locked) {
            const mins = Math.ceil((new Date(admin.lockUntil!).getTime() - Date.now()) / 60000);
            problem(
              `${admin.email}: LOCKED OUT for ~${mins} more minute(s) after ${admin.failedLoginAttempts} failed attempts — run: npm run admin:unlock`
            );
          } else {
            ok(`${admin.email}: active, unlocked (${admin.failedLoginAttempts} failed attempts on record)`);
          }
        }
      }

      const settings = await Settings.findById("global");
      if (!settings) problem("Settings singleton missing — run: npm run seed");
      else ok("Settings singleton present");
      leadRecipients = settings?.emails ?? [];
    } catch (err) {
      problem(`cannot connect: ${err instanceof Error ? err.message : String(err)}`);
      results.push("        -> is MongoDB running? For a local install, start the mongod service.");
      results.push("        -> for Atlas, check the URI, the password, and your IP allowlist.");
    }
  }

  // WHY its own section: notify.ts swallows every SMTP failure (a lead must
  // never fail because email did) and skips silently when a variable or the
  // recipient list is missing, so "no email arrived" has no error to read.
  results.push("\nEmail (new-lead notifications)");
  const smtpVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"] as const;
  const missingSmtp = smtpVars.filter((name) => !process.env[name]?.trim());
  if (missingSmtp.length > 0) {
    problem(`SMTP disabled - missing ${missingSmtp.join(", ")}. notify.ts skips every lead email without logging an error.`);
  } else {
    const host = process.env.SMTP_HOST!.trim();
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER!.trim();
    const password = process.env.SMTP_PASSWORD!;
    const from = process.env.SMTP_FROM?.trim() || user;
    ok(`SMTP_HOST ${host}, SMTP_PORT ${process.env.SMTP_PORT} (${port === 465 ? "implicit TLS" : "STARTTLS"}), SMTP_USER ${user}`);
    ok(`SMTP_PASSWORD ${mask(password)}${/\s/.test(password) ? ", contains spaces" : ""}; sending as ${from}`);

    if (!Number.isInteger(port) || port <= 0) problem(`SMTP_PORT is not a number: "${process.env.SMTP_PORT}"`);
    if (/^["']|["']$/.test(password)) problem("SMTP_PASSWORD is wrapped in quotes - remove them");

    if (leadRecipients.length === 0) {
      problem("Settings > Email Addresses is empty - notify.ts has nobody to send to and skips silently");
    } else {
      ok(`lead emails go to: ${leadRecipients.join(", ")}`);
      // Gmail files a message you send to your own address under Sent / All
      // Mail without the Inbox label, so it looks like it never arrived.
      if (leadRecipients.some((to) => to.toLowerCase() === user.toLowerCase())) {
        results.push(`  [!] ${user} is both sender and recipient - Gmail shows it in Sent, not Inbox`);
      }
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
      connectionTimeout: 10_000,
    });
    try {
      await transport.verify();
      ok("SMTP login accepted by server");

      if (process.argv.includes("--send-test") && leadRecipients.length > 0) {
        const info = await transport.sendMail({
          from,
          to: leadRecipients.join(", "),
          subject: "Lock Shield website - SMTP test",
          text: "This is a test from `npm run doctor -- --send-test`. If you can read it, lead notifications can be delivered.",
        });
        ok(`test email accepted for ${info.accepted.join(", ") || "nobody"}; rejected: ${info.rejected.join(", ") || "none"}`);
      }
    } catch (err) {
      problem(`SMTP failed: ${err instanceof Error ? err.message : String(err)}`);
      results.push("        -> Gmail needs a 16-character App Password (2-Step Verification on), not the normal password.");
    }
  }

  console.info(results.join("\n"));
  console.info(hasProblem ? "\nFound problems above. Fix those, then retry.\n" : "\nAll checks passed.\n");

  await mongoose.disconnect().catch(() => {});
  process.exit(hasProblem ? 1 : 0);
}

main().catch((err) => {
  console.error("doctor failed:", err);
  process.exit(1);
});
