import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: "demo-brand" },
    update: {},
    create: { name: "Demo Brand", slug: "demo-brand" },
  });

  const additionalBrands = [
    { name: "Coffee Roasters", slug: "coffee-roasters" },
    { name: "Healthy Eats", slug: "healthy-eats" },
    { name: "Tech Gadgets", slug: "tech-gadgets" },
  ];

  for (const b of additionalBrands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await prisma.qrSource.upsert({
    where: { code: "DEMO-CAN-001" },
    update: {},
    create: {
      brandId: brand.id,
      name: "Can Campaign - Batch 001",
      code: "DEMO-CAN-001",
      qrUrl: `${appUrl}/liff/join?source=DEMO-CAN-001`,
    },
  });

  for (const coupon of [
      {
        brandId: brand.id,
        title: "Welcome Coupon",
        description: "10% discount for new members",
        quota: 500,
      },
      {
        brandId: brand.id,
        title: "Free Sample",
        description: "Redeem one sample at participating stores",
        quota: 100,
      },
    ]) {
    await prisma.coupon.upsert({
      where: { brandId_title: { brandId: coupon.brandId, title: coupon.title } },
      update: {},
      create: coupon,
    });
  }

  const passwordHash = await hash("ChangeMe123!", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@example.com" },
    update: { username: "admin", passwordHash },
    create: {
      username: "admin",
      email: "admin@example.com",
      name: "MVP Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "brand@example.com" },
    update: { username: "brandadmin", passwordHash, brandId: brand.id },
    create: {
      username: "brandadmin",
      email: "brand@example.com",
      name: "Demo Brand Admin",
      passwordHash,
      role: "BRAND_ADMIN",
      brandId: brand.id,
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
