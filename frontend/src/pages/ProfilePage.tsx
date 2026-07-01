import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Loader2, Check } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

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
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            My <span className="text-gold-gradient">Profile</span>
          </h1>
          <p className="text-white/40 text-sm">Manage your account settings</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "profile" as const, label: "Profile", icon: <User size={15} /> },
            { id: "password" as const, label: "Password", icon: <Lock size={15} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-aura-500/20 text-aura-200 border border-aura-400/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* User avatar summary */}
        <div className="glass-card rounded-3xl p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aura-400 to-aura-600 flex items-center justify-center text-white text-2xl font-bold shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{user?.name}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${user?.role === "admin" ? "badge-gold" : "badge-aura"}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {tab === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-3xl p-6 md:p-8"
          >
            <h2 className="font-semibold text-white mb-6">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5" noValidate>
              <div>
                <label htmlFor="prof-name" className="block text-sm text-white/50 mb-1.5">Full name</label>
                <input
                  id="prof-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-luxury"
                  required
                />
              </div>
              <div>
                <label htmlFor="prof-email" className="block text-sm text-white/50 mb-1.5">Email address</label>
                <input
                  id="prof-email"
                  type="email"
                  value={user?.email ?? ""}
                  className="input-luxury opacity-50 cursor-not-allowed"
                  disabled
                  title="Email cannot be changed"
                />
              </div>
              <div>
                <label htmlFor="avatar" className="block text-sm text-white/50 mb-1.5">Avatar URL</label>
                <input
                  id="avatar"
                  type="url"
                  value={form.avatar}
                  onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
                  className="input-luxury"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save Changes
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-3xl p-6 md:p-8"
          >
            <h2 className="font-semibold text-white mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5" noValidate>
              <div>
                <label htmlFor="current-pass" className="block text-sm text-white/50 mb-1.5">Current password</label>
                <input
                  id="current-pass"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  className="input-luxury"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-pass" className="block text-sm text-white/50 mb-1.5">New password</label>
                <input
                  id="new-pass"
                  type="password"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                  className="input-luxury"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-pass" className="block text-sm text-white/50 mb-1.5">Confirm new password</label>
                <input
                  id="confirm-pass"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  className="input-luxury"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !passwords.current || !passwords.newPass || !passwords.confirm}
                className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
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
