/**
 * AuraCart — 20 Collections Seeder
 * Run: npx tsx src/db/seed-collections.ts
 */
import "dotenv/config";
import { db } from "./index";
import { categories, products } from "./schema";

async function seed() {
  console.log("🌱 Seeding 20 collections...\n");

  // Clear existing
  await db.delete(products);
  await db.delete(categories);

  const cats = await db.insert(categories).values([
    { name: "New Arrivals",     slug: "new-arrivals",    description: "Just landed — fresh drops every week" },
    { name: "Trending",         slug: "trending",         description: "What everyone is buying right now" },
    { name: "Best Sellers",     slug: "best-sellers",     description: "Top rated products our customers love" },
    { name: "Electronics",      slug: "electronics",      description: "Premium consumer electronics and tech" },
    { name: "Fashion",          slug: "fashion",          description: "Designer clothing and apparel" },
    { name: "Shoes",            slug: "shoes",            description: "Luxury footwear for every occasion" },
    { name: "Watches",          slug: "watches",          description: "Swiss-made timepieces and smart watches" },
    { name: "Beauty",           slug: "beauty",           description: "Premium skincare and cosmetics" },
    { name: "Home Decor",       slug: "home-decor",       description: "Elevate your living spaces" },
    { name: "Furniture",        slug: "furniture",        description: "Designer furniture and statement pieces" },
    { name: "Kitchen",          slug: "kitchen",          description: "Professional cookware and appliances" },
    { name: "Gaming",           slug: "gaming",           description: "Next-gen gaming gear and accessories" },
    { name: "Books",            slug: "books",            description: "Curated reading for curious minds" },
    { name: "Sports",           slug: "sports",           description: "Performance sportswear and equipment" },
    { name: "Fitness",          slug: "fitness",          description: "Premium fitness equipment and gear" },
    { name: "Toys",             slug: "toys",             description: "Premium toys and educational games" },
    { name: "Groceries",        slug: "groceries",        description: "Gourmet and artisanal food items" },
    { name: "Accessories",      slug: "accessories",      description: "Scarves, belts, wallets and more" },
    { name: "Luxury",           slug: "luxury",           description: "Ultra-premium exclusive items" },
    { name: "Seasonal Offers",  slug: "seasonal-offers",  description: "Limited time deals and promotions" },
  ]).returning({ id: categories.id, slug: categories.slug });

  const catMap: Record<string, string> = {};
  cats.forEach(c => { catMap[c.slug] = c.id; });
  console.log("✅ 20 categories created");
  return catMap;
}

export { seed };

async function seedProducts(catMap: Record<string, string>) {
  console.log("🛍️  Seeding products...\n");

  const allProducts = [
    // ── NEW ARRIVALS (12) ─────────────────────────────────────────────────────
    { name:"AirPods Pro 3rd Gen", slug:"airpods-pro-3", price:"329.00", comparePrice:"399.00", brand:"Apple", stock:50, categoryId:catMap["new-arrivals"], isFeatured:true, rating:"4.9", reviewCount:312, images:["https://images.unsplash.com/photo-1606741965509-717bfa13da60?w=600"], tags:["audio","apple","wireless"], shortDescription:"Active noise cancellation with Adaptive Transparency." },
    { name:"Samsung Galaxy S25 Ultra", slug:"samsung-s25-ultra", price:"1299.00", comparePrice:"1499.00", brand:"Samsung", stock:30, categoryId:catMap["new-arrivals"], isFeatured:true, rating:"4.8", reviewCount:198, images:["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600"], tags:["smartphone","samsung","android"], shortDescription:"200MP camera, Snapdragon 8 Elite, 5000mAh." },
    { name:"Dyson Airwrap 2024", slug:"dyson-airwrap-2024", price:"649.00", brand:"Dyson", stock:25, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.7", reviewCount:145, images:["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600"], tags:["beauty","hair","dyson"], shortDescription:"Style and dry simultaneously without extreme heat." },
    { name:"Nike Air Max 2025", slug:"nike-air-max-2025", price:"189.00", comparePrice:"220.00", brand:"Nike", stock:80, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.6", reviewCount:89, images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"], tags:["shoes","nike","running"], shortDescription:"Revolutionary cushioning for all-day comfort." },
    { name:"Kindle Scribe 2024", slug:"kindle-scribe-2024", price:"369.00", brand:"Amazon", stock:40, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.5", reviewCount:67, images:["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"], tags:["books","kindle","ereader"], shortDescription:"Read and write on a 10.2\" 300ppi display." },
    { name:"Loewe Puzzle Bag 2025", slug:"loewe-puzzle-bag", price:"2850.00", brand:"Loewe", stock:8, categoryId:catMap["new-arrivals"], isFeatured:true, rating:"5.0", reviewCount:23, images:["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"], tags:["bags","luxury","leather"], shortDescription:"Iconic geometric leather bag, handcrafted in Spain." },
    { name:"LEGO Technic Supercar", slug:"lego-technic-supercar", price:"449.00", comparePrice:"499.00", brand:"LEGO", stock:35, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.8", reviewCount:156, images:["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"], tags:["toys","lego","technic"], shortDescription:"3,696 pieces. Working gearbox and V8 engine." },
    { name:"Vitamix A3500 Blender", slug:"vitamix-a3500", price:"699.00", brand:"Vitamix", stock:20, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.9", reviewCount:234, images:["https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600"], tags:["kitchen","blender","vitamix"], shortDescription:"5 program settings, digital timer, wireless connectivity." },
    { name:"Peloton Bike+ 2024", slug:"peloton-bike-plus", price:"2495.00", comparePrice:"2795.00", brand:"Peloton", stock:12, categoryId:catMap["new-arrivals"], isFeatured:true, rating:"4.7", reviewCount:445, images:["https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600"], tags:["fitness","cycling","peloton"], shortDescription:"Auto-Resistance, 24\" rotating screen, Apple GymKit." },
    { name:"PS5 Pro Bundle", slug:"ps5-pro-bundle", price:"699.00", brand:"Sony", stock:15, categoryId:catMap["new-arrivals"], isFeatured:true, rating:"4.9", reviewCount:887, images:["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600"], tags:["gaming","playstation","sony"], shortDescription:"PS5 Pro + 2 controllers + 3 games bundle." },
    { name:"Miele Robot Vacuum S9", slug:"miele-robot-s9", price:"1299.00", brand:"Miele", stock:18, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.6", reviewCount:78, images:["https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=600"], tags:["home","robot","vacuum"], shortDescription:"AI navigation, self-emptying, 180-min battery." },
    { name:"Breville Barista Express", slug:"breville-barista-express", price:"749.00", comparePrice:"899.00", brand:"Breville", stock:22, categoryId:catMap["new-arrivals"], isFeatured:false, rating:"4.8", reviewCount:342, images:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"], tags:["kitchen","coffee","espresso"], shortDescription:"Integrated grinder, precise espresso extraction." },

    // ── TRENDING (12) ─────────────────────────────────────────────────────────
    { name:"Stanley Quencher 40oz", slug:"stanley-quencher-40", price:"45.00", brand:"Stanley", stock:200, categoryId:catMap["trending"], isFeatured:false, rating:"4.8", reviewCount:5621, images:["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"], tags:["drinkware","stanley","trending"], shortDescription:"Vacuum insulated, 40oz, keeps cold 48hrs." },
    { name:"Hoka Clifton 9", slug:"hoka-clifton-9", price:"145.00", brand:"Hoka", stock:120, categoryId:catMap["trending"], isFeatured:true, rating:"4.9", reviewCount:2341, images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"], tags:["shoes","running","hoka"], shortDescription:"Max cushion, lightweight, all-day comfort." },
    { name:"Skims Sculpting Bodysuit", slug:"skims-bodysuit", price:"98.00", brand:"Skims", stock:85, categoryId:catMap["trending"], isFeatured:false, rating:"4.7", reviewCount:1876, images:["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600"], tags:["fashion","shapewear","skims"], shortDescription:"Second-skin feel, 360° smoothing technology." },
    { name:"Dyson V15 Detect", slug:"dyson-v15-detect", price:"749.00", comparePrice:"849.00", brand:"Dyson", stock:45, categoryId:catMap["trending"], isFeatured:true, rating:"4.8", reviewCount:3102, images:["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600"], tags:["home","vacuum","dyson"], shortDescription:"Laser detects invisible dust. Most powerful cordless." },
    { name:"Meta Quest 3S", slug:"meta-quest-3s", price:"299.00", brand:"Meta", stock:60, categoryId:catMap["trending"], isFeatured:true, rating:"4.7", reviewCount:1245, images:["https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600"], tags:["gaming","vr","meta"], shortDescription:"Mixed reality headset, 128GB, 3 hr battery." },
    { name:"Charlotte Tilbury Pillow Talk", slug:"charlotte-tilbury-pillow-talk", price:"36.00", brand:"Charlotte Tilbury", stock:300, categoryId:catMap["trending"], isFeatured:false, rating:"4.9", reviewCount:8934, images:["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"], tags:["beauty","lipstick","makeup"], shortDescription:"The iconic lip liner and lipstick duo. A timeless nude-pink." },
    { name:"Theragun Pro Gen 6", slug:"theragun-pro-gen6", price:"599.00", brand:"Therabody", stock:35, categoryId:catMap["trending"], isFeatured:false, rating:"4.8", reviewCount:987, images:["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"], tags:["fitness","recovery","massage"], shortDescription:"2600 RPM, OLED screen, 6 attachments, Bluetooth." },
    { name:"Lululemon Everywhere Belt Bag", slug:"lululemon-belt-bag", price:"38.00", brand:"Lululemon", stock:150, categoryId:catMap["trending"], isFeatured:false, rating:"4.8", reviewCount:4521, images:["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600"], tags:["accessories","bags","lululemon"], shortDescription:"1L capacity, water-repellent, adjustable strap." },
    { name:"Kindle Paperwhite 16GB", slug:"kindle-paperwhite-16gb", price:"159.00", comparePrice:"189.00", brand:"Amazon", stock:90, categoryId:catMap["trending"], isFeatured:false, rating:"4.7", reviewCount:6721, images:["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"], tags:["books","kindle","reading"], shortDescription:"300ppi glare-free display, weeks of battery life." },
    { name:"Hydrafacial Home Device", slug:"hydrafacial-home", price:"249.00", brand:"Hydrafacial", stock:40, categoryId:catMap["trending"], isFeatured:false, rating:"4.6", reviewCount:543, images:["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600"], tags:["beauty","skincare","device"], shortDescription:"Clinical-grade facial in 30 minutes at home." },
    { name:"Adidas Ultraboost 24", slug:"adidas-ultraboost-24", price:"190.00", brand:"Adidas", stock:95, categoryId:catMap["trending"], isFeatured:true, rating:"4.8", reviewCount:2876, images:["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"], tags:["shoes","adidas","running"], shortDescription:"Boost midsole, Primeknit+ upper, Continental rubber." },
    { name:"Ring Video Doorbell Pro 2", slug:"ring-doorbell-pro-2", price:"249.00", brand:"Ring", stock:55, categoryId:catMap["trending"], isFeatured:false, rating:"4.6", reviewCount:1234, images:["https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600"], tags:["home","security","smart"], shortDescription:"3D motion detection, head-to-toe HD video, night vision." },
  ];

  return allProducts;
}

export { seedProducts };
