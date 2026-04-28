"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pillars = [
  {
    num: "01",
    title: "Positionnement",
    description: "Définir ce qui vous rend unique, crédible et désirable pour vos clients idéaux.",
  },
  {
    num: "02",
    title: "Stratégie éditoriale",
    description: "Un calendrier de contenu aligné sur vos objectifs commerciaux, pas sur l'algorithme.",
  },
  {
    num: "03",
    title: "Ghostwriting",
    description: "Des posts rédigés dans votre voix. Du contenu qui vous représente et attire les bons clients.",
  },
  {
    num: "04",
    title: "Distribution",
    description: "La bonne publication, au bon moment, avec la bonne structure pour maximiser l'impact.",
  },
  {
    num: "05",
    title: "Conversion",
    description: "Transformer l'attention en conversations qualifiées et en opportunités commerciales concrètes.",
  },
];

export default function Solution() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="solution" className="relative py-24 md:py-36 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24 items-start">
          {/* Left column */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
            >
              La solution
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display mb-6 text-balance"
              style={{
                fontFamily: "Syne, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
                letterSpacing: "-0.025em",
                lineHeight: "1.1",
              }}
            >
              Un système.
              <br />
              Pas du contenu.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-foreground-dim text-base leading-relaxed mb-8"
            >
              Link Motion ne produit pas du contenu pour remplir un calendrier.
              Nous construisons un système d&apos;acquisition qui transforme votre
              expertise en conversations commerciales.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-6 rounded-xl border border-accent/20 bg-accent/6"
            >
              <p
                className="text-foreground font-medium leading-snug text-balance"
                style={{ letterSpacing: "-0.015em" }}
              >
                &ldquo;Nous n&apos;écrivons pas seulement des posts.
                <span className="text-accent-light block mt-1">
                  Nous construisons un canal d&apos;acquisition.&rdquo;
                </span>
              </p>
            </motion.div>
          </div>

          {/* Right column - pillars */}
          <div className="space-y-4">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.num}
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 * i + 0.3 }}
                className="group flex gap-6 p-6 rounded-2xl bg-surface border border-subtle/50 card-hover cursor-default"
              >
                <div
                  className="text-accent/40 font-display text-xs mt-0.5 tracking-widest font-medium shrink-0"
                  style={{ fontFamily: "Syne, system-ui, sans-serif" }}
                >
                  {pillar.num}
                </div>
                <div>
                  <h3
                    className="text-foreground font-medium text-lg mb-2 group-hover:text-accent-light transition-colors duration-300"
                    style={{ letterSpacing: "-0.015em" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-foreground-dim text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
    </section>
  );
}
