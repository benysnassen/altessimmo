'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield, Lock, AlertCircle } from 'lucide-react';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Vérifier si déjà connecté
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, [router]);

  // Gérer le verrouillage temporaire
  useEffect(() => {
    if (isLocked && lockTime > 0) {
      const timer = setTimeout(() => {
        setLockTime(lockTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTime === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, lockTime]);

  const onSubmit = async (data: LoginForm) => {
    if (isLocked) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Erreur de connexion');
        
        // Gérer les tentatives échouées
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockTime(300); // 5 minutes de verrouillage
          setError('Trop de tentatives échouées. Compte verrouillé pour 5 minutes.');
        } else if (newAttempts >= 2) {
          setError(`Mot de passe incorrect. ${3 - newAttempts} tentative(s) restante(s).`);
        }
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md mx-auto w-full"
      >
        <div className="bg-white rounded-sm shadow-lg p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-2xl font-light text-black mb-4 tracking-wide"
            >
              Accès Administrateur
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-px bg-black mx-auto mb-6"
            ></motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-black/60 font-light text-sm leading-relaxed"
            >
              Accès sécurisé au tableau de bord Altessimmo
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label htmlFor="username" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <Shield className="inline w-4 h-4 mr-2" />
                Nom d'utilisateur
              </label>
              
              <input
                {...register('username', { 
                  required: 'Nom d\'utilisateur requis',
                  minLength: { value: 3, message: 'Minimum 3 caractères' }
                })}
                disabled={isLocked}
                className="w-full px-4 py-3 border border-black/20 bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Entrez votre nom d'utilisateur"
              />
              
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username.message}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <label htmlFor="password" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <Lock className="inline w-4 h-4 mr-2" />
                Mot de passe administrateur
              </label>
              
              <div className="relative">
                <input
                  {...register('password', { 
                    required: 'Mot de passe requis'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLocked}
                  className="w-full px-4 py-3 pr-12 border border-black/20 bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Entrez votre mot de passe"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 hover:text-black/60 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-sm p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Lock Message */}
            {isLocked && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <span className="text-yellow-800 text-sm">
                  Compte verrouillé. Réessayez dans {Math.floor(lockTime / 60)}:{(lockTime % 60).toString().padStart(2, '0')}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center pt-4"
            >
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="bg-black text-white px-10 py-4 rounded-sm font-light tracking-wide text-lg hover:bg-black/90 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </motion.div>
          </form>

          {/* Security Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 pt-6 border-t border-black/10"
          >
            <div className="text-xs text-black/40 text-center space-y-1">
              <p>🔒 Connexion sécurisée avec chiffrement SSL</p>
              <p>🛡️ Protection contre les attaques par force brute</p>
              <p>⏰ Sessions avec expiration automatique</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}