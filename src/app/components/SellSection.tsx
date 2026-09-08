'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function SellSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-32 bg-white text-black">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <div className="space-y-12">
          {/* Minimal Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-2xl font-normal tracking-widest uppercase text-black/80"
          >
            Vendre
          </motion.h2>
          
          {/* Subtle Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={inView ? { width: "4rem" } : { width: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-px bg-black/20 mx-auto"
          ></motion.div>
          
          {/* Minimal Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <p className="text-black/60 font-light leading-relaxed text-lg">
              Vous possédez un bien d&apos;exception ?
            </p>
            
            <p className="text-black/40 font-light text-sm leading-relaxed">
              Vente confidentielle auprès d&apos;une clientèle sélectionnée.
            </p>
          </motion.div>
          
          {/* Single Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="pt-8"
          >
            <Link 
              href="/contact?type=sell"
              className="inline-block border border-black/30 text-black px-12 py-4 font-light tracking-widest text-sm uppercase hover:border-black hover:text-black transition-all duration-500 hover:bg-black/5"
            >
              Confier
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}