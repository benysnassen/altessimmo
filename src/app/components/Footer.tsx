"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";

export default function Footer() {
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Sur mobile uniquement
    if (window.innerWidth < 768) {
      e.preventDefault();
      setIsRotating(true);
      
      // Attendre la fin de l'animation (500ms) puis ouvrir WhatsApp
      setTimeout(() => {
        setIsRotating(false);
        window.open("https://wa.me/message/L5HIFLLJI7MBE1", "_blank");
      }, 500);
    }
    // Sur desktop, comportement normal (hover + click direct)
  };

  return (
    <footer className="relative bg-black border-t border-white/10 py-8">
      <div className="max-w-6xl mx-auto px-8">
        <div className="w-8 h-px bg-white/20 mx-auto mb-6"></div>

        {/* Texte centré */}
        <p className="text-xs text-white/40 tracking-widest uppercase text-center">
          © {new Date().getFullYear()} Altessimmo Tetouan
        </p>

        {/* Icône WhatsApp - FLOTTANTE */}
        <Link
          href="https://wa.me/message/L5HIFLLJI7MBE1"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactez-nous sur WhatsApp"
          onClick={handleClick}
          className="
            fixed 
            right-4 bottom-6      /* mobile */
            md:right-8 md:bottom-8 /* desktop */
            z-50
            group text-white/60 hover:text-white transition
          "
        >
          <FaWhatsapp
            className={`
              transform transition-transform duration-500
              group-hover:scale-110 group-hover:rotate-[360deg]
              w-8 h-8        /* mobile: plus petit */
              md:w-10 md:h-10 /* desktop: taille originale */
              ${isRotating ? 'rotate-[360deg] scale-110' : ''}
            `}
          />
          <span className="absolute inset-0 rounded-full bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Link>
      </div>
    </footer>
  );
}