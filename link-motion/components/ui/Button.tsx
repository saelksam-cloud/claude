"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className,
  onClick,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-300 cursor-pointer select-none";

  const sizes = {
    sm: "px-5 py-2.5 text-sm rounded-lg gap-2",
    md: "px-7 py-3.5 text-sm rounded-xl gap-2.5",
    lg: "px-9 py-4 text-base rounded-xl gap-3",
  };

  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-light shadow-lg shadow-accent/20 hover:shadow-accent/35 hover:-translate-y-0.5",
    secondary:
      "bg-transparent text-foreground border border-subtle hover:border-accent/50 hover:text-foreground hover:bg-surface hover:-translate-y-0.5",
    ghost:
      "bg-transparent text-foreground-dim hover:text-foreground hover:-translate-y-0.5",
  };

  const classes = clsx(base, sizes[size], variants[variant], className);

  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={classes}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button className={classes} onClick={onClick} whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}
