"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Button from "./ui/Button";

export default function CtaFinal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="cta" className="relative py-24 md:py-36 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-surface/40 pointer-events-none" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none opacity-60" />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/15 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/25 bg-accent/8 mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-xs text-accent-light tracking-widest uppercase font-medium">
            Places disponibles limitées
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-balance mb-7"
          style={{
            fontFamily: "Syne, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
            letterSpacing: "-0.03em",
            lineHeight: "1.06",
          }}
        >
          Prêt à faire de LinkedIn
          <br />
          <span className="gradient-text">votre prochain canal</span>
          <br />
          d&apos;acquisition ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-foreground-dim text-lg leading-relaxed max-w-xl mx-auto mb-12 text-balance"
        >
          Un appel de 30 minutes pour comprendre vos objectifs, évaluer votre situation actuelle et vous présenter notre approche.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            href="https://cal.com/linkmotion/appel-strategique"
          >
            Réserver un appel
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-foreground-dim/50 text-sm"
        >
          Sans engagement. Réponse sous 24h.
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
    </section>
  );
}
