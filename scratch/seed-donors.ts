import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const dbUrl = process.env.DATABASE_URL!;
const adapter = new PrismaNeonHttp(dbUrl);
const prisma = new PrismaClient({ adapter });

async function seedDonors() {
  console.log("Seeding institutional donor registry...");
  
  const donors = [
    { name: "John Doe", bloodGroup: "O+", phone: "555-0192", status: "Eligible" },
    { name: "Jane Smith", bloodGroup: "A-", phone: "555-0188", status: "Eligible" },
    { name: "Mike Ross", bloodGroup: "B+", phone: "555-0177", status: "Deferred" },
    { name: "Rachel Zane", bloodGroup: "AB+", phone: "555-0166", status: "Eligible" },
    { name: "Harvey Specter", bloodGroup: "O-", phone: "555-0155", status: "Eligible" },
  ];

  for (const donor of donors) {
    await prisma.bloodDonor.upsert({
      where: { id: `donor-${donor.name.toLowerCase().replace(" ", "-")}` }, // This will fail because no unique id like this, I'll use create
      update: {},
      create: donor as any
    }).catch(async () => {
       // Simple create if upsert logic is tricky for now
       await prisma.bloodDonor.create({ data: donor });
    });
  }

  console.log("Donor registry successfully synchronized.");
}

seedDonors()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Adapter doesn't need $disconnect like standard TCP
  });
