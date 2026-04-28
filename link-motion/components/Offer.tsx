"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Button from "./ui/Button";

const services = [
  { label: "Audit LinkedIn complet", desc: "Analyse de votre profil, votre contenu passé et vos concurrents." },
  { label: "Refonte du profil", desc: "Headline, About, Featured — chaque section pensée pour convertir." },
  { label: "Stratégie éditoriale", desc: "Thèmes, formats, angles, fréquence. Un plan sur 90 jours." },
  { label: "Ghostwriting hebdomadaire", desc: "Posts rédigés dans votre voix, validés par vous, publiés pour vous." },
  { label: "Calendrier de publication", desc: "Organisation et planification optimisées selon votre secteur." },
  { label: "Analyse des performances", desc: "Reporting mensuel avec les métriques qui comptent vraiment." },
  { label: "Optimisation continue", desc: "Itérations basées sur les données pour améliorer en permanence." },
];

export default function Offer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="offre" className="relative py-24 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/40 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-accent-glow pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
            >
              L&apos;offre
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
              Tout ce qu&apos;il faut
              <br />
              pour performer.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-foreground-dim text-base leading-relaxed mb-10"
            >
              Un accompagnement complet, de l&apos;audit initial à
              l&apos;optimisation mensuelle. Vous vous concentrez sur votre
              cœur de métier. Nous gérons votre présence LinkedIn de A à Z.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Button
                variant="primary"
                size="md"
                href="https://cal.com/linkmotion/appel-strategique"
              >
                Discuter de votre projet
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </motion.div>
          </div>

          {/* Right - service list */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl border border-subtle/70 bg-surface overflow-hidden"
          >
            <div className="p-2">
              {services.map((service, i) => (
                <motion.div
                  key={service.label}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.07 + 0.4 }}
                  className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-surface-2 transition-colors duration-300 cursor-default"
                >
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border border-accent/30 bg-accent/8 flex items-center justify-center group-hover:border-accent/60 transition-colors duration-300">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#4B6CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div
                      className="text-foreground font-medium text-sm mb-0.5 group-hover:text-accent-light transition-colors duration-300"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {service.label}
                    </div>
                    <div className="text-foreground-dim text-xs leading-relaxed">
                      {service.desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
