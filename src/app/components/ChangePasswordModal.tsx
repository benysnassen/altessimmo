'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<ChangePasswordForm>();
  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe modifié avec succès !');
        reset();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Erreur lors du changement de mot de passe');
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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (confirmPassword !== newPassword) return 'Les mots de passe ne correspondent pas';
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

  const passwordStrength = getPasswordStrength(newPassword || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-cream border border-cream-border rounded-2xl max-w-md w-full p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-light text-black">Changer le mot de passe</h2>
          </div>
          <button
            onClick={onClose}
            className="text-black/40 hover:text-black/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
              Mot de passe actuel
            </label>
            
            <div className="relative">
              <input
                {...register('currentPassword', { required: 'Mot de passe actuel requis' })}
                type={showCurrentPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-cream-border bg-cream text-sand-dark font-light focus:border-sage-mid focus:outline-none transition-colors duration-300 rounded-xl"
                placeholder="Entrez votre mot de passe actuel"
              />
              
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 hover:text-black/60 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
              Nouveau mot de passe
            </label>
            
            <div className="relative">
              <input
                {...register('newPassword', { 
                  validate: validatePassword,
                  required: 'Nouveau mot de passe requis'
                })}
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-cream-border bg-cream text-sand-dark font-light focus:border-sage-mid focus:outline-none transition-colors duration-300 rounded-xl"
                placeholder="Entrez un nouveau mot de passe fort"
              />
              
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 hover:text-black/60 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.newPassword.message}
              </p>
            )}
            
            {/* Password Strength Indicator */}
            {newPassword && newPassword.length > 0 && (
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
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
              Confirmer le nouveau mot de passe
            </label>
            
            <div className="relative">
              <input
                {...register('confirmPassword', { 
                  validate: validateConfirmPassword,
                  required: 'Confirmation requise'
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-cream-border bg-cream text-sand-dark font-light focus:border-sage-mid focus:outline-none transition-colors duration-300 rounded-xl"
                placeholder="Confirmez le nouveau mot de passe"
              />
              
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 hover:text-black/60 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-sm p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-cream-border text-sand-dark font-light rounded-xl hover:bg-sand/60 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-sage text-white font-light rounded-xl hover:bg-sage/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


