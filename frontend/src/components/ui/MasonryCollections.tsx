import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Star, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface CollectionCard {
  slug: string;
  name: string;
  badge?: "Trending" | "New" | "Best Seller";
  image: string;
  tagline: string;
  size: "large" | "medium" | "tall" | "small";
  accent: string;
}

const COLLECTIONS: CollectionCard[] = [
  {
    slug: "dresses",
    name: "Dresses",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    tagline: "Effortless elegance",
    size: "large",
    accent: "#c47a80",
  },
  {
    slug: "kurtis",
    name: "Kurtis",
    badge: "New",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
    tagline: "Contemporary comfort",
    size: "medium",
    accent: "#b88400",
  },
  {
    slug: "ethnic-wear",
    name: "Ethnic Wear",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80",
    tagline: "Heritage reimagined",
    size: "tall",
    accent: "#9a6800",
  },
  {
    slug: "co-ord-sets",
    name: "Co-ord Sets",
    badge: "New",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    tagline: "Ready to style",
    size: "small",
    accent: "#7a5548",
  },
  {
    slug: "sarees",
    name: "Sarees",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1617627143233-c0db46d1c4db?w=800&q=80",
    tagline: "Timeless grace",
    size: "medium",
    accent: "#d4909a",
  },
  {
    slug: "western-wear",
    name: "Western Wear",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80",
    tagline: "Modern & minimal",
    size: "large",
    accent: "#5c3d32",
  },
  {
    slug: "party-wear",
    name: "Party Wear",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    tagline: "Shine every night",
    size: "small",
    accent: "#c47a80",
  },
  {
    slug: "sale",
    name: "Sale",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    tagline: "Up to 60% off",
    size: "tall",
    accent: "#ef4444",
  },
];

const BADGE_CONFIG = {
  Trending:    { icon: <TrendingUp size={10} />, color: "#9a6800", bg: "rgba(154,104,0,0.15)" },
  New:         { icon: <Zap size={10} />,        color: "#c47a80", bg: "rgba(196,122,128,0.15)" },
  "Best Seller": { icon: <Star size={10} />,     color: "#5c3d32", bg: "rgba(92,61,50,0.15)" },
};

const HEIGHT: Record<string, string> = {
  large:  "h-[300px] sm:h-[360px]",
  medium: "h-[220px] sm:h-[260px]",
  tall:   "h-[380px] sm:h-[450px]",
  small:  "h-[180px] sm:h-[210px]",
};

function CollectionCard({ card, index }: { card: CollectionCard; index: number }) {
  const badge = card.badge ? BADGE_CONFIG[card.badge] : null;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`relative group overflow-hidden rounded-2xl cursor-pointer ${HEIGHT[card.size]}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: "#e8ddd4",
        border: "1px solid rgba(44,35,32,0.1)",
        boxShadow: "0 4px 20px rgba(44,35,32,0.08)",
      }}
    >
      <Link to={`/shop?category=${card.slug}`} className="block w-full h-full">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={card.image}
            alt={card.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            style={{ filter: "brightness(0.82) saturate(0.95)" }}
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(44,35,32,0.88) 0%, rgba(44,35,32,0.2) 50%, transparent 80%)" }}
        />

        {/* Border glow on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ boxShadow: `inset 0 0 0 1.5px ${card.accent}80` }}
        />

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 + 0.3 }}
            className="absolute top-3 left-3 z-10"
          >
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}30` }}
            >
              {badge.icon} {card.badge}
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <h3
            className="font-display font-semibold text-white mb-0.5 leading-tight"
            style={{ fontSize: card.size === "large" || card.size === "tall" ? "1.2rem" : "1rem" }}
          >
            {card.name}
          </h3>
          <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>{card.tagline}</p>

          {/* Explore button — slides up on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.22 }}
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium w-fit"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              Shop Now <ArrowRight size={11} />
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MasonryCollections() {
  const col1 = COLLECTIONS.filter((_, i) => i % 3 === 0);
  const col2 = COLLECTIONS.filter((_, i) => i % 3 === 1);
  const col3 = COLLECTIONS.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-20 px-4" style={{ background: "#f9f4ef" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px w-8" style={{ background: "rgba(44,35,32,0.2)" }} />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "#c47a80" }}>
              Shop by Category
            </p>
            <div className="h-px w-8" style={{ background: "rgba(44,35,32,0.2)" }} />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4" style={{ color: "#2c2320" }}>
            Discover Our <em>Collections</em>
          </h2>
          <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(44,35,32,0.55)" }}>
            Explore hand-curated fashion collections — from timeless ethnic wear to contemporary western styles.
          </p>
        </motion.div>

        {/* Desktop 3-col masonry */}
        <div className="hidden md:grid grid-cols-3 gap-4 items-start">
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4">
              {col.map((card, i) => (
                <CollectionCard key={card.slug} card={card} index={ci * 3 + i} />
              ))}
            </div>
          ))}
        </div>

        {/* Tablet 2-col */}
        <div className="hidden sm:grid md:hidden grid-cols-2 gap-4 items-start">
          {[
            COLLECTIONS.filter((_, i) => i % 2 === 0),
            COLLECTIONS.filter((_, i) => i % 2 === 1),
          ].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4">
              {col.map((card, i) => (
                <CollectionCard key={card.slug} card={card} index={ci * 4 + i} />
              ))}
            </div>
          ))}
        </div>

        {/* Mobile 1-col */}
        <div className="sm:hidden flex flex-col gap-4">
          {COLLECTIONS.map((card, i) => (
            <CollectionCard key={card.slug} card={card} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            to="/collections"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-medium"
          >
            <Sparkles size={15} />
            View All Collections <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
