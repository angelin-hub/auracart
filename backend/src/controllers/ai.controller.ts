import { Request, Response } from "express";
import OpenAI from "openai";
import { db } from "../db";
import { products, categories } from "../db/schema";
import { eq, ilike, and, desc, gte } from "drizzle-orm";

// Only use OpenAI if a real key is set
const hasRealKey =
  !!process.env.OPENAI_API_KEY &&
  !process.env.OPENAI_API_KEY.includes("your-openai") &&
  !process.env.OPENAI_API_KEY.includes("sk-your");

const openai = hasRealKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

type AuthReq = Request & { user?: any };
type Message = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are AuraBot, an intelligent luxury shopping assistant for AuraCart — a premium e-commerce platform.

Your personality:
- Sophisticated, elegant, and helpful
- Expert in luxury products, fashion, tech, and lifestyle
- You help users discover products, compare options, and make informed decisions
- Keep responses concise but luxurious in tone

Your capabilities:
- Recommend products based on user preferences
- Help with product search and discovery
- Answer questions about orders and shopping
- Provide styling and gifting advice
- Explain product features and benefits

When recommending products, always reference real products from the catalog when possible.
Format product recommendations clearly with name, price, and key features.`;

export const chat = async (req: AuthReq, res: Response): Promise<void> => {
  const { message, history = [] } = req.body as {
    message: string;
    history: Message[];
  };

  // Check if message is product-search related
  const searchKeywords = [
    "find", "search", "looking for", "recommend", "suggest",
    "show me", "product", "buy", "shop", "need", "want",
  ];
  const isProductQuery = searchKeywords.some((kw) =>
    message.toLowerCase().includes(kw)
  );

  let productContext = "";

  if (isProductQuery) {
    // Extract potential product terms from message
    const searchTerms = message
      .replace(/find|search|looking for|show me|recommend|suggest|buy|shop/gi, "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(" ");

    if (searchTerms.length > 2) {
      const foundProducts = await db
        .select({
          name: products.name,
          price: products.price,
          shortDescription: products.shortDescription,
          brand: products.brand,
          slug: products.slug,
          rating: products.rating,
        })
        .from(products)
        .where(
          and(
            eq(products.isActive, true),
            ilike(products.name, `%${searchTerms}%`)
          )
        )
        .limit(5);

      if (foundProducts.length > 0) {
        productContext = `\n\nRelevant products from our catalog:\n${foundProducts
          .map(
            (p) =>
              `- ${p.name} by ${p.brand || "AuraCart"}: $${p.price} — ${p.shortDescription || ""} (Rating: ${p.rating}/5) [/products/${p.slug}]`
          )
          .join("\n")}`;
      }
    }
  }

  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT + productContext },
    ...history.slice(-6),
    { role: "user", content: message },
  ];

  // If real OpenAI key — use GPT
  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    });
    const reply = completion.choices[0]?.message?.content || "I apologize, I couldn't process that request.";
    res.json({ success: true, data: { message: reply } });
    return;
  }

  // Fallback: Smart rule-based responses using real product data
  const lc = message.toLowerCase();
  let reply = "";

  // Greetings
  if (/^(hi|hello|hey|namaste|hii|sup)/.test(lc)) {
    reply = "**Namaste! 🙏 Welcome to AuraCart!**\n\nI'm AuraBot, your personal luxury shopping assistant. I can help you:\n\n• 🔍 Find the perfect product\n• 💡 Get personalised recommendations\n• 🛒 Discover deals and offers\n\nWhat are you looking for today?";
  }
  // Product search queries
  else if (isProductQuery && productContext) {
    const lines = productContext.split("\n").filter(l => l.startsWith("-"));
    reply = `Here are some products that match your search:\n\n${lines.join("\n")}\n\nClick any product name to view details. Would you like more options?`;
  }
  // Price queries
  else if (/cheap|affordable|budget|under|price|cost|how much/.test(lc)) {
    const cheapProducts = await db.select({ name: products.name, price: products.price, slug: products.slug, brand: products.brand })
      .from(products).where(eq(products.isActive, true)).orderBy(products.price).limit(4);
    reply = `Here are some of our most affordable options:\n\n${cheapProducts.map(p => `- **${p.name}** by ${p.brand || "AuraCart"}: ₹${Math.round(parseFloat(p.price) * 83).toLocaleString("en-IN")} [/products/${p.slug}]`).join("\n")}\n\nWould you like me to filter by a specific category?`;
  }
  // Top/best queries
  else if (/best|top|popular|trending|recommend/.test(lc)) {
    const topProducts = await db.select({ name: products.name, price: products.price, slug: products.slug, brand: products.brand, rating: products.rating })
      .from(products).where(eq(products.isActive, true)).orderBy(desc(products.rating)).limit(4);
    reply = `Here are our **top-rated products** right now:\n\n${topProducts.map(p => `- **${p.name}** by ${p.brand || "AuraCart"} ⭐${p.rating} — ₹${Math.round(parseFloat(p.price) * 83).toLocaleString("en-IN")} [/products/${p.slug}]`).join("\n")}\n\nWant recommendations in a specific category?`;
  }
  // Category queries
  else if (/watch|timepiece|horology/.test(lc)) {
    reply = "We have an incredible **Watches** collection — from Rolex and AP to Garmin smartwatches.\n\nVisit [/shop?category=watches] to browse all timepieces. Looking for luxury Swiss or smart fitness watches?";
  } else if (/shoe|sneaker|footwear|boot/.test(lc)) {
    reply = "Our **Shoes** collection has everything from New Balance 990v6 to Christian Louboutin heels.\n\nBrowse at [/shop?category=shoes] — what style are you looking for?";
  } else if (/phone|laptop|tech|electronic|gadget/.test(lc)) {
    reply = "Check out our **Electronics** collection — featuring Apple, Samsung, Sony, DJI and more.\n\nVisit [/shop?category=electronics] to explore.";
  } else if (/fashion|cloth|dress|outfit/.test(lc)) {
    reply = "Our **Fashion** collection features Burberry, Gucci, Levi's, Canada Goose and more.\n\nBrowse at [/shop?category=fashion].";
  } else if (/beauty|skincare|makeup|cosmetic/.test(lc)) {
    reply = "Explore our **Beauty** collection with La Mer, NARS, Charlotte Tilbury, Tatcha and more.\n\nVisit [/shop?category=beauty].";
  } else if (/game|gaming|console|xbox|playstation/.test(lc)) {
    reply = "Our **Gaming** section has PS5 Pro, Xbox Series X, Steam Deck, Razer peripherals and more.\n\nCheck out [/shop?category=gaming].";
  } else if (/book|read|novel/.test(lc)) {
    reply = "Browse our curated **Books** collection — from Atomic Habits to Fourth Wing.\n\nVisit [/shop?category=books].";
  } else if (/luxury|premium|exclusive|expensive/.test(lc)) {
    reply = "Our **Luxury** collection includes Hermès Birkin, Patek Philippe, Van Cleef & Arpels, Cartier and more.\n\nExplore at [/shop?category=luxury] — truly the finest things. 💎";
  }
  // Order/delivery questions
  else if (/order|track|delivery|ship|dispatch/.test(lc)) {
    reply = "You can track your orders in **My Orders** section after logging in.\n\nWe deliver across India — standard delivery takes 3-7 business days. Express delivery available for select pincodes. Need help with a specific order?";
  }
  // Return/refund questions
  else if (/return|refund|exchange|replace/.test(lc)) {
    reply = "AuraCart offers a **30-day hassle-free return policy** on all products.\n\nSimply go to My Orders → Select Order → Request Return. Refunds are processed within 5-7 business days to your original payment method.";
  }
  // Thank you
  else if (/thank|thanks|thx|धन्यवाद/.test(lc)) {
    reply = "You're most welcome! 😊 Is there anything else I can help you find today?";
  }
  // Default
  else {
    reply = "I'd love to help you find the perfect product! You can ask me things like:\n\n• *\"Show me trending watches\"*\n• *\"Find gaming laptops under ₹1,00,000\"*\n• *\"What are your best beauty products?\"*\n\nWhat are you looking for?";
  }

  res.json({ success: true, data: { message: reply } });
};

export const getProductSuggestions = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query as { query: string };

  if (!query || query.length < 2) {
    res.json({ success: true, data: { suggestions: [] } });
    return;
  }

  const suggestions = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      images: products.images,
      brand: products.brand,
    })
    .from(products)
    .where(and(eq(products.isActive, true), ilike(products.name, `%${query}%`)))
    .limit(6);

  res.json({ success: true, data: { suggestions } });
};
