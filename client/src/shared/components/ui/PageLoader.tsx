import { LoaderCircle } from "lucide-react";

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="grid min-h-[60vh] place-items-center bg-[#08090b]"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-[#e50914]" />
    </div>
  );
}
