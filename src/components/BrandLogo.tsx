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

  const logoSrc = `/lovable-uploads/729f9e61-e558-4999-88ea-282eae236430.png`;

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
        src={logoSrc}
        alt="BIOINSTITUT logo - senzorska analiza"
        className={cn(sizeCls, "w-auto hover-scale drop-shadow")}
        loading={eager ? "eager" : "lazy"}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (!img.dataset.fallback) {
            img.src = "/logo-placeholder.svg";
            img.dataset.fallback = "1";
          }
        }}
      />
      {showText && (
        <span className="font-semibold text-base md:text-lg">BIOINSTITUT - senzorska analiza</span>
      )}
    </Link>
  );
}
