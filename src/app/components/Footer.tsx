"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 py-8">
      <div className="max-w-6xl mx-auto px-8">
        <div className="w-8 h-px bg-white/20 mx-auto mb-6"></div>

        {/* Texte centré */}
        <p className="text-xs text-white/40 tracking-widest uppercase text-center">
          © {new Date().getFullYear()} Altessimmo Tétouan
        </p>

        {/* Icône WhatsApp */}
        <Link
          href="https://wa.me/message/L5HIFLLJI7MBE1" // Remplace par ton numéro
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactez-nous sur WhatsApp"
          className="
            absolute 
            right-4 bottom-6      /* mobile */
            md:right-8 md:bottom-8 /* desktop */
            group text-white/60 hover:text-white transition
          "
        >
          <FaWhatsapp
            className="
              transform transition-transform duration-500
              group-hover:scale-110 group-hover:rotate-[360deg]
              w-8 h-8        /* mobile: plus petit */
              md:w-10 md:h-10 /* desktop: taille originale */
            "
          />
          <span className="absolute inset-0 rounded-full bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Link>
      </div>
    </footer>
  );
}
