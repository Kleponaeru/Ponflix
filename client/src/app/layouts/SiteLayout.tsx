import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SiteFooter from "@/shared/components/ui/SiteFooter";

interface Props {
  onContentReady: () => void;
}

export default function SiteLayout({ onContentReady }: Props) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") onContentReady();
  }, [onContentReady, pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#08090b] text-white">
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
