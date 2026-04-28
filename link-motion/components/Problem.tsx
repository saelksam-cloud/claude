"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const problems = [
  {
    icon: "◈",
    title: "Publier sans stratégie",
    description:
      "Des posts qui ne servent pas vos objectifs business. Du contenu générique qui noie votre expertise dans le bruit.",
  },
  {
    icon: "◈",
    title: "Accumuler des vues inutiles",
    description:
      "Des impressions qui ne convertissent pas. Des likes de confrères, aucun prospect qualifié.",
  },
  {
    icon: "◈",
    title: "Ne pas créer de pipeline",
    description:
      "LinkedIn vous coûte du temps et n'apporte aucune conversation commerciale. Le ROI est invisible.",
  },
];

export default function Problem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="probleme" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-surface/30 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
        >
          Le constat
        </motion.div>

        {/* Headline */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-balance"
            style={{
              fontFamily: "Syne, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
            }}
          >
            La majorité des dirigeants publient.
            <br />
            <span className="text-foreground-dim">Peu d&apos;entre eux vendent.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 text-foreground-dim text-base leading-relaxed pt-2"
          >
            <p>
              LinkedIn est devenu le premier réseau B2B au monde. Pourtant, la
              grande majorité des dirigeants y investissent du temps sans jamais
              en tirer de valeur commerciale concrète.
            </p>
            <p>
              La raison est simple : ils confondent présence et stratégie.
              Visibilité et acquisition. Volume et performance.
            </p>
          </motion.div>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i + 0.3 }}
              className="relative p-7 rounded-2xl bg-surface border border-subtle/60 card-hover group overflow-hidden"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10">
                <div className="text-accent/50 text-2xl mb-4 font-mono">{problem.icon}</div>
                <h3
                  className="text-foreground font-medium text-lg mb-3 tracking-tight"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {problem.title}
                </h3>
                <p className="text-foreground-dim text-sm leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider statement */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.9 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16 p-8 rounded-2xl border border-accent/20 bg-accent-dim/20 text-center"
        >
          <p
            className="text-foreground text-lg md:text-xl font-medium tracking-tight text-balance"
            style={{ letterSpacing: "-0.02em" }}
          >
            Ce n&apos;est pas un problème de régularité.{" "}
            <span className="text-accent-light">
              C&apos;est un problème de stratégie.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
