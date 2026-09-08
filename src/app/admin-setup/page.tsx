'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield, Lock, AlertCircle, Key } from 'lucide-react';

interface SetupForm {
  masterKey: string;
  username: string;
  password: string;
}

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SetupForm>();
  const password = watch('password');

  const onSubmit = async (data: SetupForm) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Administrateur créé avec succès ! Redirection...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors de la création');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation du mot de passe côté client
  const validatePassword = (password: string) => {
    if (!password) return 'Mot de passe requis';
    if (password.length < 8) return 'Minimum 8 caractères';
    if (!/(?=.*[a-z])/.test(password)) return 'Au moins une minuscule';
    if (!/(?=.*[A-Z])/.test(password)) return 'Au moins une majuscule';
    if (!/(?=.*\d)/.test(password)) return 'Au moins un chiffre';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Au moins un caractère spécial (@$!%*?&)';
    return true;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;
    
    const strengths = [
      { strength: 0, label: 'Très faible', color: 'bg-red-500' },
      { strength: 1, label: 'Faible', color: 'bg-red-400' },
      { strength: 2, label: 'Moyen', color: 'bg-yellow-500' },
      { strength: 3, label: 'Bon', color: 'bg-blue-500' },
      { strength: 4, label: 'Très bon', color: 'bg-green-500' },
      { strength: 5, label: 'Excellent', color: 'bg-green-600' }
    ];
    
    return strengths[score];
  };

  const passwordStrength = getPasswordStrength(password || '');

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
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Key className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-2xl font-normal text-black mb-4 tracking-wide"
            >
              Configuration Admin
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-px bg-red-600 mx-auto mb-6"
            ></motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-black/60 font-light text-sm leading-relaxed"
            >
              Création sécurisée du premier administrateur
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Master Key Field */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label htmlFor="masterKey" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <Key className="inline w-4 h-4 mr-2" />
                Clé maître de sécurité
              </label>
              
              <div className="relative">
                <input
                  {...register('masterKey', { 
                    required: 'Clé maître requise',
                    minLength: { value: 10, message: 'Clé maître trop courte' }
                  })}
                  type={showMasterKey ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-black/20 bg-transparent text-black font-light focus:border-red-600 focus:outline-none transition-colors duration-300 rounded-sm"
                  placeholder="Entrez la clé maître"
                />
                
                <button
                  type="button"
                  onClick={() => setShowMasterKey(!showMasterKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 hover:text-black/60 transition-colors"
                >
                  {showMasterKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {errors.masterKey && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.masterKey.message}
                </p>
              )}
            </motion.div>

            {/* Username Field */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <label htmlFor="username" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <Shield className="inline w-4 h-4 mr-2" />
                Nom d&apos;utilisateur
              </label>
              
              <input
                {...register('username', { 
                  required: 'Nom d\'utilisateur requis',
                  minLength: { value: 3, message: 'Minimum 3 caractères' }
                })}
                className="w-full px-4 py-3 border border-black/20 bg-transparent text-black font-light focus:border-red-600 focus:outline-none transition-colors duration-300 rounded-sm"
                placeholder="admin"
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
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <label htmlFor="password" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <Lock className="inline w-4 h-4 mr-2" />
                Mot de passe administrateur
              </label>
              
              <div className="relative">
                <input
                  {...register('password', { 
                    validate: validatePassword,
                    required: 'Mot de passe requis'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-black/20 bg-transparent text-black font-light focus:border-red-600 focus:outline-none transition-colors duration-300 rounded-sm"
                  placeholder="Entrez un mot de passe fort"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 hover:text-black/60 transition-colors"
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
              
              {/* Password Strength Indicator */}
              {password && password.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-black/60">Force du mot de passe:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
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

            {/* Success Message */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-sm p-3 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center pt-4"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 text-white px-10 py-4 rounded-sm font-light tracking-wide text-lg hover:bg-red-700 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
              >
                {isLoading ? 'Création...' : 'Créer l\'administrateur'}
              </button>
            </motion.div>
          </form>

          {/* Security Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 pt-6 border-t border-black/10"
          >
            <div className="text-xs text-black/40 text-center space-y-1">
              <p>🔐 Clé maître requise pour la création</p>
              <p>🛡️ Mot de passe ultra-sécurisé</p>
              <p>⚡ Accès immédiat au dashboard</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}


