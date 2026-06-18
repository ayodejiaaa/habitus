const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Delete existing data to prevent unique constraints issues
  await prisma.mediaAsset.deleteMany({});
  await prisma.inspectionReport.deleteMany({});
  await prisma.inspectionRequest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.inspectionService.deleteMany({});

  // Seed Services
  const activeService = await prisma.inspectionService.create({
    data: {
      name: "Construction Verification Inspection",
      slug: "construction-verification-inspection",
      description: "Independent construction verification for Africans in the diaspora. Helping you verify and build with confidence back home.",
      price: 350000,
      isActive: true,
      displayOrder: 1,
    },
  });

  const foundationService = await prisma.inspectionService.create({
    data: {
      name: "Foundation Inspection",
      slug: "foundation-inspection",
      description: "Verify the integrity of excavation work, foundation depth, reinforcement placement, and concrete work before construction progresses further.",
      price: 350000,
      isActive: false,
      displayOrder: 2,
    },
  });

  const preRoofService = await prisma.inspectionService.create({
    data: {
      name: "Pre-Roof Inspection",
      slug: "pre-roof-inspection",
      description: "Inspect the structure before roofing begins to ensure walls, beams, columns, and structural elements are properly executed.",
      price: 350000,
      isActive: false,
      displayOrder: 3,
    },
  });

  const postRoofService = await prisma.inspectionService.create({
    data: {
      name: "Post-Roof Inspection",
      slug: "post-roof-inspection",
      description: "Inspect roofing installation and verify workmanship, alignment, waterproofing, and overall roof quality.",
      price: 350000,
      isActive: false,
      displayOrder: 4,
    },
  });

  const preCoverService = await prisma.inspectionService.create({
    data: {
      name: "Pre-Cover Inspection",
      slug: "pre-cover-inspection",
      description: "Inspect the property just before plastering and finishing works begin. This allows hidden elements to be verified before they become inaccessible.",
      price: 350000,
      isActive: false,
      displayOrder: 5,
    },
  });

  const fullHomeService = await prisma.inspectionService.create({
    data: {
      name: "Full Home Inspection",
      slug: "full-home-inspection",
      description: "A comprehensive inspection of the entire property before occupancy or handover.",
      price: 350000,
      isActive: false,
      displayOrder: 6,
    },
  });

  // Hashing default passwords
  const clientPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("adminpassword123", 10);

  // Seed Client
  const client = await prisma.user.create({
    data: {
      name: "Chidi Okafor",
      email: "client@habitus.africa",
      password: clientPassword,
      role: "CLIENT",
    },
  });

  // Seed Admin
  const admin = await prisma.user.create({
    data: {
      name: "Habitus Admin",
      email: "admin@habitus.africa",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed finished successfully!");
  console.log(`- CLIENT: ${client.email} (password: password123)`);
  console.log(`- ADMIN:  ${admin.email} (password: adminpassword123)`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
