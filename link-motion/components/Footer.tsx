"use client";

import { motion } from "framer-motion";

const NAV = [
  { label: "Méthode", href: "#methode" },
  { label: "Offre", href: "#offre" },
  { label: "Résultats", href: "#resultats" },
  { label: "FAQ", href: "#faq" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-subtle/40 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          {/* Logo & baseline */}
          <div className="space-y-2">
            <a href="#" className="flex items-center gap-2.5">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 bg-accent rounded-md rotate-12" />
                <div className="absolute inset-0.5 bg-background rounded" />
                <div className="absolute inset-1 bg-accent-light rounded-sm" />
              </div>
              <span
                className="text-foreground font-display text-lg tracking-tight"
                style={{ fontFamily: "Syne, system-ui, sans-serif", fontWeight: 700 }}
              >
                Link<span className="text-accent">Motion</span>
              </span>
            </a>
            <p className="text-foreground-dim text-xs leading-relaxed max-w-xs">
              Agence LinkedIn B2B. Stratégie, ghostwriting et acquisition client pour dirigeants et experts.
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground-dim hover:text-foreground text-sm transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="https://cal.com/linkmotion/appel-strategique"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent-light text-sm font-medium hover:bg-accent/15 hover:border-accent/40 transition-all duration-300"
          >
            Réserver un appel
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="mt-12 pt-6 border-t border-subtle/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-foreground-dim/50 text-xs">
            © {new Date().getFullYear()} Link Motion. Tous droits réservés.
          </p>
          <p className="text-foreground-dim/40 text-xs">
            Agence LinkedIn B2B · Paris, France
          </p>
        </div>
      </div>
    </footer>
  );
}
