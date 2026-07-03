"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
}: AnimateInProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("in-view");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={cn("scroll-animate", className)} style={style}>
      {children}
    </Tag>
  );
}
