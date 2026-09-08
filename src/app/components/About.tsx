'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function About() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-32 bg-black text-white">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <div className="space-y-12">
          {/* Very Minimal Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-2xl font-normal tracking-widest uppercase text-white/80"
          >
            À propos
          </motion.h2>
          
          {/* Subtle Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={inView ? { width: "4rem" } : { width: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-px bg-white/20 mx-auto"
          ></motion.div>
          
          {/* Minimal Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <p className="text-white/60 font-light leading-relaxed text-lg">
              Agent indépendant spécialisé dans les biens d&apos;exception.
            </p>
            
            <p className="text-white/40 font-light text-sm leading-relaxed">
              Accompagnement confidentiel pour une clientèle exigeante.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}