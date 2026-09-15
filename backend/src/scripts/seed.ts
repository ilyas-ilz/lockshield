/**
 * Idempotent seed script — safe to run repeatedly (upserts, never duplicates).
 * Run with: npm run seed
 *
 * Creates:
 *  - one ADMIN user from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (.env)
 *  - the Settings singleton, pre-filled with Lock Shield's real NAP data
 *    (pulled from the legacy site's index.html JSON-LD) and the
 *    lockshieldcart.com partner backlinks — see Settings model doc comment
 *    for why these are real dofollow anchors, not the legacy broken
 *    `href="Email:..."` pseudo-links.
 *
 * Content (posts/projects/pages/services) is deliberately NOT seeded here —
 * that's real content entry, done through the admin UI once it exists, or
 * via a dedicated legacy-HTML importer script (a separate, optional tool —
 * see backend/README.md "Migrating legacy content").
 */
import "dotenv/config";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Settings } from "../models/Settings";
import { hashPassword } from "../lib/password";

async function main() {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Lock Shield Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding");
  }
  if (adminPassword.length < 10) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 10 characters");
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`[seed] admin user ${adminEmail} already exists, skipping`);
  } else {
    const passwordHash = await hashPassword(adminPassword);
    await User.create({ name: adminName, email: adminEmail, passwordHash, role: "ADMIN" });
    console.log(`[seed] created ADMIN user ${adminEmail}`);
  }

  await Settings.findByIdAndUpdate(
    "global",
    {
      $setOnInsert: {
        siteName: "Lock Shield",
        legalName: "Lock Shield Firefighting & Safety Equipment Installation LLC",
        phones: ["+971528434801"],
        whatsapp: "+971528434801",
        emails: ["info@lockshield.ae"],
        address: { poBox: "47672", street: "Hor Al Anz, Deira", locality: "Dubai", country: "AE" },
        socials: [{ platform: "instagram", url: "https://www.instagram.com/lockshield_cart/" }],
        // WHY these three specifically: real dofollow anchors with varied,
        // descriptive keyword text — the fix for "ecart backlink need to be
        // proper" (every legacy mention was a broken `href="Email:...`
        // pseudo-link that passed zero link equity).
        partnerLinks: [
          { label: "Lock Shield Cart — fire safety equipment store", url: "https://www.lockshieldcart.com", rel: "noopener" },
          { label: "Shop fire extinguishers & alarm parts", url: "https://www.lockshieldcart.com", rel: "noopener" },
        ],
        nav: [
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about-us" },
          { label: "Services", href: "/services" },
          { label: "Projects", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
          { label: "Contact", href: "/contact" },
        ],
        defaultSeo: {
          title: "Lock Shield — Fire Protection & Safety Equipment Installation LLC | Dubai, UAE",
          description:
            "Lock Shield designs, installs, tests and maintains world-class fire protection systems across the UAE. Civil Defence approved. 24/7 support.",
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("[seed] settings singleton ready");

  console.log("[seed] done");
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
