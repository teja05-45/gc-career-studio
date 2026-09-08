import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://postgres:postgres@localhost:5432/gc_career_studio" } },
});
try {
  const leadCount = await prisma.lead.count();
  const bookingCount = await prisma.booking.count();
  const userCount = await prisma.user.count();
  console.log("LEAD COUNT:", leadCount);
  console.log("BOOKING COUNT:", bookingCount);
  console.log("USER COUNT:", userCount);
  if (leadCount > 0) {
    const leads = await prisma.lead.findMany({ take: 5, orderBy: { createdAt: "desc" } });
    console.log("RECENT LEADS:", JSON.stringify(leads, null, 2));
  }
  if (bookingCount > 0) {
    const bookings = await prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, status: true, createdAt: true } });
    console.log("RECENT BOOKINGS:", JSON.stringify(bookings, null, 2));
  }
} catch (e) {
  console.error("Database connection error:", e.message);
} finally {
  await prisma.$disconnect();
}
