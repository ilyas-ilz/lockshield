/**
 * Idempotent seed script — safe to run repeatedly (upserts, never duplicates).
 * Run with: npm run seed
 *
 * Seeds:
 *  - One ADMIN user from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (.env)
 *  - The Settings singleton (NAP data, partner backlinks, social profiles)
 *  - 6 Core Civil Defence Fire Protection Services
 *  - Sample Completed Projects with client photos
 *  - Blog Categories & initial safety articles
 */
import "dotenv/config";
import { nanoid } from "nanoid";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Settings } from "../models/Settings";
import { Service } from "../models/Service";
import { Project } from "../models/Project";
import { Category } from "../models/Category";
import { Post } from "../models/Post";
import { hashPassword } from "../lib/password";

/**
 * WHY: SEED_ADMIN_EMAIL is copied by hand into .env and a bare username
 * ("admin") sails past this script only to die inside Mongoose as a raw
 * ValidationError stack — which says nothing about which env var to fix.
 * Check it here and name the variable in the message instead.
 */
function resolveAdminEmail(): string {
  const raw = process.env.SEED_ADMIN_EMAIL?.trim();
  if (!raw) return "admin@lockshield.ae";

  const email = raw.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      `SEED_ADMIN_EMAIL in .env is "${raw}", which is not a valid email address. ` +
        `Admin accounts sign in by email — set it to something like admin@lockshield.ae, or remove the line to use that default.`
    );
  }
  return email;
}

async function main() {
  // Validated before connecting so a bad .env fails instantly, not after
  // a 30s Mongo connection timeout.
  const adminEmail = resolveAdminEmail();

  await connectDB();

  // 1. Admin User
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "lockshield-secure-2026";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Lock Shield Admin";

  let adminUser = await User.findOne({ email: adminEmail });
  if (adminUser) {
    console.log(`[seed] admin user ${adminEmail} already exists`);
  } else {
    const passwordHash = await hashPassword(adminPassword);
    adminUser = await User.create({ name: adminName, email: adminEmail, passwordHash, role: "ADMIN" });
    console.log(`[seed] created ADMIN user ${adminEmail}`);
  }

  // 2. Settings Singleton
  await Settings.findByIdAndUpdate(
    "global",
    {
      $setOnInsert: {
        siteName: "Lock Shield",
        legalName: "LOCK SHIELD Firefighting and Safety Equipment Installation LLC",
        phones: ["+971 4 272 7333", "+971 52 843 4801"],
        whatsapp: "+971 52 843 4801",
        emails: ["info@lockshield.ae", "support@lockshield.ae"],
        address: {
          poBox: "47672",
          street: "Hor Al Anz, Deira",
          locality: "Dubai",
          country: "AE",
        },
        socials: [
          { platform: "instagram", url: "https://www.instagram.com/lockshield_cart/" },
          { platform: "linkedin", url: "https://www.linkedin.com/company/lockshield" },
        ],
        partnerLinks: [
          {
            label: "Lock Shield Cart — fire safety equipment store",
            url: "https://www.lockshieldcart.com",
            rel: "noopener",
          },
          {
            label: "Shop fire extinguishers & alarm parts online",
            url: "https://www.lockshieldcart.com",
            rel: "noopener",
          },
        ],
        nav: [
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Projects", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/career" },
          { label: "Contact", href: "/contact" },
        ],
        defaultSeo: {
          title: "Lock Shield | Fire Protection & Safety Installation, Dubai UAE",
          description:
            "Lock Shield designs, installs, tests and maintains world-class fire protection systems across the UAE. Civil Defence approved. 24/7 support.",
        },
      },
    },
    // WHY runValidators: without it this upsert stored a 78-char SEO title
    // past the 70-char limit, and every later Settings save from the admin
    // was rejected with "Validation failed" because the form resends it.
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
  console.log("[seed] settings singleton ready");

  // 3. Core Services
  const servicesData = [
    {
      title: "Annual Maintenance Contract (AMC)",
      slug: "annual-maintenance-contract",
      summary:
        "Comprehensive preventative maintenance, quarterly inspections, and 24/7 emergency response for all fire protection assets.",
      order: 1,
      coverImage: { url: "/assets/images/service/service-details.webp", alt: "Annual Maintenance Contract" },
    },
    {
      title: "Designing, Drawing & Civil Defence Approval",
      slug: "designing-drawing-civil-defence-approval",
      summary:
        "Full engineering design, AutoCAD shop drawings, and hassle-free approvals from Dubai Civil Defence (DCD).",
      order: 2,
      coverImage: { url: "/assets/images/designing-1.webp", alt: "Civil Defence Approval & Drawing" },
    },
    {
      title: "FM-200 Special Fire Suppression Systems",
      slug: "fm-200-special-systems",
      summary:
        "Waterless clean agent fire extinguishing solutions protecting sensitive server rooms, data centers, and critical facilities.",
      order: 3,
      coverImage: { url: "/assets/images/service/service-1.webp", alt: "FM-200 Clean Agent System" },
    },
    {
      title: "Kitchen Fire Suppression Systems",
      slug: "kitchen-fire-suppression-systems",
      summary:
        "UL-300 certified wet chemical fire suppression safeguarding commercial kitchen hoods, ducts, and cooking appliances.",
      order: 4,
      coverImage: { url: "/assets/images/restaurants.webp", alt: "Kitchen Fire Suppression" },
    },
    {
      title: "Fire Extinguisher Refilling & Testing",
      slug: "fire-extinguisher-refilling",
      summary:
        "Authorized hydrostatic testing, refilling, and certification for CO2, DCP, foam, and water extinguishers.",
      order: 5,
      coverImage: { url: "/assets/images/about-team-fire-extinguisher.webp", alt: "Fire Extinguisher Refilling" },
    },
    {
      title: "Fire System Products Supply & Trading",
      slug: "fire-system-products-supply",
      summary:
        "Genuine certified firefighting equipment, alarm panels, smoke detectors, landing valves, and fire hoses.",
      order: 6,
      coverImage: { url: "/assets/images/service/service-4.webp", alt: "Fire Equipment Supply" },
    },
  ];

  for (const s of servicesData) {
    await Service.findOneAndUpdate(
      { slug: s.slug },
      {
        $setOnInsert: {
          title: s.title,
          slug: s.slug,
          summary: s.summary,
          order: s.order,
          coverImage: s.coverImage,
          status: "published",
          locale: "en",
          translationGroupId: nanoid(12),
          blocks: [],
        },
      },
      { upsert: true, new: true }
    );
  }
  console.log(`[seed] seeded ${servicesData.length} core services`);

  // 4. Sample Projects
  const projectsData = [
    {
      title: "Al Manara Pharmacy Fit-out",
      slug: "al-manara-pharmacy",
      scopeOfWork: ["Fire Alarm", "Sprinkler", "DCD Approval"] as const,
      client: "Al Manara Pharmacy",
      sector: "Healthcare" as const,
      emirate: "Dubai" as const,
      year: 2024,
      summary: "Turnkey fire alarm and sprinkler installation with complete Dubai Civil Defence inspection approval.",
      coverImage: { url: "/assets/images/projects/al-manara-pharmacy.webp", alt: "Al Manara Pharmacy Fit-out" },
      featured: true,
      status: "Completed" as const,
      publishStatus: "published" as const,
    },
    {
      title: "Emirates NBD Corporate Facility",
      slug: "emirates-nbd",
      scopeOfWork: ["FM-200", "Fire Alarm", "DCD Approval"] as const,
      client: "Emirates NBD",
      sector: "Banking" as const,
      emirate: "Dubai" as const,
      year: 2023,
      summary: "Clean agent FM-200 gas suppression for main server rooms and early-warning aspiration detection.",
      coverImage: { url: "/assets/images/projects/emirates-nbd.webp", alt: "Emirates NBD Facility" },
      featured: true,
      status: "Completed" as const,
      publishStatus: "published" as const,
    },
    {
      title: "Farsi Restaurant Kitchen Suppression",
      slug: "farsi-restaurant",
      scopeOfWork: ["Kitchen Suppression", "Fire Alarm", "DCD Approval"] as const,
      client: "Farsi Restaurant",
      sector: "F&B" as const,
      emirate: "Dubai" as const,
      year: 2024,
      summary: "UL-300 wet chemical kitchen hood fire suppression system with automatic gas valve shutoff.",
      coverImage: { url: "/assets/images/projects/farsi-restaurant.webp", alt: "Farsi Restaurant Fit-out" },
      featured: true,
      status: "Completed" as const,
      publishStatus: "published" as const,
    },
    {
      title: "Feetlab Retail Center",
      slug: "feetlab",
      scopeOfWork: ["Fire Alarm", "Hose Reel", "DCD Approval"] as const,
      client: "Feetlab",
      sector: "Retail" as const,
      emirate: "Dubai" as const,
      year: 2023,
      summary: "Complete retail showroom fire safety modification and annual maintenance contract handover.",
      coverImage: { url: "/assets/images/projects/feetlab.webp", alt: "Feetlab Retail Project" },
      featured: false,
      status: "Completed" as const,
      publishStatus: "published" as const,
    },
    {
      title: "Pizza Hut Restaurant Suppression",
      slug: "pizza-hut",
      scopeOfWork: ["Kitchen Suppression", "Fire Alarm", "DCD Approval"] as const,
      client: "Pizza Hut UAE",
      sector: "F&B" as const,
      emirate: "Dubai" as const,
      year: 2024,
      summary: "Kitchen fire suppression system installation and DCD annual compliance certification.",
      coverImage: { url: "/assets/images/projects/pizza-hut.webp", alt: "Pizza Hut Suppression" },
      featured: true,
      status: "Completed" as const,
      publishStatus: "published" as const,
    },
    {
      title: "The Grey Restaurant Fit-out",
      slug: "the-grey-restaurant",
      scopeOfWork: ["Kitchen Suppression", "Fire Alarm", "DCD Approval"] as const,
      client: "The Grey Restaurant",
      sector: "F&B" as const,
      emirate: "Dubai" as const,
      year: 2024,
      summary: "Architectural fire alarm integration, smoke evacuation, and commercial kitchen suppression.",
      coverImage: { url: "/assets/images/projects/grey-restaurant.webp", alt: "The Grey Restaurant" },
      featured: false,
      status: "Completed" as const,
      publishStatus: "published" as const,
    },
  ];

  for (const p of projectsData) {
    await Project.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          coverImage: p.coverImage,
          client: p.client,
          sector: p.sector,
          emirate: p.emirate,
          year: p.year,
          featured: p.featured,
          summary: p.summary,
          publishStatus: p.publishStatus,
          // WHY these two moved out of $setOnInsert: earlier seed runs wrote
          // enum-invalid values ("Hospitality & F&B", "Civil Defence Approval",
          // "Suppression"). $setOnInsert would leave those rows broken forever.
          // In $set, re-running the seed repairs them.
          scopeOfWork: p.scopeOfWork,
          status: p.status,
        },
        $setOnInsert: {
          title: p.title,
          slug: p.slug,
          body: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: p.summary }] }] },
          gallery: [],
          stats: [],
          order: 0,
          locale: "en",
          translationGroupId: nanoid(12),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
  }
  console.log(`[seed] seeded ${projectsData.length} projects`);

  // 5. Blog Categories
  const categoriesData = [
    { name: "Civil Defence Regulations", slug: "civil-defence-regulations" },
    { name: "Maintenance & AMC", slug: "maintenance-amc" },
    { name: "Fire Suppression Systems", slug: "fire-suppression-systems" },
    { name: "Fire Safety Guides", slug: "fire-safety-guides" },
  ];

  const createdCategories: Array<{ _id: unknown; slug?: string } | null> = [];
  for (const c of categoriesData) {
    const cat = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: { name: c.name, slug: c.slug } },
      { upsert: true, new: true }
    );
    createdCategories.push(cat);
  }
  console.log(`[seed] seeded ${categoriesData.length} categories`);

  // 6. Blog Posts
  const postsData = [
    {
      title: "Understanding Dubai Civil Defence (DCD) Approval for Commercial Fit-outs",
      slug: "understanding-dubai-civil-defence-approval-commercial-fitouts",
      excerpt:
        "A step-by-step guide for business owners, interior contractors, and facility managers navigating Civil Defence drawing approvals in Dubai.",
      category: createdCategories[0]?._id,
      coverImage: { url: "/assets/images/designing-1.webp", alt: "Civil Defence Drawings" },
    },
    {
      title: "Why Annual Maintenance Contracts (AMC) Are Mandatory Under UAE Fire Code",
      slug: "why-annual-maintenance-contracts-amc-mandatory-uae",
      excerpt:
        "UAE law requires quarterly inspections of fire alarm and firefighting systems. Learn the legal and safety responsibilities for building owners.",
      category: createdCategories[1]?._id,
      coverImage: { url: "/assets/images/service/service-details.webp", alt: "AMC Maintenance Inspection" },
    },
    {
      title: "Protecting Data Centers: Why FM-200 Clean Agent Suppression Outperforms Water",
      slug: "protecting-data-centers-fm-200-clean-agent-suppression",
      excerpt:
        "Water can ruin servers just as quickly as a fire. Discover how waterless gaseous suppression protects electronics without zero residue.",
      category: createdCategories[2]?._id,
      coverImage: { url: "/assets/images/service/service-1.webp", alt: "FM-200 Clean Agent System" },
    },
  ];

  for (const post of postsData) {
    await Post.findOneAndUpdate(
      { slug: post.slug },
      {
        $setOnInsert: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: post.excerpt }],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Fire safety is not merely a statutory obligation under UAE Civil Defence regulations — it is a mission-critical investment in safeguarding human life and business continuity. Working with a certified, licensed fire protection contractor ensures your drawings, equipment, and routine inspections meet the highest engineering benchmarks.",
                  },
                ],
              },
            ],
          },
          coverImage: post.coverImage,
          category: post.category,
          author: adminUser._id,
          status: "published",
          publishedAt: new Date(),
          readingTimeMinutes: 4,
          locale: "en",
          translationGroupId: nanoid(12),
        },
      },
      { upsert: true, new: true }
    );
  }
  console.log(`[seed] seeded ${postsData.length} blog posts`);

  console.log("[seed] done — all data seeded successfully!");
  process.exit(0);
}

main().catch((err: unknown) => {
  // A one-line reason beats a 40-line Mongoose/Mongo stack for the common
  // causes here (bad .env value, Mongo not running). Full stack stays
  // available behind SEED_DEBUG=1.
  console.error(`[seed] failed: ${err instanceof Error ? err.message : String(err)}`);
  if (process.env.SEED_DEBUG === "1") console.error(err);
  process.exit(1);
});
