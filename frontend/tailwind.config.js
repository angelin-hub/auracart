/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          950: "#0d0a07",
          900: "#150f08",
          800: "#1e160d",
          700: "#2a1e10",
          600: "#3b2a14",
          500: "#4e3819",
          400: "#6b4e26",
          300: "#8b6a3a",
          200: "#b8934f",
          100: "#d4b896",
          50:  "#f5ede0",
        },
        gold: {
          700: "#8a6200",
          600: "#a87800",
          500: "#c99600",
          400: "#e8b000",
          300: "#FCCB06",
          200: "#fdd84a",
          100: "#fee98a",
          50:  "#fff8d6",
        },
        cream: {
          900: "#1a1510",
          800: "#2d2418",
          700: "#3f3220",
          600: "#5c4a2e",
          400: "#c4a882",
          300: "#dfc9a8",
          200: "#eddfc8",
          100: "#f6ede0",
          50:  "#fdf8f2",
        },
        aura: {
          950: "#0d0a07",
          900: "#150f08",
          800: "#1e160d",
          700: "#2a1e10",
          600: "#3b2a14",
          500: "#c99600",
          400: "#e8b000",
          300: "#FCCB06",
          200: "#fdd84a",
          100: "#fee98a",
          50:  "#fff8d6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      backgroundImage: {
        "luxury-dark": "radial-gradient(ellipse at top left, #2a1e10 0%, #150f08 40%, #0d0a07 100%)",
        "gold-shine": "linear-gradient(135deg, #c99600, #FCCB06, #e8b000, #FCCB06)",
        "card-glass": "linear-gradient(135deg, rgba(253,248,242,0.07) 0%, rgba(253,248,242,0.02) 100%)",
      },
      boxShadow: {
        "glass": "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(253,248,242,0.08)",
        "gold":  "0 0 40px rgba(252,203,6,0.25), 0 4px 20px rgba(252,203,6,0.15)",
        "card":  "0 20px 60px rgba(0,0,0,0.6)",
        "glow":  "0 0 60px rgba(252,203,6,0.15)",
      },
      animation: {
        "shimmer":   "shimmer 2s ease-in-out infinite",
        "float":     "float 7s ease-in-out infinite",
        "fade-up":   "fade-up 0.8s ease-out forwards",
        "pulse-gold":"pulse-gold 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(252,203,6,0.2)" },
          "50%":      { boxShadow: "0 0 50px rgba(252,203,6,0.5)" },
        },
      },
    },
  },
  plugins: [],
};
