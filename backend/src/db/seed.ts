/**
 * AuraCart Database Seeder
 * Run: npx tsx src/db/seed.ts
 */
import "dotenv/config";
import { db } from "./index";
import { users, categories, products } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding AuraCart database...\n");

  // ── Users ─────────────────────────────────────────────────────────────────
  console.log("Creating users...");
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("user123", 12);

  await db.insert(users).values([
    {
      email: "admin@auracart.com",
      passwordHash: adminHash,
      name: "Admin User",
      role: "admin",
      isVerified: true,
    },
    {
      email: "user@auracart.com",
      passwordHash: userHash,
      name: "Demo User",
      role: "user",
      isVerified: true,
    },
  ]).onConflictDoNothing();

  // ── Categories ────────────────────────────────────────────────────────────
  console.log("Creating categories...");
  const cats = await db.insert(categories).values([
    { name: "Watches", slug: "watches", description: "Luxury timepieces from the world's finest makers" },
    { name: "Jewelry", slug: "jewelry", description: "Fine jewelry and precious gemstones" },
    { name: "Handbags", slug: "handbags", description: "Designer handbags and leather goods" },
    { name: "Accessories", slug: "accessories", description: "Premium fashion accessories" },
    { name: "Electronics", slug: "electronics", description: "High-end consumer electronics" },
    { name: "Fragrance", slug: "fragrance", description: "Exclusive perfumes and colognes" },
  ]).onConflictDoNothing().returning({ id: categories.id, slug: categories.slug });

  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // ── Products ──────────────────────────────────────────────────────────────
  console.log("Creating products...");
  await db.insert(products).values([
    {
      name: "Royal Oak Chronograph",
      slug: "royal-oak-chronograph",
      description: "The Royal Oak Chronograph is the definitive expression of horological excellence. Hand-wound movement, 18k rose gold case, sapphire crystal.",
      shortDescription: "18k rose gold luxury chronograph with hand-wound movement.",
      price: "24500.00",
      comparePrice: "28000.00",
      brand: "AudemAura",
      stock: 5,
      categoryId: catMap["watches"],
      images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800"],
      tags: ["luxury", "watch", "rose-gold", "chronograph"],
      isFeatured: true,
      rating: "4.9",
      reviewCount: 24,
    },
    {
      name: "Celestial Diamond Necklace",
      slug: "celestial-diamond-necklace",
      description: "Crafted from 18k white gold, this stunning necklace features 2.4 carats of VS1 diamonds arranged in a celestial pattern.",
      shortDescription: "18k white gold necklace with 2.4ct VS1 diamonds.",
      price: "8900.00",
      comparePrice: "11200.00",
      brand: "LuxGems",
      stock: 8,
      categoryId: catMap["jewelry"],
      images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"],
      tags: ["diamonds", "necklace", "white-gold", "fine-jewelry"],
      isFeatured: true,
      rating: "5.0",
      reviewCount: 12,
    },
    {
      name: "Icon Leather Tote",
      slug: "icon-leather-tote",
      description: "Handcrafted from full-grain Saffiano leather, this iconic tote features gold-plated hardware and a silk-lined interior.",
      shortDescription: "Full-grain Saffiano leather tote with gold hardware.",
      price: "3200.00",
      comparePrice: "3800.00",
      brand: "MaisonLux",
      stock: 12,
      categoryId: catMap["handbags"],
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
      tags: ["leather", "tote", "designer", "handbag"],
      isFeatured: true,
      rating: "4.8",
      reviewCount: 31,
    },
    {
      name: "Prestige Over-Ear Headphones",
      slug: "prestige-over-ear-headphones",
      description: "Studio-grade wireless headphones with 40-hour battery life, active noise cancellation, and hand-stitched leather ear cups.",
      shortDescription: "Studio-grade ANC headphones with leather ear cups.",
      price: "1299.00",
      comparePrice: "1599.00",
      brand: "SonicElite",
      stock: 20,
      categoryId: catMap["electronics"],
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
      tags: ["headphones", "wireless", "anc", "audio"],
      isFeatured: true,
      rating: "4.7",
      reviewCount: 89,
    },
    {
      name: "Noir Absolu Parfum",
      slug: "noir-absolu-parfum",
      description: "A rare concentration of oud, saffron, and aged sandalwood. An extrait de parfum for the discerning collector.",
      shortDescription: "Extrait de parfum: oud, saffron, aged sandalwood.",
      price: "420.00",
      brand: "ÉlixirLab",
      stock: 30,
      categoryId: catMap["fragrance"],
      images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800"],
      tags: ["parfum", "oud", "luxury-fragrance", "unisex"],
      isFeatured: false,
      rating: "4.9",
      reviewCount: 47,
    },
    {
      name: "Aurora Silk Scarf",
      slug: "aurora-silk-scarf",
      description: "Hand-painted on pure 22-momme silk, each Aurora scarf is a unique artwork inspired by northern lights.",
      shortDescription: "Hand-painted 22-momme pure silk scarf, unique artwork.",
      price: "680.00",
      comparePrice: "820.00",
      brand: "MaisonLux",
      stock: 15,
      categoryId: catMap["accessories"],
      images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800"],
      tags: ["silk", "scarf", "hand-painted", "luxury-accessories"],
      isFeatured: true,
      rating: "4.6",
      reviewCount: 18,
    },
    {
      name: "Titanium Tourbillon",
      slug: "titanium-tourbillon",
      description: "A masterpiece of watchmaking featuring a flying tourbillon, Grade 5 titanium case, and 72-hour power reserve.",
      shortDescription: "Flying tourbillon in Grade 5 titanium, 72hr reserve.",
      price: "58000.00",
      brand: "AudemAura",
      stock: 3,
      categoryId: catMap["watches"],
      images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800"],
      tags: ["tourbillon", "titanium", "haute-horlogerie"],
      isFeatured: true,
      rating: "5.0",
      reviewCount: 6,
    },
    {
      name: "Obsidian Smart Watch",
      slug: "obsidian-smart-watch",
      description: "A fusion of Swiss precision and silicon intelligence. Sapphire glass, ceramic case, 5-day battery, health monitoring.",
      shortDescription: "Luxury smartwatch with sapphire glass and ceramic case.",
      price: "1890.00",
      comparePrice: "2200.00",
      brand: "NexusLux",
      stock: 18,
      categoryId: catMap["electronics"],
      images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800"],
      tags: ["smartwatch", "ceramic", "sapphire", "luxury-tech"],
      isFeatured: true,
      rating: "4.5",
      reviewCount: 62,
    },
  ]).onConflictDoNothing();

  console.log("\n✅ Seed complete!");
  console.log("   Admin: admin@auracart.com / admin123");
  console.log("   User:  user@auracart.com / user123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
