'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

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
            Altessimmo
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
            Immobilier
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
              Tétouan • Martil • Cabo Negro
            </motion.p>
        </motion.div>
        
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
              className="ml-4 group relative inline-flex items-center justify-center px-8 py-3 font-light tracking-widest text-sm uppercase text-white/80 hover:text-white transition-all duration-700"
            >
              {/* Background Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
              />
              
              {/* Main Button Background */}
              <div className="relative z-10 px-8 py-3 border border-white/20 rounded-sm bg-black/20 backdrop-blur-sm group-hover:border-white/40 group-hover:bg-white/5 transition-all duration-500">
                {/* Glitch Effect Text */}
                <div className="relative">
                  {/* Main Text */}
                  <motion.div
                    className="relative z-10 font-light tracking-widest text-sm uppercase flex"
                  >
                    {['D', 'É', 'C', 'O', 'U', 'V', 'R', 'I', 'R'].map((letter, index) => (
                      <motion.span
                        key={index}
                        animate={{
                          x: [0, Math.random() * 1 - 0.5, 0],
                          y: [0, Math.random() * 1 - 0.5, 0]
                        }}
                        transition={{
                          duration: 0.1,
                          delay: index * 0.02,
                          repeat: Infinity,
                          repeatDelay: 3 + Math.random() * 2
                        }}
                        className="inline-block"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </motion.div>
                  
                  {/* Glitch Duplicate Layer */}
                  <motion.div
                    initial={{ opacity: 0.15, x: 0.5, y: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center font-light tracking-widest text-sm uppercase text-white/25"
                    style={{ 
                      textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.05)',
                      filter: 'blur(0.3px)'
                    }}
                  >
                    DÉCOUVRIR
                  </motion.div>
                </div>
              </div>
              
              {/* Subtle Arrow Indicator */}
              <motion.div
                className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-1 h-6 bg-gradient-to-b from-transparent via-white/60 to-transparent"></div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Elegant Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ 
            y: [0, 8, 0],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="flex flex-col items-center space-y-2"
        >
          <div className="w-px h-8 bg-white/60"></div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-1 h-1 bg-white/40 rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* Subtle Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        {typeof window !== 'undefined' && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * (window?.innerWidth || 1920),
              y: Math.random() * (window?.innerHeight || 1080),
              opacity: 0
            }}
            animate={{ 
              x: Math.random() * (window?.innerWidth || 1920),
              y: Math.random() * (window?.innerHeight || 1080),
              opacity: [0, 0.1, 0]
            }}
            transition={{ 
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        ))}
      </motion.div>
    </section>
  );
}