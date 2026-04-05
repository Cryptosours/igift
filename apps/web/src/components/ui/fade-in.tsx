"use client";

import { motion } from "motion/react";

const EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: EASE,
    },
  }),
};

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds */
  delay?: number;
}

/**
 * Reveal-on-scroll wrapper using Framer Motion whileInView.
 * Replaces the CSS IntersectionObserver-based ScrollReveal.
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      custom={delay}
      variants={fadeUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger Container ─────────────────────────────
   Wrap a list of StaggerItem children for coordinated entrance.
   Usage:
     <StaggerContainer className="grid ...">
       {items.map(item => (
         <StaggerItem key={item.id}><Card /></StaggerItem>
       ))}
     </StaggerContainer>
   ───────────────────────────────────────────────── */

const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE,
    },
  },
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between each child entrance (default 0.08) */
  stagger?: number;
}

export function StaggerContainer({ children, className, stagger = 0.08 }: StaggerContainerProps) {
  const variants = stagger === 0.08
    ? staggerContainerVariants
    : {
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
