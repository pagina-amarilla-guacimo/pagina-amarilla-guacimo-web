const { config } = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("../src/generated/prisma");

config({ path: ".env" });

const adminName = "CamaraComercio";
const adminEmail = "camaracomercioguacimo@gmail.com";
const adminPassword = "Camara12345*";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no esta definida en .env");
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        password: passwordHash,
      },
      create: {
        name: adminName,
        email: adminEmail,
        password: passwordHash,
      },
    });

    console.log(`Admin listo con id=${admin.id} email=${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Error al sembrar admin:", error);
  process.exit(1);
});
