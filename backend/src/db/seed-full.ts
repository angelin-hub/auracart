/**
 * AuraCart — Full 20-category seeder
 * Run: npx tsx src/db/seed-full.ts
 */
import "dotenv/config";
import { db } from "./index";
import { categories, products, users, carts } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding full database...\n");

  // Clear old data
  await db.delete(products).catch(() => {});
  await db.delete(categories).catch(() => {});

  // ── Categories ──────────────────────────────────────────────────────────────
  const cats = await db.insert(categories).values([
    { name: "New Arrivals",    slug: "new-arrivals",    description: "Fresh drops every week" },
    { name: "Trending",        slug: "trending",         description: "What everyone is buying" },
    { name: "Best Sellers",    slug: "best-sellers",     description: "Top rated by customers" },
    { name: "Electronics",     slug: "electronics",      description: "Premium tech and gadgets" },
    { name: "Fashion",         slug: "fashion",          description: "Designer clothing" },
    { name: "Shoes",           slug: "shoes",            description: "Luxury footwear" },
    { name: "Watches",         slug: "watches",          description: "Timepieces and smartwatches" },
    { name: "Beauty",          slug: "beauty",           description: "Skincare and cosmetics" },
    { name: "Home Decor",      slug: "home-decor",       description: "Elevate your living space" },
    { name: "Furniture",       slug: "furniture",        description: "Designer furniture" },
    { name: "Kitchen",         slug: "kitchen",          description: "Cookware and appliances" },
    { name: "Gaming",          slug: "gaming",           description: "Gaming gear" },
    { name: "Books",           slug: "books",            description: "Curated reading" },
    { name: "Sports",          slug: "sports",           description: "Performance sportswear" },
    { name: "Fitness",         slug: "fitness",          description: "Fitness equipment" },
    { name: "Toys",            slug: "toys",             description: "Premium toys and games" },
    { name: "Groceries",       slug: "groceries",        description: "Gourmet food items" },
    { name: "Accessories",     slug: "accessories",      description: "Bags, belts and more" },
    { name: "Luxury",          slug: "luxury",           description: "Ultra-premium exclusives" },
    { name: "Seasonal Offers", slug: "seasonal-offers",  description: "Limited time deals" },
  ]).returning({ id: categories.id, slug: categories.slug });

  const C: Record<string, string> = {};
  cats.forEach(c => { C[c.slug] = c.id; });
  console.log(`✅ ${cats.length} categories created`);

  // ── Products ────────────────────────────────────────────────────────────────
  const p = (name: string, slug: string, price: string, comparePrice: string|null, brand: string, stock: number, cat: string, featured: boolean, rating: string, reviews: number, img: string, desc: string, tags: string[]) => ({
    name, slug, price, comparePrice: comparePrice || undefined, brand, stock,
    categoryId: C[cat], isFeatured: featured, rating, reviewCount: reviews,
    images: [img], shortDescription: desc, tags, isActive: true,
    description: desc,
  });

  const allProducts = [
    // NEW ARRIVALS
    p("AirPods Pro 3rd Gen","airpods-pro-3","329.00","399.00","Apple",50,"new-arrivals",true,"4.9",312,"https://images.unsplash.com/photo-1606741965509-717bfa13da60?w=600","ANC with Adaptive Transparency",["audio","wireless"]),
    p("Samsung Galaxy S25 Ultra","samsung-s25-ultra","1299.00","1499.00","Samsung",30,"new-arrivals",true,"4.8",198,"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600","200MP camera, Snapdragon 8 Elite",["smartphone","android"]),
    p("Dyson Airwrap 2024","dyson-airwrap-2024","649.00",null,"Dyson",25,"new-arrivals",false,"4.7",145,"https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600","Style and dry without extreme heat",["beauty","hair"]),
    p("Nike Air Max 2025","nike-air-max-2025","189.00","220.00","Nike",80,"new-arrivals",false,"4.6",89,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","Revolutionary cushioning, all-day comfort",["shoes","running"]),
    p("Loewe Puzzle Bag 2025","loewe-puzzle-bag","2850.00",null,"Loewe",8,"new-arrivals",true,"5.0",23,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Geometric leather bag, handcrafted in Spain",["bags","luxury"]),
    p("LEGO Technic Supercar","lego-technic-supercar","449.00","499.00","LEGO",35,"new-arrivals",false,"4.8",156,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","3,696 pieces, working gearbox and V8 engine",["toys","lego"]),
    p("Vitamix A3500 Blender","vitamix-a3500","699.00",null,"Vitamix",20,"new-arrivals",false,"4.9",234,"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600","5 program settings, digital timer",["kitchen","blender"]),
    p("Peloton Bike+ 2024","peloton-bike-plus","2495.00","2795.00","Peloton",12,"new-arrivals",true,"4.7",445,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","Auto-Resistance, 24-inch rotating screen",["fitness","cycling"]),
    p("PS5 Pro Bundle","ps5-pro-bundle","699.00",null,"Sony",15,"new-arrivals",true,"4.9",887,"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600","PS5 Pro + 2 controllers + 3 games",["gaming","playstation"]),
    p("Breville Barista Express","breville-barista-express","749.00","899.00","Breville",22,"new-arrivals",false,"4.8",342,"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600","Integrated grinder, precise espresso",["kitchen","coffee"]),
    p("Miele Robot Vacuum","miele-robot-vacuum","1299.00",null,"Miele",18,"new-arrivals",false,"4.6",78,"https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=600","AI navigation, self-emptying base",["home-decor","smart"]),
    p("Kindle Scribe 2024","kindle-scribe-2024","369.00",null,"Amazon",40,"new-arrivals",false,"4.5",67,"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600","Read and write on 10.2-inch 300ppi display",["books","kindle"]),
    // TRENDING
    p("Stanley Quencher 40oz","stanley-quencher","45.00",null,"Stanley",200,"trending",false,"4.8",5621,"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600","Vacuum insulated, keeps cold 48hrs",["drinkware"]),
    p("Hoka Clifton 9","hoka-clifton-9","145.00",null,"Hoka",120,"trending",true,"4.9",2341,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","Max cushion, lightweight, all-day comfort",["shoes","running"]),
    p("Dyson V15 Detect","dyson-v15","749.00","849.00","Dyson",45,"trending",true,"4.8",3102,"https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600","Laser detects invisible dust",["home-decor","vacuum"]),
    p("Meta Quest 3S","meta-quest-3s","299.00",null,"Meta",60,"trending",true,"4.7",1245,"https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600","Mixed reality headset 128GB",["gaming","vr"]),
    p("Charlotte Tilbury Pillow Talk","ct-pillow-talk","36.00",null,"Charlotte Tilbury",300,"trending",false,"4.9",8934,"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600","Iconic nude-pink lip liner and lipstick",["beauty","makeup"]),
    p("Theragun Pro Gen 6","theragun-pro","599.00",null,"Therabody",35,"trending",false,"4.8",987,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","2600 RPM, OLED screen, 6 attachments",["fitness","recovery"]),
    p("Lululemon Belt Bag","lululemon-belt-bag","38.00",null,"Lululemon",150,"trending",false,"4.8",4521,"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600","1L capacity, water-repellent strap",["accessories","bags"]),
    p("Adidas Ultraboost 24","adidas-ultraboost-24","190.00",null,"Adidas",95,"trending",true,"4.8",2876,"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600","Boost midsole, Primeknit+ upper",["shoes","running"]),
    p("Ring Doorbell Pro 2","ring-doorbell-pro","249.00",null,"Ring",55,"trending",false,"4.6",1234,"https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600","3D motion detection, HD night vision",["home-decor","smart"]),
    p("Kindle Paperwhite 16GB","kindle-paperwhite","159.00","189.00","Amazon",90,"trending",false,"4.7",6721,"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600","300ppi display, weeks of battery",["books","kindle"]),
    p("Skims Sculpting Bodysuit","skims-bodysuit","98.00",null,"Skims",85,"trending",false,"4.7",1876,"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600","Second-skin feel, 360 smoothing",["fashion","shapewear"]),
    // BEST SELLERS
    p("Apple MacBook Air M3","macbook-air-m3","1099.00","1299.00","Apple",45,"best-sellers",true,"4.9",4521,"https://images.unsplash.com/photo-1611186871525-12b019f76ab2?w=600","18-hour battery, M3 chip, 8GB RAM",["electronics","laptop"]),
    p("Sony WH-1000XM6","sony-xm6","399.00","449.00","Sony",60,"best-sellers",true,"4.9",6234,"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600","Industry-leading noise cancellation",["electronics","headphones"]),
    p("Instant Pot Duo 7-in-1","instant-pot-duo","89.00","129.00","Instant Pot",180,"best-sellers",false,"4.8",89234,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","Pressure cooker, slow cooker and more",["kitchen","cooking"]),
    p("Nintendo Switch OLED","nintendo-switch-oled","349.00",null,"Nintendo",70,"best-sellers",true,"4.8",12456,"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600","7-inch OLED screen, enhanced audio",["gaming","nintendo"]),
    p("Patagonia Better Sweater","patagonia-better-sweater","139.00",null,"Patagonia",95,"best-sellers",false,"4.8",3421,"https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600","100% recycled polyester fleece",["fashion","jacket"]),
    p("Oura Ring Gen 4","oura-ring-gen4","349.00",null,"Oura",50,"best-sellers",true,"4.7",2341,"https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=600","Sleep and health tracking, titanium ring",["fitness","wearable"]),
    p("Bose QuietComfort Earbuds","bose-qc-earbuds","279.00","329.00","Bose",75,"best-sellers",false,"4.8",7823,"https://images.unsplash.com/photo-1606741965509-717bfa13da60?w=600","CustomTune technology, 6hr per charge",["electronics","earbuds"]),
    p("Ember Mug 2","ember-mug-2","149.00",null,"Ember",130,"best-sellers",false,"4.8",12341,"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600","Temperature control, 2-hr battery",["kitchen","coffee"]),
    p("Atomic Habits","atomic-habits","27.00",null,"Penguin",500,"best-sellers",false,"4.9",45231,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","James Clear. #1 NYT bestseller",["books","self-help"]),
    p("Caudalie Vinoperfect Serum","caudalie-vinoperfect","79.00",null,"Caudalie",200,"best-sellers",false,"4.8",4521,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600","Reduces dark spots 3x vs vitamin C",["beauty","serum"]),
  ];

  const moreProducts = [
    // ELECTRONICS
    p("iPad Pro 13 M4","ipad-pro-m4","1299.00","1499.00","Apple",35,"electronics",true,"4.9",2341,"https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600","Ultra Retina XDR, M4 chip, thinnest ever",["tablet","apple"]),
    p("LG C4 65-inch OLED","lg-c4-oled","1999.00","2799.00","LG",20,"electronics",true,"4.9",1876,"https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600","Evo panel, 120Hz, Dolby Vision IQ",["tv","oled"]),
    p("DJI Mini 4 Pro","dji-mini-4-pro","759.00",null,"DJI",28,"electronics",true,"4.8",987,"https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=600","4K/60fps, 48MP, obstacle sensing",["drone","photography"]),
    p("Canon EOS R6 Mark II","canon-r6-ii","2499.00",null,"Canon",15,"electronics",true,"4.9",678,"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600","40fps burst, 4K/60p, in-body stabilization",["camera","mirrorless"]),
    p("Apple Watch Ultra 2","apple-watch-ultra2","799.00",null,"Apple",30,"electronics",true,"4.8",3421,"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600","Titanium, 36hr battery, dual GPS",["smartwatch","fitness"]),
    p("Sonos Arc Soundbar","sonos-arc","899.00",null,"Sonos",22,"electronics",false,"4.8",2134,"https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600","Dolby Atmos, 11 drivers, TruePlay",["audio","soundbar"]),
    p("Logitech MX Master 3S","logitech-mx-master","99.00","109.00","Logitech",120,"electronics",false,"4.8",8721,"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600","8000 DPI, MagSpeed scroll, USB-C",["mouse","productivity"]),
    p("Anker 200W Charger","anker-200w","89.00",null,"Anker",200,"electronics",false,"4.8",4521,"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600","Charges 4 devices at once, PPS tech",["charger","usb-c"]),
    p("Elgato Stream Deck XL","elgato-stream-deck","249.00",null,"Elgato",40,"electronics",false,"4.8",3421,"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600","32 LCD keys for stream control",["gaming","streaming"]),
    p("Jabra Evolve2 85","jabra-evolve2","449.00",null,"Jabra",30,"electronics",false,"4.7",1234,"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600","37hr battery, hybrid ANC, 10 mics",["headset","work"]),
    p("Bose SoundLink Max","bose-soundlink-max","399.00",null,"Bose",55,"electronics",false,"4.7",543,"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600","20hr battery, IP67, PartyMode",["speaker","bluetooth"]),
    p("Withings Body Comp Scale","withings-scale","199.00",null,"Withings",45,"electronics",false,"4.6",876,"https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600","Body fat, muscle mass, nerve health",["fitness","health"]),
    // FASHION
    p("Burberry Classic Trench","burberry-trench","2150.00",null,"Burberry",12,"fashion",true,"4.9",234,"https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600","Iconic gabardine trench, heritage lining",["coat","luxury"]),
    p("Levi's 501 Original Jeans","levis-501","89.00","98.00","Levi's",200,"fashion",false,"4.7",12341,"https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600","The original straight-leg jean since 1873",["jeans","denim"]),
    p("Loro Piana Cashmere Sweater","loro-piana-cashmere","1450.00",null,"Loro Piana",8,"fashion",true,"5.0",45,"https://images.unsplash.com/photo-1559181567-c3190ca9d222?w=600","Finest baby cashmere in the world",["sweater","luxury"]),
    p("The North Face Nuptse","tnf-nuptse","280.00",null,"The North Face",45,"fashion",false,"4.8",2341,"https://images.unsplash.com/photo-1544441893-675973e31985?w=600","700-fill goose down, iconic silhouette",["jacket","winter"]),
    p("Alo Yoga Leggings","alo-yoga-leggings","118.00",null,"Alo Yoga",90,"fashion",false,"4.8",4521,"https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600","Airbrush fabric, 4-way stretch",["activewear","yoga"]),
    p("Canada Goose Expedition Parka","canada-goose-parka","1295.00",null,"Canada Goose",15,"fashion",true,"4.9",543,"https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=600","Rated to -30C, 625 fill power",["parka","luxury"]),
    p("Gucci GG Logo T-Shirt","gucci-gg-tshirt","420.00",null,"Gucci",20,"fashion",true,"4.7",312,"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600","100% cotton, embroidered GG logo",["tshirt","luxury"]),
    p("Veja Campo Sneakers","veja-campo","160.00",null,"Veja",70,"fashion",false,"4.7",2134,"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600","Organic cotton, wild rubber, carbon neutral",["shoes","sustainable"]),
    p("Arket Linen Dress","arket-linen-dress","175.00",null,"Arket",50,"fashion",false,"4.6",432,"https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600","Organic linen, relaxed midi silhouette",["dress","sustainable"]),
    p("Reformation Mini Dress","reformation-dress","248.00",null,"Reformation",35,"fashion",false,"4.7",765,"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600","TENCEL viscose, adjustable straps",["dress","sustainable"]),
    // SHOES
    p("New Balance 990v6","nb-990v6","199.00",null,"New Balance",80,"shoes",true,"4.9",3421,"https://images.unsplash.com/photo-1539185441755-769473a23570?w=600","Made in USA, ENCAP midsole",["sneakers","usa"]),
    p("On Running Cloudmonster 2","on-cloudmonster","189.00",null,"On Running",65,"shoes",true,"4.8",1876,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","Double CloudTec, Helion foam, max cushion",["running","cushion"]),
    p("Birkenstock Arizona Suede","birkenstock-arizona","155.00",null,"Birkenstock",100,"shoes",false,"4.7",8765,"https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600","Cork footbed, adjustable suede straps",["sandals","summer"]),
    p("Golden Goose Hi Star","gg-hi-star","595.00",null,"Golden Goose",25,"shoes",true,"4.8",567,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","Distressed leather, handmade in Italy",["luxury","sneakers"]),
    p("Christian Louboutin Pump","louboutin-pump","745.00",null,"Christian Louboutin",12,"shoes",true,"4.9",234,"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600","100mm heel, kid leather, red sole",["heels","luxury"]),
    p("Salomon XT-6","salomon-xt6","180.00",null,"Salomon",55,"shoes",false,"4.8",2341,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","Contagrip, EnergyCell foam, Sensifit",["trail","outdoor"]),
    p("Common Projects Achilles","common-projects-achilles","470.00",null,"Common Projects",20,"shoes",true,"4.9",876,"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600","Full-grain leather, gold serial number",["luxury","minimalist"]),
    p("Asics Gel-Kayano 31","asics-kayano-31","160.00",null,"Asics",90,"shoes",false,"4.7",3421,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","PureGEL tech, 4D guidance, wide toe",["running","stability"]),
    p("UGG Classic Mini Platform","ugg-classic-mini","175.00",null,"UGG",85,"shoes",false,"4.6",4521,"https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600","Twin-face sheepskin, 3-inch platform",["boots","winter"]),
    p("Church's Pembrey Oxford","churchs-pembrey","695.00",null,"Church's",15,"shoes",true,"5.0",123,"https://images.unsplash.com/photo-1614252235316-8c857196f5e4?w=600","Northampton-made, Dainite sole",["oxford","luxury"]),
  ];

  const batch3 = [
    // WATCHES
    p("Rolex Submariner","rolex-submariner","9550.00",null,"Rolex",5,"watches",true,"5.0",89,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","300m waterproof, ceramic bezel, Oystersteel",["luxury","diving"]),
    p("AP Royal Oak Offshore","ap-royal-oak","29800.00",null,"Audemars Piguet",3,"watches",true,"5.0",34,"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600","42mm, automatic, skeletonized dial",["luxury","swiss"]),
    p("Omega Seamaster 300","omega-seamaster","5200.00","5900.00","Omega",8,"watches",true,"4.9",145,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","60m waterproof, Master Chronometer",["luxury","diving"]),
    p("TAG Heuer Carrera","tag-heuer-carrera","3800.00",null,"TAG Heuer",12,"watches",true,"4.8",234,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","42mm, sapphire crystal, COSC chronograph",["luxury","sport"]),
    p("Garmin Fenix 8","garmin-fenix-8","899.00","999.00","Garmin",40,"watches",false,"4.8",1234,"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600","Solar charging, multi-band GPS, 22-day battery",["smartwatch","outdoor"]),
    p("Seiko Presage Cocktail","seiko-presage","450.00",null,"Seiko",30,"watches",false,"4.8",876,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","Automatic, cocktail-inspired sunray dial",["dress","japanese"]),
    p("Samsung Galaxy Watch 7","samsung-watch-7","299.00","349.00","Samsung",55,"watches",false,"4.7",2341,"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600","BioActive sensor, sapphire crystal, 40hr",["smartwatch","health"]),
    p("Casio G-Shock GM2100","casio-g-shock","180.00",null,"Casio",80,"watches",false,"4.8",5432,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","Metal-covered, shock resistant, 200m",["sport","rugged"]),
    p("Breitling Navitimer B01","breitling-navitimer","9200.00",null,"Breitling",6,"watches",true,"5.0",67,"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600","In-house Calibre B01, slide rule bezel",["luxury","aviation"]),
    p("IWC Pilot Mark XX","iwc-pilot-mark","4100.00",null,"IWC",10,"watches",true,"4.9",89,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","40mm, soft-iron cage, anti-magnetic",["luxury","pilot"]),
    p("Tissot PRX Powermatic","tissot-prx","595.00",null,"Tissot",35,"watches",false,"4.8",1234,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","Integrated bracelet, 80-hr power reserve",["swiss","dress"]),
    p("Fossil Gen 7 Smartwatch","fossil-gen7","299.00","349.00","Fossil",45,"watches",false,"4.5",3421,"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600","Wear OS, heart rate, NFC payments",["smartwatch","fashion"]),
    // BEAUTY
    p("La Mer Moisturizing Cream","la-mer-cream","190.00",null,"La Mer",100,"beauty",true,"4.9",3421,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600","Cell-renewing Miracle Broth, regenerative",["skincare","luxury"]),
    p("NARS Radiant Creamy Concealer","nars-concealer","32.00",null,"NARS",400,"beauty",false,"4.8",15234,"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600","Buildable coverage, 30 shades, SPF 25",["makeup","concealer"]),
    p("Tatcha The Water Cream","tatcha-water-cream","72.00",null,"Tatcha",150,"beauty",false,"4.8",5678,"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600","Oil-free moisturizer, Japanese botanicals",["skincare","hydration"]),
    p("Sunday Riley Good Genes","sunday-riley-good-genes","85.00",null,"Sunday Riley",120,"beauty",false,"4.7",4521,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600","Lactic acid treatment, brightening",["skincare","aha"]),
    p("Drunk Elephant C-Firma Serum","de-c-firma","82.00",null,"Drunk Elephant",130,"beauty",false,"4.8",7234,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600","15% vitamin C, ferulic acid, pumpkin enzyme",["skincare","vitamin-c"]),
    p("FENTY Beauty Pro Filt'r Foundation","fenty-foundation","42.00",null,"Fenty Beauty",500,"beauty",false,"4.8",23456,"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600","50 shades, 24-hr wear, SPF 15",["makeup","foundation"]),
    p("Hourglass Ambient Lighting Palette","hourglass-palette","90.00",null,"Hourglass",80,"beauty",false,"4.8",2341,"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600","5 ambient powders, luminous finish",["makeup","highlight"]),
    p("Augustinus Bader The Rich Cream","ab-rich-cream","295.00",null,"Augustinus Bader",60,"beauty",true,"4.9",1234,"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600","TFC8 technology, cell renewal complex",["skincare","luxury"]),
    p("Olaplex No.3 Hair Perfector","olaplex-no3","30.00",null,"Olaplex",600,"beauty",false,"4.8",34521,"https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600","Repairs and strengthens hair bonds",["haircare","treatment"]),
    p("Charlotte Tilbury Magic Cream","ct-magic-cream","100.00",null,"Charlotte Tilbury",200,"beauty",true,"4.9",8765,"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600","Hyaluronic acid, peptides, rose hip oil",["skincare","celebrity"]),
    p("YSL Libre Intense EDP","ysl-libre","130.00",null,"YSL Beauty",90,"beauty",true,"4.8",3456,"https://images.unsplash.com/photo-1541643600914-78b084683702?w=600","Lavender, vanilla, woody accord",["fragrance","edp"]),
    // HOME DECOR
    p("Muuto Outline Sofa","muuto-outline-sofa","3200.00",null,"Muuto",5,"home-decor",true,"4.9",123,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Modular Scandinavian design, bouclé",["sofa","scandinavian"]),
    p("Hay AAC Chair","hay-aac-chair","650.00",null,"Hay",20,"home-decor",false,"4.8",456,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Upholstered shell, powder-coated base",["chair","danish"]),
    p("IKEA BILLY Bookcase (Gold Edition)","ikea-billy-gold","349.00",null,"IKEA",15,"home-decor",false,"4.6",2341,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Limited gold-frame edition, adjustable",["bookcase","storage"]),
    p("Flos Arco Floor Lamp","flos-arco-lamp","1850.00",null,"Flos",8,"home-decor",true,"5.0",89,"https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600","Achille Castiglioni design, Carrara marble",["lamp","italian"]),
    p("Marimekko Unikko Throw","marimekko-throw","180.00",null,"Marimekko",30,"home-decor",false,"4.8",345,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Iconic poppy print, pure cotton",["textiles","finnish"]),
    p("Aesop Reverence Hand Wash","aesop-hand-wash","39.00",null,"Aesop",200,"home-decor",false,"4.9",5678,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600","Botanical extracts, amber glass bottle",["bathroom","luxury"]),
    p("Diptyque Baies Candle 600g","diptyque-baies","110.00",null,"Diptyque",80,"home-decor",true,"4.9",3456,"https://images.unsplash.com/photo-1540932239986-30132-c3190ca9d222?w=600","Blackcurrant & rose, 70hr burn time",["candle","fragrance"]),
    p("HAY Kite Rug 200x300","hay-kite-rug","580.00",null,"Hay",12,"home-decor",false,"4.7",234,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Hand-tufted wool, geometric pattern",["rug","danish"]),
    p("Kartell Louis Ghost Chair","kartell-ghost","350.00",null,"Kartell",25,"home-decor",false,"4.8",567,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Transparent polycarbonate, Philippe Starck",["chair","design"]),
    p("Vitra Eames Lounge Chair","vitra-eames","5495.00",null,"Vitra",4,"home-decor",true,"5.0",234,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Walnut shell, hand-sewn leather cushions",["lounge","luxury"]),
    p("MENU Norm Floor Lamp","menu-norm-lamp","495.00",null,"MENU",15,"home-decor",false,"4.7",123,"https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600","Adjustable marble base, matte shade",["lamp","scandinavian"]),
    p("Zara Home Linen Duvet Set","zara-home-duvet","189.00",null,"Zara Home",40,"home-decor",false,"4.6",876,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Stonewashed linen, breathable, king size",["bedding","linen"]),
  ];

  const batch4 = [
    // FURNITURE
    p("Herman Miller Aeron Chair","herman-miller-aeron","1695.00","1945.00","Herman Miller",10,"furniture",true,"4.9",3456,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","PostureFit SL, 8Z Pellicle, size B",["ergonomic","office"]),
    p("String Shelving System","string-shelving","750.00",null,"String Furniture",8,"furniture",false,"4.8",234,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Swedish icon since 1949, wall-mounted",["shelving","scandinavian"]),
    p("Knoll Barcelona Chair","knoll-barcelona","4900.00",null,"Knoll",3,"furniture",true,"5.0",89,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Mies van der Rohe, leather and chrome",["lounge","luxury"]),
    p("IKEA Kallax Shelving Unit","ikea-kallax","149.00",null,"IKEA",50,"furniture",false,"4.6",12341,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","4x4 grid, versatile storage system",["shelving","storage"]),
    p("CB2 Abby Sectional Sofa","cb2-sectional","3499.00","3999.00","CB2",6,"furniture",true,"4.7",345,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Modular, performance fabric, USB ports",["sofa","modern"]),
    p("West Elm Marble Coffee Table","westelm-marble-table","899.00","1099.00","West Elm",12,"furniture",false,"4.7",567,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","White marble top, brass-finished base",["coffee-table","marble"]),
    p("Artek Aalto Stool E60","artek-e60","350.00",null,"Artek",20,"furniture",false,"4.9",234,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Alvar Aalto design, bent birch wood",["stool","finnish"]),
    p("Article Sven Charme Sofa","article-sven","1699.00","1999.00","Article",9,"furniture",false,"4.7",1234,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Tan charme leather, mid-century modern",["sofa","leather"]),
    p("HAY J110 Chair","hay-j110","480.00",null,"Hay",18,"furniture",false,"4.8",345,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Solid oak, woven paper cord seat",["chair","natural"]),
    p("Cassina LC4 Chaise Longue","cassina-lc4","4200.00",null,"Cassina",4,"furniture",true,"5.0",56,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Le Corbusier design, steel and leather",["chaise","luxury"]),
    p("Muuto Rest Sofa","muuto-rest-sofa","2800.00",null,"Muuto",6,"furniture",false,"4.8",123,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","High back, enveloping comfort, boucle",["sofa","danish"]),
    p("Fritz Hansen Egg Chair","fritz-hansen-egg","5600.00",null,"Fritz Hansen",3,"furniture",true,"5.0",67,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Arne Jacobsen classic, leather upholstery",["lounge","icon"]),
    // KITCHEN
    p("Le Creuset Dutch Oven 5.5qt","le-creuset-dutch-oven","420.00","480.00","Le Creuset",35,"kitchen",true,"4.9",8765,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","Cast iron, enamelled, signature red",["cookware","cast-iron"]),
    p("KitchenAid Stand Mixer Pro","kitchenaid-stand-mixer","449.00","549.00","KitchenAid",28,"kitchen",true,"4.9",23456,"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600","5.5qt, 11 attachments, 10 speeds",["mixer","baking"]),
    p("All-Clad D5 10-Piece Set","allclad-d5-set","899.00","1099.00","All-Clad",15,"kitchen",false,"4.9",3456,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","5-ply bonded stainless steel",["cookware","professional"]),
    p("Zwilling Twin Pro Knife Set","zwilling-knives","349.00","499.00","Zwilling",20,"kitchen",false,"4.8",2341,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","German steel, 7-piece block set",["knives","german"]),
    p("Nespresso Vertuo Next","nespresso-vertuo","199.00","249.00","Nespresso",60,"kitchen",false,"4.7",12345,"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600","Centrifusion tech, 5 cup sizes, WiFi",["coffee","pods"]),
    p("GreenPan Venice Pro 12pc","greenpan-venice","349.00","449.00","GreenPan",25,"kitchen",false,"4.7",3456,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","Thermolon ceramic, PFAS-free, hard anodized",["cookware","healthy"]),
    p("Oxo Good Grips 20-Piece","oxo-good-grips","149.00",null,"OXO",50,"kitchen",false,"4.7",8765,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","Ergonomic handles, soft grips, dishwasher safe",["utensils","everyday"]),
    p("Smeg 50s Retro Toaster","smeg-toaster","139.00",null,"Smeg",40,"kitchen",false,"4.7",4521,"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600","2-slot, 6 browning levels, cream",["toaster","retro"]),
    p("Bodum Chambord French Press","bodum-french-press","49.00",null,"Bodum",120,"kitchen",false,"4.8",9876,"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600","8 cup, chrome, heat-resistant glass",["coffee","french-press"]),
    p("Vitamix E310 Explorian","vitamix-e310","349.00","499.00","Vitamix",30,"kitchen",false,"4.9",5432,"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600","10 variable speeds, 48oz container",["blender","professional"]),
    p("Staub Cast Iron Braiser","staub-braiser","350.00",null,"Staub",18,"kitchen",false,"4.9",2341,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","3.5qt, black matte enamel, self-basting",["cookware","braiser"]),
  ];

  const batch5 = [
    // GAMING
    p("Xbox Series X","xbox-series-x","499.00",null,"Microsoft",20,"gaming",true,"4.8",12345,"https://images.unsplash.com/photo-1607016284318-d1a620960cf1?w=600","12 teraflops, 1TB SSD, 4K/120fps",["console","microsoft"]),
    p("Razer DeathAdder V3 Pro","razer-deathadder","149.00","169.00","Razer",80,"gaming",false,"4.9",5432,"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600","Focus Pro 30K sensor, 90hr battery",["mouse","esports"]),
    p("Corsair K100 Air Keyboard","corsair-k100","249.00",null,"Corsair",45,"gaming",false,"4.7",2341,"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600","OPX optical switches, ultra-thin, wireless",["keyboard","mechanical"]),
    p("SteelSeries Arctis Nova Pro","steelseries-arctis","349.00",null,"SteelSeries",35,"gaming",false,"4.8",3456,"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600","ANC, hot-swap battery, multi-system",["headset","wireless"]),
    p("ASUS ROG Swift OLED 27\"","asus-rog-oled","799.00","999.00","ASUS",18,"gaming",true,"4.9",1234,"https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600","1440p, 240Hz, 0.03ms, G-Sync Ultimate",["monitor","oled"]),
    p("Steam Deck OLED 512GB","steam-deck-oled","549.00",null,"Valve",30,"gaming",true,"4.9",8765,"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600","7.4-inch HDR OLED, 50Whr battery",["handheld","pc"]),
    p("Secretlab Titan Evo XL","secretlab-titan","549.00","649.00","Secretlab",15,"gaming",false,"4.8",7654,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","4D armrests, magnetic headrest, cold foam",["chair","ergonomic"]),
    p("Logitech G Pro X Superlight 2","logitech-gpro","159.00",null,"Logitech",60,"gaming",false,"4.9",4321,"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600","HERO 2 sensor, 63g, 95hr battery",["mouse","lightweight"]),
    p("Alienware AW3423DW Monitor","alienware-qd-oled","1299.00","1599.00","Dell",10,"gaming",true,"4.8",876,"https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600","34-inch QD-OLED, 175Hz, G-Sync Ultimate",["monitor","ultrawide"]),
    p("Xbox Elite Controller Series 2","xbox-elite-2","179.00",null,"Microsoft",40,"gaming",false,"4.8",9876,"https://images.unsplash.com/photo-1607016284318-d1a620960cf1?w=600","Adjustable tension, 40hr battery, USB-C",["controller","pro"]),
    p("HyperX Cloud Alpha Wireless","hyperx-cloud-alpha","199.00","229.00","HyperX",50,"gaming",false,"4.8",5432,"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600","300hr battery, DTS Headphone:X",["headset","300hr"]),
    p("Backbone One PS Edition","backbone-one","99.00",null,"Backbone",70,"gaming",false,"4.7",3456,"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600","PlayStation layout, passthrough charging",["mobile","controller"]),
    // BOOKS
    p("The Creative Act — Rick Rubin","creative-act-rubin","32.00",null,"Penguin",300,"books",true,"4.9",12345,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","A way of being by the legendary producer",["creativity","philosophy"]),
    p("Same as Ever — Morgan Housel","same-as-ever","28.00",null,"Harriman House",250,"books",false,"4.8",8765,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Timeless lessons on risk and human behaviour",["finance","wisdom"]),
    p("Demon Copperhead — Barbara Kingsolver","demon-copperhead","29.00",null,"HarperCollins",200,"books",false,"4.8",5432,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Pulitzer Prize winner. Modern Dickens retelling",["fiction","literary"]),
    p("The Covenant of Water","covenant-of-water","30.00",null,"Grove Press",180,"books",false,"4.8",4321,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Three generations in South India. Epic saga",["fiction","historical"]),
    p("Fourth Wing","fourth-wing","28.00",null,"Red Tower Books",500,"books",true,"4.8",45231,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Dragons, magic, romance. #1 bestseller",["fantasy","romance"]),
    p("Outlive — Peter Attia","outlive-attia","30.00",null,"Harmony Books",350,"books",true,"4.9",23456,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","The science and art of longevity",["health","longevity"]),
    p("Slow Productivity — Cal Newport","slow-productivity","28.00",null,"Portfolio",280,"books",false,"4.7",6543,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","A lost art of accomplishment without burnout",["productivity","work"]),
    p("The Light We Carry — Michelle Obama","light-we-carry","29.00",null,"Crown",220,"books",false,"4.8",9876,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Tools and practices for a better life",["memoir","inspiration"]),
    p("Chip War — Chris Miller","chip-war","28.00",null,"Scribner",160,"books",false,"4.8",7654,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","The fight for the world's most critical tech",["technology","history"]),
    p("Hell's Kitchen Cookbook","hells-kitchen-cookbook","45.00",null,"Hachette",120,"books",false,"4.7",3456,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Gordon Ramsay's ultimate recipe collection",["cooking","celebrity"]),
    p("Sapiens Illustrated Edition","sapiens-illustrated","55.00",null,"Harper Collins",80,"books",true,"4.9",5678,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","Full-colour illustrated special edition",["history","science"]),
    p("Good Energy — Casey Means","good-energy","28.00",null,"Avery",200,"books",false,"4.8",4321,"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600","The surprising connection between metabolism and health",["health","wellness"]),
    // SPORTS
    p("Wilson Pro Staff RF97 Racket","wilson-rf97","249.00",null,"Wilson",25,"sports",true,"4.9",876,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","Roger Federer signature, 97sq in, 340g",["tennis","professional"]),
    p("Titleist Pro V1x Golf Balls","titleist-prov1x","54.00",null,"Titleist",200,"sports",false,"4.9",5432,"https://images.unsplash.com/photo-1589455351898-ccc2e0ce4be1?w=600","Dozen pack, 4-piece urethane construction",["golf","balls"]),
    p("Callaway Paradym Driver","callaway-paradym","599.00","699.00","Callaway",20,"sports",true,"4.8",1234,"https://images.unsplash.com/photo-1589455351898-ccc2e0ce4be1?w=600","Triaxial carbon, AI-designed face, 460cc",["golf","driver"]),
    p("Speedo LZR Racer Elite 2","speedo-lzr","220.00",null,"Speedo",35,"sports",false,"4.8",567,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","Water-repellent, FINA approved, bonded seams",["swimming","performance"]),
    p("Head Gravity Pro Tennis Racket","head-gravity-pro","229.00",null,"Head",30,"sports",false,"4.7",876,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","100sq in, 285g, Graphene 360+",["tennis","control"]),
    p("Yonex Astrox 100 ZZ Badminton","yonex-astrox","240.00",null,"Yonex",25,"sports",false,"4.9",432,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","Rotational Generator, Namd shaft",["badminton","professional"]),
    p("Rawlings Pro Preferred Glove","rawlings-glove","399.00",null,"Rawlings",15,"sports",false,"4.9",234,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","Kip leather, heart of the hide quality",["baseball","glove"]),
    p("Spalding NBA Official Game Ball","spalding-nba","169.00",null,"Spalding",40,"sports",false,"4.8",1234,"https://images.unsplash.com/photo-1589880926456-41fce86fcb5b?w=600","Full-grain leather, NBA official size 7",["basketball","official"]),
    p("Babolat Pure Aero Tennis Racket","babolat-pure-aero","229.00",null,"Babolat",28,"sports",false,"4.8",765,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","100sq in, FSI tech, Rafa Nadal signature",["tennis","spin"]),
    p("TaylorMade Qi10 Irons","taylormade-qi10","1299.00","1499.00","TaylorMade",12,"sports",true,"4.8",543,"https://images.unsplash.com/photo-1589455351898-ccc2e0ce4be1?w=600","8-piece set, 4-PW+AW, Speed Pocket",["golf","irons"]),
    p("Under Armour HOVR Sonic 6","ua-hovr-sonic","130.00",null,"Under Armour",65,"sports",false,"4.6",2341,"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600","Connected running shoe, 0-gravity foam",["running","smart"]),
    p("Everlast Pro Style Training Gloves","everlast-gloves","49.00",null,"Everlast",100,"sports",false,"4.7",5432,"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600","16oz, full-grain leather, attached thumb",["boxing","training"]),
  ];

  const batch6 = [
    // FITNESS
    p("Peloton Tread+","peloton-tread-plus","4295.00","4995.00","Peloton",6,"fitness",true,"4.7",876,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","33-inch screen, 23 mph max, auto-incline",["treadmill","connected"]),
    p("Bowflex SelectTech 552","bowflex-selecttech","349.00","429.00","Bowflex",20,"fitness",true,"4.8",12345,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","Adjustable 5–52.5 lbs, replaces 15 dumbbells",["dumbbells","adjustable"]),
    p("Rogue Ohio Bar","rogue-ohio-bar","350.00",null,"Rogue",15,"fitness",true,"4.9",3456,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","Tensile strength 190,000 PSI, bare steel",["barbell","powerlifting"]),
    p("NordicTrack Commercial 1750","nordictrack-1750","1999.00","2499.00","NordicTrack",8,"fitness",false,"4.7",2341,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","iFIT, 14-inch HD screen, 12% incline",["treadmill","smart"]),
    p("Assault Fitness AirBike Elite","assault-airbike","999.00",null,"Assault Fitness",10,"fitness",false,"4.9",876,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","Unlimited resistance, console, commercial grade",["cardio","hiit"]),
    p("Whoop 4.0 Strap","whoop-4","239.00",null,"Whoop",60,"fitness",false,"4.7",5432,"https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=600","24/7 health monitoring, recovery score",["wearable","recovery"]),
    p("TRX PRO4 Suspension Trainer","trx-pro4","199.00","249.00","TRX",50,"fitness",false,"4.8",4321,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","Door anchor + xtender + 10 exercises guide",["suspension","bodyweight"]),
    p("Lululemon The (Small) Yoga Mat","lulu-yoga-mat","88.00",null,"Lululemon",90,"fitness",false,"4.8",8765,"https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600","3.5mm, natural rubber, non-slip",["yoga","mat"]),
    p("Garmin Forerunner 965","garmin-fr965","649.00",null,"Garmin",35,"fitness",true,"4.8",2341,"https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600","AMOLED, multi-band GPS, HRV tracking",["gps-watch","triathlon"]),
    p("Mirror (Lululemon) Home Gym","lulu-mirror","1495.00","1995.00","Lululemon",7,"fitness",true,"4.6",876,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","Interactive mirror, 50+ live classes/day",["smart-mirror","classes"]),
    p("Manduka PRO Yoga Mat","manduka-pro","130.00",null,"Manduka",60,"fitness",false,"4.9",5432,"https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600","6mm, lifetime guarantee, dense cushion",["yoga","professional"]),
    p("Theraband CLX Resistance Bands","theraband-clx","39.00",null,"Theraband",150,"fitness",false,"4.7",8765,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","5-loop design, 11 resistance levels",["bands","rehab"]),
    // TOYS
    p("LEGO Icons Botanicals Orchid","lego-orchid","49.00",null,"LEGO",80,"toys",false,"4.9",12345,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","608 pieces, home decor display set",["lego","adults"]),
    p("Melissa & Doug Wooden Farm","md-wooden-farm","89.00",null,"Melissa & Doug",45,"toys",false,"4.8",3456,"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600","Barnyard playset with 9 animals",["wooden","educational"]),
    p("Hot Wheels Ultimate Garage","hot-wheels-garage","149.00","179.00","Hot Wheels",30,"toys",false,"4.7",5432,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","140 cars capacity, auto-elevator, spiral",["cars","track"]),
    p("Barbie Dreamhouse 2024","barbie-dreamhouse","239.00","269.00","Mattel",25,"toys",true,"4.7",8765,"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600","75+ accessories, 3 floors, lights & sounds",["dolls","house"]),
    p("Play-Doh Kitchen Creations","playdoh-kitchen","49.00",null,"Hasbro",100,"toys",false,"4.7",6543,"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600","Super Colorful Kitchen Set, 20 cans",["creative","play"]),
    p("Osmo Genius Starter Kit","osmo-genius-kit","99.00","119.00","Osmo",35,"toys",true,"4.8",2341,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","5 educational games, iPad compatible",["educational","stem"]),
    p("Fisher-Price Learning Walker","fisher-price-walker","39.00",null,"Fisher-Price",120,"toys",false,"4.7",12345,"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600","Sit-to-stand, lights and music, removable panel",["baby","learning"]),
    p("Ravensburger 5000 Piece Puzzle","ravensburger-5000","69.00",null,"Ravensburger",40,"toys",false,"4.9",3456,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","Precious moments design, quality cut pieces",["puzzle","family"]),
    p("Sphero BOLT App Robot","sphero-bolt","149.00","179.00","Sphero",25,"toys",true,"4.7",1234,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","STEM robot, LED matrix, programmable",["stem","coding"]),
    p("Schleich Horse Club Set","schleich-horses","79.00",null,"Schleich",55,"toys",false,"4.8",4321,"https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600","7-piece stable set, hand-painted figures",["animals","figurines"]),
    p("LEGO Star Wars Millennium Falcon","lego-millennium-falcon","849.00",null,"LEGO",10,"toys",true,"5.0",8765,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","7,541 pieces, ultimate collector series",["lego","starwars"]),
    p("Exploding Kittens Card Game","exploding-kittens","29.00",null,"Exploding Kittens",200,"toys",false,"4.7",23456,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","Fast-paced strategy, 2-5 players",["card-game","party"]),
    // GROCERIES
    p("Beluga Caviar 50g","beluga-caviar","299.00",null,"Petrossian",20,"groceries",true,"5.0",234,"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600","Wild-caught, sustainable, hand-selected",["luxury","seafood"]),
    p("Manuka Honey MGO 1717+","manuka-honey-1717","149.00",null,"Comvita",30,"groceries",true,"4.9",876,"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600","Certified UMF 25+, 250g, New Zealand",["honey","superfood"]),
    p("Kobe Wagyu A5 Beef 200g","kobe-wagyu-a5","189.00",null,"Kobe Beef Japan",15,"groceries",true,"5.0",123,"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600","Authentic Kobe, marble score 12, certified",["meat","luxury"]),
    p("Mariage Frères Earl Grey Imperial","mariage-earl-grey","35.00",null,"Mariage Frères",80,"groceries",false,"4.9",1234,"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600","100g tin, bergamot, French tea house",["tea","luxury"]),
    p("La Quercia Prosciutto Americano","la-quercia-prosciutto","45.00",null,"La Quercia",40,"groceries",false,"4.8",543,"https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=600","24-month aged, heritage breed pork",["charcuterie","artisan"]),
    p("Valrhona Guanaja 70% Chocolate","valrhona-guanaja","29.00",null,"Valrhona",100,"groceries",false,"4.9",2341,"https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600","3kg professional block, intense dark",["chocolate","professional"]),
    p("Grey Poupon Dijon Mustard Set","grey-poupon-set","39.00",null,"Grey Poupon",60,"groceries",false,"4.7",876,"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600","3-bottle gift set, original recipe 1866",["condiments","gift"]),
    p("Nespresso Vertuo Coffee Pods","nespresso-pods","45.00",null,"Nespresso",300,"groceries",false,"4.8",12345,"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600","50-capsule variety pack, 10 blends",["coffee","pods"]),
    p("Lurpak Cultured Butter 500g","lurpak-butter","18.00",null,"Lurpak",150,"groceries",false,"4.9",5432,"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600","Danish churned, slightly salted, premium",["dairy","baking"]),
    p("Rao's Homemade Marinara Sauce","raos-marinara","10.00",null,"Rao's",400,"groceries",true,"4.9",34521,"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600","24oz, no sugar added, slow-cooked",["pasta","sauce"]),
    p("Truff Black Truffle Hot Sauce","truff-hot-sauce","36.00",null,"Truff",120,"groceries",true,"4.8",8765,"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600","Ripe chili peppers, black truffle, agave nectar",["hot-sauce","luxury"]),
    p("Noosa Lemon Curd Yogurt","noosa-yogurt","7.00",null,"Noosa",200,"groceries",false,"4.8",6543,"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600","8oz, whole milk, Australian-style",["dairy","yogurt"]),
    // ACCESSORIES
    p("Louis Vuitton Zippy Wallet","lv-zippy-wallet","730.00",null,"Louis Vuitton",10,"accessories",true,"5.0",345,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Monogram canvas, 18 card slots, zip-around",["wallet","luxury"]),
    p("Hermès Clic 16 Bracelet","hermes-clic-bracelet","870.00",null,"Hermès",8,"accessories",true,"5.0",123,"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600","Palladium plated, enamel, H logo clasp",["bracelet","luxury"]),
    p("Gucci GG Belt 38mm","gucci-gg-belt","450.00",null,"Gucci",15,"accessories",true,"4.9",567,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","GG buckle, smooth leather, 85-110cm",["belt","luxury"]),
    p("Ray-Ban Aviator Classic","rayban-aviator","161.00",null,"Ray-Ban",120,"accessories",false,"4.8",23456,"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600","Polarized, G-15 crystal lens, gold frame",["sunglasses","classic"]),
    p("Tiffany & Co HardWear Necklace","tiffany-hardwear","600.00",null,"Tiffany & Co",12,"accessories",true,"5.0",234,"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600","Sterling silver, link chain, 16-inch",["necklace","luxury"]),
    p("Bottega Veneta Card Holder","bottega-card-holder","390.00",null,"Bottega Veneta",18,"accessories",true,"4.9",189,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Intrecciato leather, 6 card slots",["wallet","weave"]),
    p("Tom Ford Sunglasses FT0237","tom-ford-ft0237","395.00",null,"Tom Ford",25,"accessories",true,"4.8",456,"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600","Gradient lenses, acetate frame, gold TF logo",["sunglasses","luxury"]),
    p("Acne Studios Wool Scarf","acne-studios-scarf","220.00",null,"Acne Studios",30,"accessories",false,"4.8",876,"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600","100% wool, fringed, classic check",["scarf","designer"]),
    p("Saint Laurent Card Case","ysl-card-case","295.00",null,"Saint Laurent",20,"accessories",false,"4.8",345,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Smooth leather, 6 slots, embossed logo",["wallet","minimalist"]),
    p("Longchamp Le Pliage Tote M","longchamp-le-pliage","160.00",null,"Longchamp",50,"accessories",false,"4.7",5432,"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600","Foldable nylon, leather handles, iconic",["bag","tote"]),
    p("Gentle Monster Heizer 01","gentle-monster-heizer","360.00",null,"Gentle Monster",22,"accessories",true,"4.8",876,"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600","Statement frames, dark lens, Korean design",["sunglasses","editorial"]),
    p("Globe-Trotter 21-inch Trolley","globe-trotter-trolley","1450.00",null,"Globe-Trotter",8,"accessories",true,"4.9",123,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Vulcanised fibreboard, brass fittings, British made",["luggage","luxury"]),
    // LUXURY
    p("Patek Philippe Calatrava","patek-calatrava","28500.00",null,"Patek Philippe",2,"luxury",true,"5.0",56,"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600","39mm rose gold, Calibre 240, Geneva",["watches","ultra-luxury"]),
    p("Hermès Birkin 25 Togo","hermes-birkin-25","15500.00",null,"Hermès",1,"luxury",true,"5.0",34,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Togo leather, palladium hardware, Brique",["bags","investment"]),
    p("Chanel No.5 Limited Edition","chanel-no5-limited","385.00",null,"Chanel",15,"luxury",true,"5.0",234,"https://images.unsplash.com/photo-1541643600914-78b084683702?w=600","100ml EDP, anniversary bottle, aldehydic floral",["fragrance","iconic"]),
    p("Bentley x Molton Brown Gift Set","bentley-molton-brown","350.00",null,"Molton Brown",12,"luxury",false,"4.9",89,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600","Exclusive collaboration, hand wash and lotion",["gifting","premium"]),
    p("Richard Mille RM 11-03","richard-mille-rm11","198000.00",null,"Richard Mille",1,"luxury",true,"5.0",12,"https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600","Flyback, titanium, sapphire crystal",["watches","ultra-luxury"]),
    p("Loro Piana Baby Cashmere Shawl","loro-piana-shawl","2450.00",null,"Loro Piana",5,"luxury",true,"5.0",45,"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600","200x70cm, featherweight, hand-loomed",["cashmere","ultra-luxury"]),
    p("Steinway & Sons Baby Grand Model S","steinway-baby-grand","59000.00",null,"Steinway & Sons",1,"luxury",true,"5.0",23,"https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600","155cm, ebony, 3-year handcrafting",["piano","ultra-luxury"]),
    p("Rolls-Royce Ghost Floor Mat Set","rr-ghost-mats","2800.00",null,"Rolls-Royce",5,"luxury",false,"4.9",34,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","Bespoke lambswool, Spirit of Ecstasy embossed",["automotive","bespoke"]),
    p("Bvlgari Serpenti Wallet","bvlgari-serpenti","1450.00",null,"Bvlgari",8,"luxury",true,"5.0",89,"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600","Karung leather, snake head clasp, gold",["wallet","italian"]),
    p("Van Cleef & Arpels Sweet Alhambra","vca-alhambra","2650.00",null,"Van Cleef & Arpels",6,"luxury",true,"5.0",67,"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600","White gold, mother-of-pearl, bracelet",["jewelry","ultra-luxury"]),
    p("Dior Sauvage Elixir 60ml","dior-sauvage-elixir","175.00",null,"Dior",40,"luxury",true,"4.9",2341,"https://images.unsplash.com/photo-1541643600914-78b084683702?w=600","Spicy amber, lavender, sandalwood",["fragrance","elixir"]),
    p("Cartier Tank Louis Watch","cartier-tank-louis","7100.00",null,"Cartier",4,"luxury",true,"5.0",89,"https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600","29.5x22mm, yellow gold, Roman numerals",["watches","iconic"]),
    // SEASONAL OFFERS
    p("Apple HomePod (2nd Gen)","apple-homepod-2","299.00","349.00","Apple",35,"seasonal-offers",true,"4.8",3456,"https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600","S7 chip, spatial audio, room sensing",["smart-speaker","apple"]),
    p("Dyson Purifier Cool TP07","dyson-purifier-tp07","649.00","749.00","Dyson",22,"seasonal-offers",true,"4.7",2341,"https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600","HEPA H13, oscillates, room by room report",["air-purifier","fan"]),
    p("Ninja Creami Deluxe","ninja-creami","229.00","279.00","Ninja",40,"seasonal-offers",false,"4.8",8765,"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600","11-in-1, makes ice cream, gelato, sorbet",["kitchen","summer"]),
    p("GoPro Hero 13 Black","gopro-hero13","399.00","449.00","GoPro",50,"seasonal-offers",true,"4.8",4321,"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600","5.3K, HyperSmooth 7.0, 70min battery",["camera","action"]),
    p("iRobot Roomba Combo j7+","roomba-combo-j7","799.00","999.00","iRobot",18,"seasonal-offers",false,"4.7",1234,"https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=600","Mops and vacuums, self-empty, obstacle AI",["robot","home"]),
    p("Weber Genesis E-325s Grill","weber-genesis","899.00","1099.00","Weber",12,"seasonal-offers",true,"4.9",2341,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","3-burner, 669 sq-in, iGrill compatible",["outdoor","bbq"]),
    p("Coleman Steel Belted Cooler","coleman-cooler","149.00","179.00","Coleman",60,"seasonal-offers",false,"4.8",5432,"https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600","54qt, keeps cold 4 days, retro steel",["outdoor","camping"]),
    p("Lego Icons Eiffel Tower","lego-eiffel-tower","629.00",null,"LEGO",20,"seasonal-offers",true,"4.9",3456,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","10,001 pieces, 150cm tall, record-breaking",["lego","collectible"]),
    p("Cricut Maker 3 Bundle","cricut-maker-3","499.00","599.00","Cricut",25,"seasonal-offers",false,"4.8",6543,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","Cuts 300+ materials, 10x faster, 13-piece kit",["crafts","diy"]),
    p("Polaroid Now+ Gen 2","polaroid-now-plus","149.00","179.00","Polaroid",45,"seasonal-offers",false,"4.6",2341,"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600","Bluetooth, 5 lens filters, autofocus",["camera","instant"]),
    p("Beats Pill Speaker 2024","beats-pill-2024","149.00","179.00","Beats",70,"seasonal-offers",false,"4.7",4321,"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600","24hr battery, USB-C, lossless audio",["speaker","portable"]),
    p("Instant Vortex Plus 6qt Air Fryer","instant-vortex-plus","129.00","169.00","Instant Pot",55,"seasonal-offers",false,"4.7",12345,"https://images.unsplash.com/photo-1585515320310-259814833e62?w=600","6 cooking functions, ClearCook window",["kitchen","air-fryer"]),
  ];

  // Insert all products
  const combined = [...allProducts, ...moreProducts, ...batch3, ...batch4, ...batch5, ...batch6];
  
  // Insert in chunks to avoid request size limits
  const chunkSize = 30;
  let inserted = 0;
  for (let i = 0; i < combined.length; i += chunkSize) {
    const chunk = combined.slice(i, i + chunkSize);
    await db.insert(products).values(chunk as any).onConflictDoNothing();
    inserted += chunk.length;
    process.stdout.write(`   Inserted ${inserted}/${combined.length} products...\r`);
  }
  console.log(`\n✅ ${inserted} products created across 20 categories`);

  // Re-seed users
  const existing = await db.select({ id: users.id }).from(users);
  if (existing.length === 0) {
    const adminHash = await bcrypt.hash("admin123", 12);
    const userHash = await bcrypt.hash("user123", 12);
    const newUsers = await db.insert(users).values([
      { email: "admin@auracart.com", passwordHash: adminHash, name: "Admin User", role: "admin", isVerified: true },
      { email: "user@auracart.com", passwordHash: userHash, name: "Demo User", role: "user", isVerified: true },
    ]).returning({ id: users.id });
    for (const u of newUsers) {
      await db.insert(carts).values({ userId: u.id }).onConflictDoNothing();
    }
    console.log("✅ Demo users created");
  }

  console.log("\n🎉 Done! Visit http://localhost:5173/collections");
  process.exit(0);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
