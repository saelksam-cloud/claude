"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const faqs = [
  {
    question: "Est-ce que vous écrivez à ma place ?",
    answer:
      "Oui, nous rédigeons vos posts. Mais pas à votre insu. Avant chaque lancement, nous menons un processus d'immersion approfondi : appels de briefing, analyse de vos prises de parole passées, extraction de votre vocabulaire, de vos positions, de votre vision. Le résultat, c'est du contenu qui vous ressemble — validé par vous avant chaque publication. Vous gardez le contrôle total.",
  },
  {
    question: "Est-ce adapté si je n'ai jamais publié ?",
    answer:
      "Absolument. Partir de zéro a même ses avantages : il n'y a rien à défaire. Nous construisons votre présence LinkedIn sur des bases solides, avec un positionnement clair et une stratégie pensée dès le départ. Beaucoup de nos meilleurs résultats viennent de clients qui n'avaient jamais publié un seul post.",
  },
  {
    question: "Combien de posts par semaine ?",
    answer:
      "En général, entre 3 et 5 publications par semaine selon votre offre, votre audience et vos objectifs. La fréquence est définie ensemble lors de la phase de stratégie. Ce qui compte n'est pas le volume, c'est la cohérence et la pertinence de chaque publication.",
  },
  {
    question: "Est-ce que vous garantissez des leads ?",
    answer:
      "Nous ne vendons pas de garanties fictives. Ce que nous garantissons, c'est une approche stratégique rigoureuse, un contenu de qualité premium et un suivi régulier des performances. Les résultats dépendent aussi de votre marché, de votre offre et de votre engagement dans le processus. Ce que nous observons sur nos accompagnements : une amélioration significative de la visibilité qualifiée dans les 30 premiers jours, et des premières conversations entrantes entre 60 et 90 jours.",
  },
  {
    question: "Combien de temps avant les premiers résultats ?",
    answer:
      "Les premiers signaux apparaissent généralement entre 30 et 60 jours : augmentation du taux d'engagement, croissance du réseau qualifié, demandes de connexion de prospects. Les premières opportunités commerciales concrètes arrivent souvent entre 60 et 90 jours. Un pipeline LinkedIn stable et prévisible se construit sur 6 à 12 mois. LinkedIn est un canal de long terme — mais les premiers signes de traction sont rapides.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-surface/20 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-accent text-xs tracking-widest uppercase font-medium mb-6"
          >
            Questions fréquentes
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display"
            style={{
              fontFamily: "Syne, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
            }}
          >
            Vos questions.
            <br />
            Nos réponses directes.
          </motion.h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 + 0.2 }}
              className="rounded-xl border border-subtle/60 bg-surface overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-6 text-left group"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span
                  className="text-foreground font-medium text-sm md:text-base group-hover:text-accent-light transition-colors duration-300 text-balance"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex-shrink-0 w-6 h-6 rounded-full border border-subtle/80 flex items-center justify-center group-hover:border-accent/50 transition-colors duration-300"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="h-px bg-subtle/40 mb-5" />
                      <p className="text-foreground-dim text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
