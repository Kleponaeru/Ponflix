export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading Ponflix"
      className="fixed inset-0 z-[100] min-h-dvh overflow-hidden bg-[#0d0b0c]"
    >
      <iframe
        src="/ponflix-loader.html"
        title="Ponflix loading animation"
        className="h-full min-h-dvh w-full border-0"
      />
    </div>
  );
}
