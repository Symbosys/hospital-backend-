import { prisma } from "../src/prisma.js";

async function main() {
  console.log("Starting Seeding (Non-Transactional)...");

  // --- Seed Blood Bank ---
  const bloodGroups = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];
  for (const group of bloodGroups) {
    try {
      await prisma.bloodInventory.create({
        data: {
          group,
          units: Math.floor(Math.random() * 150),
          status: Math.random() > 0.8 ? "Critical" : "Optimal"
        }
      });
    } catch (e: any) {
      if (e.code === 'P2002') console.log(`Group ${group} already exists.`);
      else throw e;
    }
  }

  // --- Seed Pharmacy ---
  const pharmacyItems = [
    { itemId: "PHARM-001", name: "Paracetamol 500mg", category: "Analgesic", stock: 1200, unit: "Tablets", price: "₹45", status: "In Stock" },
    { itemId: "PHARM-002", name: "Amoxicillin 250mg", category: "Antibiotic", stock: 12, unit: "Vials", price: "₹120", status: "Low Stock" },
    { itemId: "PHARM-003", name: "Insulin Glargine", category: "Endocrine", stock: 45, unit: "Pens", price: "₹850", status: "In Stock" },
  ];
  for (const item of pharmacyItems) {
    try {
      await prisma.pharmacyItem.create({ data: item });
    } catch (e: any) {
      if (e.code === 'P2002') console.log(`Item ${item.itemId} already exists.`);
      else throw e;
    }
  }

  // --- Seed Consumables ---
  const consumables = [
    { itemId: "CON-001", name: "Disposable Syringe 5ml", category: "General", stock: 4500, status: "Optimal" },
    { itemId: "CON-002", name: "Surgical Kit - Grade A", category: "Surgical", stock: 8, status: "Critical" },
    { itemId: "CON-003", name: "Sterile Dressings", category: "General", stock: 820, status: "Optimal" },
  ];
  for (const item of consumables) {
    try {
      await prisma.consumable.create({ data: item });
    } catch (e: any) {
      if (e.code === 'P2002') console.log(`Consumable ${item.itemId} already exists.`);
      else throw e;
    }
  }

  console.log("✅ Supply Chain Seeding Completed.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
