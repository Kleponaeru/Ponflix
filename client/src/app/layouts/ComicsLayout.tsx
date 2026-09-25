import { Outlet } from "react-router-dom";
import Navbar from "@/shared/components/ui/Navbar";

export default function ComicsLayout() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <Navbar />
      <Outlet />
    </div>
  );
}
