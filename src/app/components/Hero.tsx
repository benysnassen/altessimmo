'use client';

import { Link } from '@/i18n/routing'; // ✅ CORRECT
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';


interface HeroProps {
  real_estate: string,
  discover: string
}

type Particle = {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration: number;
};

export default function Hero({ real_estate, discover }: HeroProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const width = window.innerWidth || 1920;
    const height = window.innerHeight || 1080;

    const nextParticles: Particle[] = Array.from({ length: 6 }).map((_, index) => {
      const fromX = Math.random() * width;
      const fromY = Math.random() * height;
      const toX = Math.random() * width;
      const toY = Math.random() * height;

      return {
        id: `particle-${index}`,
        fromX,
        fromY,
        toX,
        toY,
        duration: 20 + Math.random() * 10,
      };
    });

    setParticles(nextParticles);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">

      {/* Animated Background Pattern */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
      >
        <motion.div 
          animate={{ 
            background: [
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </motion.div>
      
      {/* Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center text-white px-4 md:px-8 max-w-4xl mx-auto"
      >
        {/* Main Headline - Ultra Elegant */}
        <motion.h1 
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 1.5, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2
          }}
          className="font-display text-6xl md:text-8xl font-thin mb-8 leading-none tracking-wider"
        >
          <motion.span
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Tetouan
          </motion.span>
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 1.5, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.9
          }}
          className="font-display text-4xl md:text-5xl font-thin mb-8 leading-none tracking-wider"
        >
          <motion.span
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {real_estate}
          </motion.span>
        </motion.h2>
        
        {/* Elegant Line Animation */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "8rem", opacity: 1 }}
          transition={{ 
            duration: 2, 
            delay: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-12"
        />
        
        {/* Subtitle with Stagger Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
        >
          <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
              className="text-sm sm:text-base md:text-lg font-light mb-16 text-white/60 tracking-widest uppercase"
            >
              Tetouan • Martil • Cabo Negro
            </motion.p>
        </motion.div>
        
        {/* Elegant Mysterious Button */}
      {/* Elegant Mysterious Button */}
<motion.div 
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 2.5 }}
  className="pt-2"
>
  <motion.div
    whileHover={{ 
      scale: 1.02,
      transition: { duration: 0.4, ease: "easeOut" }
    }}
    whileTap={{ scale: 0.98 }}
    className="relative flex justify-center"
  >
    <Link 
      href="/contact"
      className="group relative inline-flex items-center justify-center px-10 py-4 border border-white/20 bg-black/20 backdrop-blur-sm text-sm uppercase tracking-widest text-white/70 hover:text-white rounded-sm transition-all duration-700"
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      />
      <span className="relative z-10">
      {discover}      </span>
    </Link>
  </motion.div>
</motion.div>
      </motion.div>

      {/* Subtle Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.fromX,
              y: particle.fromY,
              opacity: 0,
            }}
            animate={{
              x: [particle.fromX, particle.toX, particle.fromX],
              y: [particle.fromY, particle.toY, particle.fromY],
              opacity: [0, 0.1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </motion.div>
    </section>
  );
}