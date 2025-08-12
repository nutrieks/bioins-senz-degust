import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  to?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  eager?: boolean;
}

export function BrandLogo({ to = "/", size = "md", showText = false, className, eager = false }: BrandLogoProps) {
  const sizeCls = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  }[size];

  const primarySrc = "/lovable-uploads/d8e53a38-4b85-41b6-9800-0deb141cf135.png";
  const secondarySrc = "/lovable-uploads/75e4eee6-f4f7-4b1f-9b0d-cccf2d719a9a.png";

  return (
    <Link
      to={to}
      aria-label="Početna"
      className={cn(
        "flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md",
        className
      )}
    >
      <img
        src={primarySrc}
        alt="Bioinstitut – senzorska analiza logo"
        className={cn(sizeCls, "w-auto hover-scale drop-shadow")}
        loading={eager ? "eager" : "lazy"}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (!img.dataset.fallback) {
            img.src = secondarySrc;
            img.dataset.fallback = "1";
          } else if (img.dataset.fallback === "1") {
            img.src = "/logo-placeholder.svg";
            img.dataset.fallback = "2";
          }
        }}
      />
      {showText && (
        <span className="font-semibold text-base md:text-lg">Bioins senzorska analiza</span>
      )}
    </Link>
  );
}
