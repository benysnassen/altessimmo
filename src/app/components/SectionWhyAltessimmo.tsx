'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { zonesProseFr } from '@/config/site';

export default function SectionWhyAltessimmo() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden px-6 md:px-12">
      
      {/* Light ambient pattern */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <motion.div 
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 60%)",
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        
        {/* Section title */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-6xl font-normal tracking-widest mb-8"
        >
          Pourquoi <span className="text-white/70">Altessimmo</span> ?
        </motion.h2>

        {/* Divider line */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: "6rem", opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-12"
        />

        {/* Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-white/70">
          {[
            { title: "Estimation Gratuite en 48h", desc: "Recevez une estimation réaliste et confidentielle, sans engagement." },
            { title: "Acheteurs Cash Disponibles", desc: "Nous disposons d’un réseau actif d’investisseurs prêts à acheter immédiatement." },
            { title: "Présence Locale Forte", desc: `${zonesProseFr} — nous connaissons chaque quartier, chaque opportunité.` },
            { title: "Indépendance Totale", desc: "Un interlocuteur unique, réactif et disponible 7j/7, pour une vente sans perte de temps." }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 * index }}
              viewport={{ once: true }}
              className="backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/30 rounded-md p-8 transition-all duration-700"
            >
              <h3 className="font-light text-lg md:text-xl text-white mb-3">{item.title}</h3>
              <p className="text-sm md:text-base text-white/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Link 
            href="/contact"
            className="group relative inline-flex items-center justify-center px-10 py-4 border border-white/20 bg-black/20 backdrop-blur-sm text-sm uppercase tracking-widest text-white/70 hover:text-white rounded-sm transition-all duration-500"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            />
            <span className="relative z-10">Obtenir une estimation</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
