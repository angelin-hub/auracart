import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Loader2, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

const DARK  = "#2c2320";
const BLUSH = "#c47a80";
const CREAM = "#f9f4ef";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<"profile" | "password">("profile");
  const [form, setForm] = useState({ name: user?.name ?? "", avatar: user?.avatar ?? "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", { name: form.name, avatar: form.avatar || undefined });
      updateUser(data.data.user);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success("Password changed successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: CREAM }}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BLUSH }}>
            Account
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: DARK }}>
            My Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(44,35,32,0.45)" }}>Manage your account settings</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "profile" as const,  label: "Profile",  icon: <User size={15} /> },
            { id: "password" as const, label: "Password", icon: <Lock size={15} /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={tab === t.id
                ? { background: "rgba(196,122,128,0.1)", color: BLUSH, border: "1px solid rgba(196,122,128,0.3)" }
                : { color: "rgba(44,35,32,0.5)", border: "1px solid transparent" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* User summary */}
        <div className="rounded-2xl p-5 mb-5 flex items-center gap-4"
          style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #c47a80, #d4909a)" }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display font-semibold text-lg" style={{ color: DARK }}>{user?.name}</p>
            <p className="text-sm" style={{ color: "rgba(44,35,32,0.45)" }}>{user?.email}</p>
            <span className="badge-blush mt-1.5 inline-block">{user?.role}</span>
          </div>
        </div>

        {tab === "profile" ? (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-6 md:p-8"
            style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
            <h2 className="font-semibold mb-6" style={{ color: DARK }}>Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5" noValidate>
              <div>
                <label htmlFor="prof-name" className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(44,35,32,0.65)" }}>Full name</label>
                <input id="prof-name" type="text" value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-luxury" required />
              </div>
              <div>
                <label htmlFor="prof-email" className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(44,35,32,0.65)" }}>Email address</label>
                <input id="prof-email" type="email" value={user?.email ?? ""}
                  className="input-luxury opacity-50 cursor-not-allowed" disabled
                  title="Email cannot be changed" />
              </div>
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(44,35,32,0.65)" }}>Avatar URL</label>
                <input id="avatar" type="url" value={form.avatar}
                  onChange={(e) => setForm(f => ({ ...f, avatar: e.target.value }))}
                  className="input-luxury" placeholder="https://example.com/avatar.jpg" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save Changes
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-6 md:p-8"
            style={{ background: "white", border: "1px solid rgba(44,35,32,0.08)" }}>
            <h2 className="font-semibold mb-6" style={{ color: DARK }}>Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5" noValidate>
              {[
                { id: "current-pass", label: "Current password", key: "current" as const, auto: "current-password" },
                { id: "new-pass",     label: "New password",     key: "newPass"  as const, auto: "new-password", min: 8 },
                { id: "confirm-pass", label: "Confirm new",      key: "confirm"  as const, auto: "new-password" },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-sm font-medium mb-1.5"
                    style={{ color: "rgba(44,35,32,0.65)" }}>{f.label}</label>
                  <input id={f.id} type="password" value={passwords[f.key]}
                    onChange={(e) => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                    className="input-luxury" autoComplete={f.auto}
                    minLength={f.min} required />
                </div>
              ))}
              <button type="submit"
                disabled={loading || !passwords.current || !passwords.newPass || !passwords.confirm}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Update Password
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
