import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { services } from "../lib/data/services";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding services...");
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service },
      create: { ...service },
    });
  }

  console.log("Seeding demo testimonials...");
  const testimonials = [
    {
      name: "Sample Candidate — J.M.",
      role: "Early-career, moved into product analytics",
      challenge: "Struggled to explain a non-traditional background to hiring managers.",
      approach: "Career strategy sessions plus a resume rework focused on transferable analytical work.",
      outcome: "Received two offers within eight weeks of starting the search.",
      isDemo: true,
      order: 1,
    },
    {
      name: "Sample Candidate — R.K.",
      role: "Mid-career professional, industry switch",
      challenge: "Fifteen years in one industry, unsure how to be credible in a new one.",
      approach: "Career transition planning with a rebuilt narrative and targeted outreach plan.",
      outcome: "Landed a role in the target industry within four months.",
      isDemo: true,
      order: 2,
    },
    {
      name: "Sample Candidate — A.T.",
      role: "Working professional, promotion track",
      challenge: "Kept losing final-round interviews despite strong technical skills.",
      approach: "Structured mock interviews with direct feedback on answer clarity.",
      outcome: "Received and accepted an offer after the next interview round.",
      isDemo: true,
      order: 3,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "GC Career Studio Admin";

  if (!adminEmail || !adminPassword) {
    console.warn(
      "\n⚠  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account seed.\n" +
        "   Set them in .env before running `npm run db:seed` to create the initial admin.\n"
    );
  } else {
    if (adminPassword.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: "ADMIN", name: adminName },
      create: {
        email: adminEmail,
        name: adminName,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Admin account ready: ${adminEmail} (change this password after first login)`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
