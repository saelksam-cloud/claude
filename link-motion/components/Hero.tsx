"use client";

import { motion } from "framer-motion";
import Button from "./ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.21, 0.45, 0.27, 0.9] },
  }),
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #4B6CF5 1px, transparent 1px),
            linear-gradient(to bottom, #4B6CF5 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/15 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-accent/25 bg-accent/8 mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-accent-light tracking-widest uppercase font-medium">
            Agence LinkedIn B2B
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="font-display text-balance mb-6 leading-[1.04]"
          style={{
            fontFamily: "Syne, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.75rem, 6vw, 5.5rem)",
            letterSpacing: "-0.03em",
          }}
        >
          Transformez LinkedIn en
          <br />
          <span className="gradient-text">canal d&apos;acquisition</span>
          <br />
          client.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-foreground-dim text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12 text-balance"
        >
          Link Motion accompagne les dirigeants et experts B2B dans la création
          d&apos;un système de contenu LinkedIn conçu pour attirer, engager et
          convertir les bons clients.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            href="https://cal.com/linkmotion/appel-strategique"
          >
            Réserver un appel stratégique
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <Button variant="secondary" size="lg" href="#methode">
            Voir la méthode
          </Button>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { value: "3×", label: "plus de visibilité qualifiée" },
            { value: "90j", label: "pour les premiers résultats" },
            { value: "100%", label: "contenu sur-mesure" },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <div
                className="gradient-text-warm font-display text-3xl mb-1"
                style={{ fontFamily: "Syne, system-ui, sans-serif", fontWeight: 700 }}
              >
                {stat.value}
              </div>
              <div className="text-foreground-dim text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-transparent via-accent/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
