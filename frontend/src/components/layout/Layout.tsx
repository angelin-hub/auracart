import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CartDrawer from "./CartDrawer";
import SearchModal from "@/components/ui/SearchModal";
import AuraBot from "@/components/ai/AuraBot";
import { useCart } from "@/hooks/useCart";

// Pre-fetch cart silently on app load
function CartLoader() {
  useCart();
  return null;
}

export default function Layout() {
  return (
    <div className="min-h-screen">
      <CartLoader />
      <Navbar />
      <Sidebar />
      <CartDrawer />
      <SearchModal />
      <main>
        <Outlet />
      </main>
      <AuraBot />
    </div>
  );
}
