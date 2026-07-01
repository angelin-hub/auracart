import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface CollectionCard {
  slug: string;
  name: string;
  badge?: "Trending" | "New" | "Best Seller";
  image: string;
  count: string;
  size: "large" | "medium" | "tall" | "small";
  accent: string;
}

const COLLECTIONS: CollectionCard[] = [
  {
    slug: "watches",
    name: "Luxury Watches",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    count: "12 pieces",
    size: "large",
    accent: "#FCCB06",
  },
  {
    slug: "fashion",
    name: "Fashion",
    badge: "New",
    image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80",
    count: "12 styles",
    size: "medium",
    accent: "#e879f9",
  },
  {
    slug: "electronics",
    name: "Electronics",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&q=80",
    count: "12 products",
    size: "tall",
    accent: "#60a5fa",
  },
  {
    slug: "shoes",
    name: "Shoes",
    badge: "New",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    count: "12 pairs",
    size: "small",
    accent: "#fb923c",
  },
  {
    slug: "beauty",
    name: "Beauty",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
    count: "12 items",
    size: "medium",
    accent: "#f472b6",
  },
  {
    slug: "home-decor",
    name: "Home Decor",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    count: "12 pieces",
    size: "large",
    accent: "#34d399",
  },
  {
    slug: "sports",
    name: "Sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    count: "12 items",
    size: "small",
    accent: "#22d3ee",
  },
  {
    slug: "accessories",
    name: "Luxury Bags",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    count: "12 bags",
    size: "tall",
    accent: "#FCCB06",
  },
];

const BADGE_CONFIG = {
  Trending:    { icon: <TrendingUp size={10} />, color: "#fb923c", bg: "rgba(251,146,60,0.18)" },
  New:         { icon: <Zap size={10} />,        color: "#4ade80", bg: "rgba(74,222,128,0.18)" },
  "Best Seller": { icon: <Star size={10} />,     color: "#FCCB06", bg: "rgba(252,203,6,0.18)" },
};

// Height classes per size
const HEIGHT: Record<string, string> = {
  large:  "h-[340px] sm:h-[400px]",
  medium: "h-[260px] sm:h-[300px]",
  tall:   "h-[420px] sm:h-[500px]",
  small:  "h-[200px] sm:h-[240px]",
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
      className={`relative group overflow-hidden rounded-3xl cursor-pointer ${HEIGHT[card.size]}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: "#1e160d",
        border: "1px solid rgba(252,203,6,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <Link to={`/shop?category=${card.slug}`} className="block w-full h-full">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={card.image}
            alt={card.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ filter: "brightness(0.75) saturate(0.9)" }}
          />
        </div>

        {/* Gradient overlay — always visible at bottom */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(13,10,7,0.95) 0%, rgba(13,10,7,0.4) 45%, transparent 75%)" }} />

        {/* Gold glow on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{ boxShadow: `inset 0 0 0 2px ${card.accent}60, 0 0 60px ${card.accent}20` }}
        />

        {/* Badge — top left */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07 + 0.3 }}
            className="absolute top-3.5 left-3.5 z-10"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40` }}>
              {badge.icon} {card.badge}
            </div>
          </motion.div>
        )}

        {/* Sparkle — top right */}
        <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: "rgba(252,203,6,0.15)", border: "1px solid rgba(252,203,6,0.3)" }}>
            <Sparkles size={13} style={{ color: "#FCCB06" }} />
          </div>
        </div>

        {/* Content — bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          {/* Collection name */}
          <h3 className="font-display font-bold text-cream-100 mb-0.5 leading-tight"
            style={{ fontSize: card.size === "large" || card.size === "tall" ? "1.25rem" : "1rem" }}>
            {card.name}
          </h3>
          <p className="text-[11px] text-cream-400 mb-3">{card.count}</p>

          {/* Explore button — slides up on hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold w-fit"
              style={{ background: `${card.accent}20`, color: card.accent, border: `1px solid ${card.accent}40` }}>
              Explore <ArrowRight size={12} />
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MasonryCollections() {
  // Split into 3 columns for masonry
  const col1 = COLLECTIONS.filter((_, i) => i % 3 === 0);
  const col2 = COLLECTIONS.filter((_, i) => i % 3 === 1);
  const col3 = COLLECTIONS.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3 text-gold-gradient">Curated For You</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-cream-100 mb-4">
            Shop by <span className="text-gold-gradient">Collection</span>
          </h2>
          <p className="text-cream-400 max-w-md mx-auto text-sm leading-relaxed">
            Explore our hand-curated luxury collections — from Swiss timepieces to designer fashion.
          </p>
        </motion.div>

        {/* ── Pinterest Masonry Grid ── */}
        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-4 items-start">
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4">
              {col.map((card, i) => (
                <CollectionCard key={card.slug} card={card} index={ci * 3 + i} />
              ))}
            </div>
          ))}
        </div>

        {/* Tablet: 2 columns */}
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

        {/* Mobile: 1 column */}
        <div className="sm:hidden flex flex-col gap-4">
          {COLLECTIONS.map((card, i) => (
            <CollectionCard key={card.slug} card={card} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="text-center mt-12">
          <Link to="/collections"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold">
            View All Collections <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
