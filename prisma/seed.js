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
