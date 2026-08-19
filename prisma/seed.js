const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Services are upserted by slug, so re-running this script is always safe:
// it never deletes rows, and it never touches users, requests, or reports.
const SERVICES = [
  {
    slug: "land-property-purchase-verification",
    name: "Land & Property Purchase Verification",
    // TODO: price is a placeholder pending business decision — see AGENTS/services discussion.
    description: "Before you commit funds, know exactly what you're buying. We verify title and ownership documents (C of O, Governor's Consent, Deed of Assignment), check for encumbrances, mortgages, or pending litigation, confirm the physical boundaries on the ground match the survey plan, and investigate community/family (omo-onile) claims on the land.",
    price: 350000,
    isActive: false,
    displayOrder: 0,
  },
  {
    slug: "general-progress-inspection",
    name: "General Progress Inspection",
    description: "A single independent inspection at whatever stage your project currently stands. Ideal when you want one comprehensive check-in without waiting for a specific milestone like foundation, roofing, or finishing.",
    price: 350000,
    isActive: true,
    displayOrder: 1,
  },
  {
    slug: "foundation-inspection",
    name: "Foundation Inspection",
    description: "Verify the integrity of excavation work, foundation depth, reinforcement placement, and concrete work before construction progresses further.",
    price: 350000,
    isActive: false,
    displayOrder: 2,
  },
  {
    slug: "pre-roof-inspection",
    name: "Pre-Roof Inspection",
    description: "Inspect the structure before roofing begins to ensure walls, beams, columns, and structural elements are properly executed.",
    price: 350000,
    isActive: false,
    displayOrder: 3,
  },
  {
    slug: "post-roof-inspection",
    name: "Post-Roof Inspection",
    description: "Inspect roofing installation and verify workmanship, alignment, waterproofing, and overall roof quality.",
    price: 350000,
    isActive: false,
    displayOrder: 4,
  },
  {
    slug: "pre-cover-inspection",
    name: "Pre-Cover Inspection",
    description: "Inspect the property just before plastering and finishing works begin. This allows hidden elements to be verified before they become inaccessible.",
    price: 350000,
    isActive: false,
    displayOrder: 5,
  },
  {
    slug: "full-home-inspection",
    name: "Full Home Inspection",
    description: "A comprehensive inspection of the entire property before occupancy or handover.",
    price: 350000,
    isActive: false,
    displayOrder: 6,
  },
];

// One-time renames: maps an old slug still sitting in the DB to its new slug.
// Renaming a service's slug in SERVICES above will NOT automatically update an
// existing row (upsert is keyed by slug), so any rename must be listed here
// once. Safe to leave entries here permanently — they no-op once applied.
const SLUG_RENAMES = [
  { from: "construction-verification-inspection", to: "general-progress-inspection" },
];

async function main() {
  console.log("Seeding database...");

  for (const { from, to } of SLUG_RENAMES) {
    const oldRow = await prisma.inspectionService.findUnique({ where: { slug: from } });
    const newRowExists = await prisma.inspectionService.findUnique({ where: { slug: to } });
    if (oldRow && !newRowExists) {
      await prisma.inspectionService.update({
        where: { slug: from },
        data: { slug: to },
      });
      console.log(`Renamed service slug "${from}" -> "${to}"`);
    }
  }

  for (const service of SERVICES) {
    await prisma.inspectionService.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        // Price and isActive are business/admin decisions that may have been
        // changed via the admin UI since this seed last ran — don't clobber them.
      },
      create: service,
    });
  }

  // Demo accounts (including a full ADMIN) use hardcoded, publicly-known
  // passwords. They must never be created against a production database —
  // require an explicit opt-in to run this block outside development.
  const allowDemoUsers = process.env.NODE_ENV !== "production" || process.env.ALLOW_SEED_DEMO_USERS === "true";

  if (!allowDemoUsers) {
    console.log("Skipping demo account seeding: NODE_ENV=production and ALLOW_SEED_DEMO_USERS is not set.");
    console.log("Seed finished successfully (services only).");
    return;
  }

  const clientPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("adminpassword123", 10);

  const client = await prisma.user.upsert({
    where: { email: "client@habitus.africa" },
    update: {},
    create: {
      name: "Chidi Okafor",
      email: "client@habitus.africa",
      password: clientPassword,
      role: "CLIENT",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@habitus.africa" },
    update: {},
    create: {
      name: "Habitus Admin",
      email: "admin@habitus.africa",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed finished successfully!");
  console.log(`- CLIENT: ${client.email}`);
  console.log(`- ADMIN:  ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
