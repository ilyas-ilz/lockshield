/**
 * Admin account recovery CLI.
 *
 *   npm run admin:unlock                        -- clear lockout on all admins
 *   npm run admin:password -- <email> <newPass> -- set a password you know
 *   npm run admin:list                          -- who exists, and their state
 *
 * WHY this exists: the design deliberately has no self-service password
 * reset (that needs an email provider, which is a later decision — see
 * README "deferred"). Without this, a forgotten password or a lockout
 * meant editing the database by hand.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";
import { hashPassword, isPasswordStrong } from "../lib/password";

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set — check your .env");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

async function list() {
  const users = await User.find().select("name email role active failedLoginAttempts lockUntil lastLoginAt").lean();
  if (users.length === 0) {
    console.info("No users exist. Run: npm run seed");
    return;
  }
  for (const u of users) {
    const locked = u.lockUntil && new Date(u.lockUntil).getTime() > Date.now();
    const state = [
      u.active ? "active" : "DEACTIVATED",
      locked ? `LOCKED until ${new Date(u.lockUntil!).toLocaleTimeString()}` : "unlocked",
      `${u.failedLoginAttempts} failed`,
      u.lastLoginAt ? `last login ${new Date(u.lastLoginAt).toLocaleString()}` : "never logged in",
    ].join(", ");
    console.info(`  ${u.role.padEnd(6)} ${u.email.padEnd(30)} ${state}`);
  }
}

async function unlock() {
  const result = await User.updateMany({}, { $set: { failedLoginAttempts: 0, lockUntil: null } });
  console.info(`Unlocked ${result.modifiedCount} account(s).`);
}

async function setPassword(email: string, password: string) {
  const strength = isPasswordStrong(password);
  if (!strength.ok) throw new Error(strength.reason);

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new Error(`No user with email ${email}. Run "npm run admin:list" to see who exists.`);

  user.passwordHash = await hashPassword(password);
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.active = true;
  await user.save();
  console.info(`Password updated for ${user.email}. Account unlocked and active.`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  await connect();

  switch (command) {
    case "list":
      await list();
      break;
    case "unlock":
      await unlock();
      break;
    case "password": {
      const [email, password] = args;
      if (!email || !password) {
        throw new Error('Usage: npm run admin:password -- <email> "<newPassword>"');
      }
      await setPassword(email, password);
      break;
    }
    default:
      console.info('Usage: npm run admin:list | admin:unlock | admin:password -- <email> "<newPassword>"');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(`\n${err instanceof Error ? err.message : String(err)}\n`);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
