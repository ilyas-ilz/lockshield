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
 */
import "dotenv/config";
import mongoose from "mongoose";

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

  results.push("\nEnvironment");
  const uri = process.env.MONGODB_URI;
  const secret = process.env.AUTH_SECRET;

  if (!uri) problem("MONGODB_URI is NOT SET — copy .env.example to .env and fill it in");
  else ok(`MONGODB_URI -> ${describeUri(uri)}`);

  if (!secret) problem("AUTH_SECRET is NOT SET — generate one: openssl rand -base64 32");
  else if (secret.length < 32) problem(`AUTH_SECRET is too short (${secret.length} chars, needs 32+)`);
  else ok(`AUTH_SECRET ${mask(secret)}`);

  ok(`CLOUDINARY_CLOUD_NAME ${process.env.CLOUDINARY_CLOUD_NAME ? "set" : "NOT SET (uploads go to local disk - fine for dev and disk-backed hosts)"}`);

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
    } catch (err) {
      problem(`cannot connect: ${err instanceof Error ? err.message : String(err)}`);
      results.push("        -> is MongoDB running? For a local install, start the mongod service.");
      results.push("        -> for Atlas, check the URI, the password, and your IP allowlist.");
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
