import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

const N = "#222E50";
const G = "#FCCB06";
const BG = "#EDF7F6";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strength];

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name: form.name, email: form.email, password: form.password });
      setAuth(data.data.user, data.data.token);
      toast.success("Welcome to AuraCart!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8" style={{ background: BG }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-25"
          style={{ background: G }} />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full blur-[80px] opacity-12"
          style={{ background: N }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-gold"
              style={{ background: `linear-gradient(135deg, ${G}, #fdd535)` }}>
              <Sparkles size={18} style={{ color: N }} />
            </div>
            <span className="font-display font-bold text-2xl" style={{ color: N }}>
              Aura<span style={{ color: G }}>Cart</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: N }}>Create your account</h1>
          <p className="text-sm" style={{ color: "rgba(34,46,80,0.5)" }}>Join thousands of luxury shoppers</p>
        </div>

        <div className="rounded-3xl p-8" style={{ background: "white", boxShadow: "0 8px 40px rgba(34,46,80,0.12)", border: "1px solid rgba(34,46,80,0.08)" }}>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {[
              { id: "name", label: "Full name", type: "text", key: "name" as const, placeholder: "Your name", auto: "name" },
              { id: "reg-email", label: "Email address", type: "email", key: "email" as const, placeholder: "you@example.com", auto: "email" },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium mb-1.5" style={{ color: "rgba(34,46,80,0.7)" }}>{f.label}</label>
                <input id={f.id} type={f.type} value={form[f.key]} onChange={set(f.key)}
                  placeholder={f.placeholder} className="input-luxury" autoComplete={f.auto} required />
              </div>
            ))}
            <div>
              <label htmlFor="reg-pass" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(34,46,80,0.7)" }}>Password</label>
              <div className="relative">
                <input id="reg-pass" type={showPass ? "text" : "password"} value={form.password}
                  onChange={set("password")} placeholder="Min. 8 characters" className="input-luxury pr-11"
                  autoComplete="new-password" required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(34,46,80,0.4)" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : "rgba(34,46,80,0.12)" }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(34,46,80,0.7)" }}>Confirm password</label>
              <div className="relative">
                <input id="confirm" type={showPass ? "text" : "password"} value={form.confirm}
                  onChange={set("confirm")} placeholder="Repeat password" className="input-luxury pr-11"
                  autoComplete="new-password" required />
                {form.confirm && form.password === form.confirm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    <Check size={16} />
                  </div>
                )}
              </div>
            </div>
            <motion.button type="submit"
              disabled={loading || !form.name || !form.email || !form.password || !form.confirm}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create account <ArrowRight size={16} /></>}
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "rgba(34,46,80,0.5)" }}>
              Already have an account?{" "}
              <Link to="/auth/login" className="font-semibold hover:underline" style={{ color: N }}>Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
