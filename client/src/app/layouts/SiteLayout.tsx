import { Outlet } from "react-router-dom";
import SiteFooter from "@/shared/components/ui/SiteFooter";

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-white">
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
