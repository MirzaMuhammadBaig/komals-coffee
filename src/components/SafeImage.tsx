"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "onError" | "src"> & {
  src?: string | null;
  /** Initial / short text shown in the fallback (defaults to first char of alt). */
  fallbackText?: string;
  /** Extra classes applied to the fallback container. */
  fallbackClassName?: string;
  /** Use a small icon instead of initials in the fallback. */
  iconOnly?: boolean;
};

/**
 * A drop-in replacement for next/image that gracefully degrades to a styled
 * placeholder when the remote image fails to load (404, blocked, offline).
 *
 *   <SafeImage src={item.image_url} alt={item.name} fill className="object-cover" />
 */
export default function SafeImage({
  src,
  alt,
  fallbackText,
  fallbackClassName,
  iconOnly,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  ...rest
}: Props) {
  const [errored, setErrored] = useState(false);
  const safeAlt = typeof alt === "string" ? alt : "";
  const initial =
    fallbackText ?? (safeAlt ? safeAlt.charAt(0).toUpperCase() : "");

  if (errored || !src) {
    return (
      <div
        role="img"
        aria-label={safeAlt || undefined}
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-cream-100 via-cream-200/80 to-caramel-500/30 text-espresso-300 select-none",
          fallbackClassName,
        )}
      >
        {iconOnly || !initial ? (
          <Coffee className="h-8 w-8" strokeWidth={1.5} />
        ) : (
          <span className="font-display text-4xl text-espresso-400/80">
            {initial}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={className}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      {...rest}
    />
  );
}
