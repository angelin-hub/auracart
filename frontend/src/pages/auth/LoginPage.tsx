import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const BG    = "#f9f4ef";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { setAuth } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16" style={{ background: BG }}>
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full blur-[120px] opacity-20"
          style={{ background: BLUSH }} />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-[90px] opacity-12"
          style={{ background: "#b88400" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
              <span className="text-white font-display font-bold text-base">Y</span>
            </div>
            <span className="font-display font-semibold text-2xl tracking-wide" style={{ color: DARK }}>
              Yehovah <span style={{ color: BLUSH }}>Boutique</span>
            </span>
          </Link>
          <h1 className="text-2xl font-display font-semibold mb-1.5" style={{ color: DARK }}>
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
            Sign in to your account
          </p>
        </div>

        <div className="rounded-3xl p-8"
          style={{
            background: "white",
            boxShadow: "0 8px 40px rgba(44,35,32,0.08)",
            border: "1px solid rgba(44,35,32,0.08)",
          }}>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(44,35,32,0.7)" }}>
                Email address
              </label>
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-luxury"
                autoComplete="email"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(44,35,32,0.7)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-luxury pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(44,35,32,0.4)" }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <span className="flex items-center justify-center gap-2">Sign in <ArrowRight size={16} /></span>}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "rgba(44,35,32,0.5)" }}>
              Don't have an account?{" "}
              <Link to="/auth/register"
                className="font-semibold transition-colors hover:underline"
                style={{ color: BLUSH }}>
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-2xl text-center"
          style={{ background: "rgba(44,35,32,0.04)", border: "1px solid rgba(44,35,32,0.08)" }}
        >
          <p className="text-xs" style={{ color: "rgba(44,35,32,0.4)" }}>
            Demo admin:{" "}
            <span className="font-medium" style={{ color: DARK }}>admin@auracart.com</span>
            {" "}/{" "}
            <span className="font-medium" style={{ color: DARK }}>admin123</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
