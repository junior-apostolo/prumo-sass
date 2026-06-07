"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { cn } from "@/lib/utils";

const words: { text: string; highlight?: boolean }[] = [
  { text: "Seu" },
  { text: "primeiro" },
  { text: "orçamento" },
  { text: "profissional" },
  { text: "em" },
  { text: "menos" },
  { text: "de" },
  { text: "3", highlight: true },
  { text: "minutos", highlight: true },
];

const STAGGER_IN = 0.07;
const STAGGER_OUT = 0.04;
const DELAY_CHILDREN = 0.1;
const DURATION_IN = 0.55;
const DURATION_OUT = 0.35;
const PAUSE_VISIBLE_MS = 2800;
const PAUSE_HIDDEN_MS = 300;

const TOTAL_IN_MS = (DELAY_CHILDREN + (words.length - 1) * STAGGER_IN + DURATION_IN) * 1000;
const TOTAL_OUT_MS = ((words.length - 1) * STAGGER_OUT + DURATION_OUT) * 1000;

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: STAGGER_IN, delayChildren: DELAY_CHILDREN },
  },
  exit: {
    transition: { staggerChildren: STAGGER_OUT, staggerDirection: -1 as const },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: "blur(5px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: DURATION_IN,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(4px)",
    transition: {
      duration: DURATION_OUT,
      ease: [0.4, 0, 1, 0.6] as [number, number, number, number],
    },
  },
};

export function HeroHeadline() {
  const controls = useAnimation();

  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        controls.set("hidden");
        controls.start("show");
        await new Promise<void>((r) => setTimeout(r, TOTAL_IN_MS + PAUSE_VISIBLE_MS));
        if (cancelled) break;
        controls.start("exit");
        await new Promise<void>((r) => setTimeout(r, TOTAL_OUT_MS + PAUSE_HIDDEN_MS));
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, [controls]);

  return (
    <motion.h1
      variants={container}
      animate={controls}
      className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl"
    >
      {words.map(({ text, highlight }, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className={cn(
            "mr-[0.26em] inline-block last:mr-0",
            highlight && "text-primary"
          )}
        >
          {text}
        </motion.span>
      ))}
    </motion.h1>
  );
}
