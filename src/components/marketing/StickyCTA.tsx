import { useEffect, useState } from "react";

export function StickyCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-border bg-surface/95 px-4 py-2 shadow-lg backdrop-blur md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      } transition-all duration-300`}
      role="region"
      aria-label="Apply now"
    >
      <p className="text-sm font-medium text-foreground">
        Ready to find your university?
      </p>
      <a
        href="#apply"
        className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        Apply now
      </a>
    </div>
  );
}
