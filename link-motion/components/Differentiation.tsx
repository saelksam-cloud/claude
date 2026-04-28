"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const differences = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L13.5 8.5H20L14.5 12.5L16.5 19L11 15L5.5 19L7.5 12.5L2 8.5H8.5L11 2Z" stroke="#4B6CF5" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Orienté business",
    description: "Chaque décision éditoriale est prise dans le prisme de vos objectifs commerciaux. Pas dans celui de l'algorithme.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="#4B6CF5" strokeWidth="1.5" />
        <path d="M7 11l3 3 5-5" stroke="#4B6CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Pas de vanity metrics",
    description: "Nous ne vous vendons pas des impressions. Nous visons des conversations qualifiées et des opportunités réelles.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="5" width="18" height="14" rx="2" stroke="#4B6CF5" strokeWidth="1.5" />
        <path d="M2 9h18M6 2v3M16 2v3" stroke="#4B6CF5" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Expertise B2B native",
    description: "Cycles de vente longs, décisions collectives, enjeux de confiance. Nous connaissons les codes du B2B.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M4 10h10M4 14h12M4 18h8" stroke="#4B6CF5" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Ton premium",
    description: "Du contenu qui reflète votre niveau d'expertise. Ni générique, ni sensationnaliste. Précis, direct, élégant.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2C6 2 2 6 2 11s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="#4B6CF5" strokeWidth="1.5" />
        <path d="M11 7v4l3 3" stroke="#4B6CF5" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Accompagnement stratégique",
    description: "Nous ne sommes pas un simple prestataire de contenu. Nous sommes un partenaire de croissance.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M12 2L2 12l10 10 10-10L12 2z" stroke="#4B6CF5" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Accompagnements limités",
    description: "Nous travaillons avec un nombre restreint de clients simultanément pour garantir une attention maximale.",
  },
];

export default function Differentiation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="differences" className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-surface/25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-subtle to-transparent" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
          >
            La différence
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-balance mb-5"
            style={{
              fontFamily: "Syne, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
            }}
          >
            Pourquoi Link Motion.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground-dim text-base leading-relaxed"
          >
            Il existe des centaines d&apos;agences de contenu. Aucune ne ressemble à ce que nous faisons.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {differences.map((diff, i) => (
            <motion.div
              key={diff.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 + 0.25 }}
              className="group p-7 rounded-2xl bg-background border border-subtle/50 card-hover relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="mb-5 text-accent/80 group-hover:text-accent transition-colors duration-300">
                  {diff.icon}
                </div>
                <h3
                  className="text-foreground font-medium text-base mb-2.5 group-hover:text-accent-light transition-colors duration-300"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {diff.title}
                </h3>
                <p className="text-foreground-dim text-sm leading-relaxed">
                  {diff.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-subtle to-transparent" />
    </section>
  );
}
