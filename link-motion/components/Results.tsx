"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Result = {
  headline: string;
  body: string;
  metric: string;
  metricLabel: string;
};

const results: Result[] = [
  {
    headline: "Visibilité qualifiée",
    body: "Être vu par les bonnes personnes au bon moment. Votre contenu attire les décideurs de votre secteur — pas une audience passive.",
    metric: "+300%",
    metricLabel: "de portée cible",
  },
  {
    headline: "Autorité renforcée",
    body: "Devenir la référence dans votre domaine. Quand un prospect cherche un expert, c'est votre nom qui lui vient à l'esprit.",
    metric: "×3",
    metricLabel: "de crédibilité perçue",
  },
  {
    headline: "Conversations entrantes",
    body: "Des prospects qui viennent à vous. Pas l'inverse. Le contenu crée un flux naturel d'inbounds qualifiés.",
    metric: "10+",
    metricLabel: "leads/mois en moyenne",
  },
  {
    headline: "Opportunités commerciales",
    body: "Des demandes de rendez-vous, des invitations à des podcasts, des co-créations, des recommandations. Un réseau actif.",
    metric: "90j",
    metricLabel: "pour les premiers résultats",
  },
  {
    headline: "Pipeline régulier",
    body: "LinkedIn devient une source d'acquisition prévisible. Un canal sur lequel vous pouvez compter, mois après mois.",
    metric: "12m",
    metricLabel: "pour un flux stable",
  },
];

function ResultCard({ result, i, inView }: { result: Result; i: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: i * 0.1 + 0.25 }}
      className="group relative p-7 rounded-2xl bg-surface border border-subtle/60 card-hover overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
        <div
          className="font-display text-5xl text-accent leading-none"
          style={{ fontFamily: "Syne, system-ui, sans-serif", fontWeight: 800 }}
        >
          {result.metric}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-accent text-xs font-medium tracking-wide">
            {result.metricLabel}
          </span>
        </div>

        <h3
          className="text-foreground font-medium text-lg mb-3 group-hover:text-accent-light transition-colors duration-300"
          style={{ letterSpacing: "-0.015em" }}
        >
          {result.headline}
        </h3>
        <p className="text-foreground-dim text-sm leading-relaxed">{result.body}</p>
      </div>
    </motion.div>
  );
}

export default function Results() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="resultats" className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/30 to-background pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
          >
            Les résultats
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
            Ce que vous allez
            <br />
            <span className="gradient-text">construire ensemble.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground-dim text-base leading-relaxed"
          >
            Des résultats mesurables, construits sur une stratégie solide.
            Pas des promesses. Des trajectoires réalistes.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.slice(0, 3).map((result, i) => (
            <ResultCard key={result.headline} result={result} i={i} inView={inView} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-5 lg:max-w-[66.666%]">
          {results.slice(3).map((result, i) => (
            <ResultCard key={result.headline} result={result} i={i + 3} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
