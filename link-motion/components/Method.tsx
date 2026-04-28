"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Clarifier votre positionnement",
    description:
      "Avant d'écrire le moindre mot, nous définissons ensemble ce qui vous distingue vraiment. Votre expertise, votre angle, votre ton. La fondation de tout ce qui suit.",
    tag: "Fondation",
  },
  {
    num: "02",
    title: "Identifier vos clients idéaux",
    description:
      "Nous cartographions votre audience cible avec précision. Qui sont-ils ? Quels problèmes ont-ils ? Quel vocabulaire utilisent-ils ? Votre contenu parlera directement à eux.",
    tag: "Ciblage",
  },
  {
    num: "03",
    title: "Créer du contenu d'autorité",
    description:
      "Chaque post est conçu pour établir votre expertise, créer de la confiance et attirer l'attention des prospects qualifiés. Aucun contenu générique. Aucun compromis.",
    tag: "Contenu",
  },
  {
    num: "04",
    title: "Transformer l'attention en opportunités",
    description:
      "Visibilité n'est pas synonyme de résultat. Nous intégrons des appels à l'action stratégiques, des séquences de nurturing et des points de conversion pour générer des opportunités réelles.",
    tag: "Acquisition",
  },
];

export default function Method() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="methode" className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-surface/20 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
          >
            La méthode
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
            Quatre étapes.
            <br />
            Un seul objectif.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground-dim text-base leading-relaxed"
          >
            Chaque engagement commence par comprendre où vous en êtes.
            Chaque action vise un pipeline commercial plus solide.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-[3.25rem] top-12 bottom-12 w-px bg-gradient-to-b from-accent/20 via-accent/10 to-transparent" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 + 0.3 }}
                className="group relative flex gap-7 lg:gap-10"
              >
                {/* Step number bubble */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full border border-accent/30 bg-background flex items-center justify-center group-hover:border-accent/60 group-hover:bg-accent/8 transition-all duration-400">
                    <span
                      className="text-accent font-display text-xs font-medium"
                      style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                    >
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6 lg:pb-8 pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <h3
                      className="text-foreground font-medium text-xl group-hover:text-accent-light transition-colors duration-300"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {step.title}
                    </h3>
                    <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full border border-accent/20 text-accent/70 tracking-wide">
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-foreground-dim text-base leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
