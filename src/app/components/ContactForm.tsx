'use client';
import { useTranslations } from 'next-intl';
import React, { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Phone, User, MessageSquare, ChevronDown, DollarSign, ArrowRight, Home, ShoppingCart, CalendarClock } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Link } from '@/i18n/routing';
import { HORIZONS, HORIZON_LABEL_KEYS } from '@/lib/leads';

export default function ContactForm() {
  const t = useTranslations('contact');

  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { width, height } = useWindowSize();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [budgetValue, setBudgetValue] = useState(1500000);

  const isBuyer = !typeParam || typeParam === 'buy';
  const isSeller = typeParam === 'sell';

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      phone: '+212|MA|',
      email: '',
      budget: '',
      estimation: '',
      message: '',
      horizon: '',
      sourcePage: '',
      type: isSeller ? 'seller' : 'buyer',
      honeypot: '', // honeypot
    },
  });

  // Synchronisation des valeurs avec le type
  useEffect(() => {
    setValue('type', isSeller ? 'seller' : 'buyer');

    if (isSeller) {
      setValue('estimation', budgetValue.toString());
      setValue('budget', '');
    } else {
      setValue('budget', budgetValue.toString());
      setValue('estimation', '');
    }
  }, [typeParam, isSeller, budgetValue, setValue]);

  // Page d'entree du lead : releve une seule fois, au montage.
  useEffect(() => {
    setValue('sourcePage', window.location.pathname);
  }, [setValue]);


  const phoneValue = watch('phone');



  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les espaces et caractères non numériques
    const cleaned = value.replace(/\D/g, '');
    
    // Formatage selon la longueur
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 12)}`;
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    // Validation côté client
      try {
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setShowConfetti(true); // On remet les confettis à true

        reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
    }
  };

  const formatBudget = (value: number) => {
    if (value >= 1000000) {
      const millions = value / 1000000;
      if (millions >= 25) {
        return `25M+`;
      }
      return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2).replace(/\.?0+$/, '')}M`;
    } else if (value >= 1000) {
      const milliers = value / 1000;
      if (milliers <= 500) {
        return `500K-`;
      }
      return `${milliers % 1 === 0 ? milliers.toFixed(0) : milliers.toFixed(2).replace(/\.?0+$/, '')}K`;
    }
    return `${value.toLocaleString()}`;
  };

    const handleBudgetChange = (value: number) => {
    setBudgetValue(value);
    // Si c'est un vendeur, on met à jour 'estimation', sinon 'budget'
    if (isSeller) {
      setValue('estimation', value.toString());
    }
    else if (isBuyer) {
      setValue('budget', value.toString());
    }
  };

 
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center py-16 relative overflow-hidden">
        {/* 🎉 Confettis sobres */}
        <Confetti
  width={width / 2}
  height={height}
  numberOfPieces={150}
  recycle={false}
  colors={[
    '#FFD700', // gold
    '#E6BE8A', // pale gold
    '#B8860B', // dark goldenrod
    '#F5DEB3', // wheat
    '#FFF8DC', // cornsilk
    '#DAA520', // goldenrod
  ]}
  style={{
    position: 'fixed',
    top: 0,
    left: width / 4, // 👈 décale de 25% vers la droite
    pointerEvents: 'none', // optionnel, pour laisser passer les clics
  
  }}
/>

        {/* Message de succès */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md mx-auto px-4 md:px-8"
        >
          <div className="bg-white rounded-sm shadow-lg p-6 md:p-12 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-px bg-black mx-auto mb-6"
            />
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-2xl font-normal text-black mb-4 tracking-wide"
            >
              {t('message_sent')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-black/60 font-light leading-relaxed"
            >
              {t('success_message')}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-16">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-lg md:max-w-2xl mx-auto px-4 md:px-8 w-full"
      >
        <div className="bg-white rounded-sm shadow-lg p-6 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-3xl font-normal text-black mb-4 tracking-wide"
            >
              {isSeller ? t('entrust_property') : t('find_your_property')}
            </motion.h2>
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
              {isSeller 
                ? t('we_support_sale')
                : t('help_find_dream')
              }
            </motion.p>
          </div>

          {/* Switch Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href={isSeller ? '/contact?type=buy' : '/contact?type=sell'}
                className="group inline-flex items-center gap-3 px-6 py-3 border border-black/20 text-black/60 hover:border-black/40 hover:text-black transition-all duration-300 rounded-sm bg-white/50 hover:bg-white/80"
              >
                {isSeller ? (
                  <>
                    <ShoppingCart className="w-4 h-4 group-hover:rotate-350 transition-transform duration-300" />
                    <span className="text-sm font-light tracking-wide">
                      {t('looking_to_buy')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4 group-hover:rotate-350 transition-transform duration-300" />
                    <span className="text-sm font-light tracking-wide">
                    {t('want_to_sell')}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Link>
            </motion.div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Name */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label htmlFor="name" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <User className="inline w-4 h-4 mr-2" />
                {t('full_name')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { required: t('required_name') })}
                className="w-full px-3 md:px-4 py-3 border border-black/20 bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 rounded-sm"
                placeholder={t('full_name_placeholder')}
              />
              {errors.name && (
    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
  )}
            </motion.div>

            {/* Phone with Custom Country Selector */}
          
<motion.div 
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6, delay: 0.7 }}
>
  <label className="block text-sm text-black/60 font-light mb-3 tracking-wide">
    <Phone className="inline w-4 h-4 mr-2" />
    {t('phone_whatsapp')} <span className="text-red-500">*</span>
  </label>
  

                    
  <Controller
      name="phone"
      control={control}
      rules={{
        required: "Téléphone requis",
        validate: (value) => {
          const parts = value?.split("|") || [];
          const phoneNumber = parts[2] || "";
          return (
            phoneNumber.length >= 8 ||
            t('invalid_phone')
          );
        },
      }}
      render={({ field }) => (
        <>
          <div dir="ltr" className="flex gap-3">
            {/* Country Selector */}
            <div className="relative flex-shrink-0">
              <select
                value={
                  field.value?.includes("|")
                    ? `${field.value.split("|")[0]}|${field.value.split("|")[1]}`
                    : "+212|MA"
                }
                onChange={(e) => {
                  const [countryCode, country] = e.target.value.split("|");
                  const currentNumber = field.value?.includes("|")
                    ? field.value.split("|")[2]
                    : "";
                  field.onChange(`${countryCode}|${country}|${currentNumber}`);
                }}
                className="w-28 md:w-32 px-2 md:px-3 py-3 border border-black/20 bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 rounded-sm appearance-none cursor-pointer text-sm h-12"
              >
                <option value="+212|MA">🇲🇦 +212</option>
                    <option value="+33|FR">🇫🇷 +33</option>
                    <option value="+34|ES">🇪🇸 +34</option>
                    <option value="+32|BE">🇧🇪 +32</option>
                    <option value="+31|NL">🇳🇱 +31</option>
                    <option value="+39|IT">🇮🇹 +39</option>
                    <option value="+1|CA">🇨🇦 +1</option>
                    <option value="+49|DE">🇩🇪 +49</option>
                    <option value="+44|GB">🇬🇧 +44</option>
                    <option value="+1|US">🇺🇸 +1</option>
                    <option value="+971|AE">🇦🇪 +971</option>
                    <option value="+966|SA">🇸🇦 +966</option>
                    <option value="+213|DZ">🇩🇿 +213</option>
                    <option value="+216|TN">🇹🇳 +216</option>
                    <option value="+20|EG">🇪🇬 +20</option>
                    <option value="+90|TR">🇹🇷 +90</option>
                    <option value="+7|RU">🇷🇺 +7</option>
                    <option value="+86|CN">🇨🇳 +86</option>
                    <option value="+81|JP">🇯🇵 +81</option>
                    <option value="+82|KR">🇰🇷 +82</option>
                    <option value="+91|IN">🇮🇳 +91</option>
                    <option value="+55|BR">🇧🇷 +55</option>
                    <option value="+54|AR">🇦🇷 +54</option>
                    <option value="+61|AU">🇦🇺 +61</option>
                    <option value="+27|ZA">🇿🇦 +27</option>
              </select>

              {/* Chevron */}
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-black/40" />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="relative flex-1">
            <input
                  ref={(el) => {
                    inputRef.current = el;
                    field.ref(el);
                  }}
                  type="tel"
                  inputMode="numeric"
                  value={
                    field.value?.includes("|")
                      ? formatPhoneNumber(field.value.split("|")[2] || "")
                      : ""
                  }
                  onChange={(e) => {
                    const rawNumber = e.target.value.replace(/\D/g, "").slice(0, 12);
                    const parts = field.value?.includes("|")
                      ? field.value.split("|")
                      : ["+212", "MA", ""];
                    field.onChange(`${parts[0]}|${parts[1]}|${rawNumber}`);
                  }}
                  placeholder="688 905 632"
                  className={`w-full px-3 md:px-4 py-3 border bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 rounded-sm tracking-wider h-12`}
                />
            </div>
          </div>

          {errors.phone && (
            <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </>
      )}
    />

</motion.div>

            {/* Email */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <label htmlFor="email" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <Mail className="inline w-4 h-4 mr-2" />
                {t('email_optional')}
              </label>
              <input
                {...register('email', {
                  validate: (value) => {
                    if (!value) return true; // facultatif : pas d'erreur si vide
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value) || t('invalid_email');
                  }
                } )}
                className="w-full px-3 md:px-4 py-3 border border-black/20 bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 rounded-sm"
                placeholder={t('email_placeholder')}
              />
              {errors.email && (
  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>)}
            </motion.div>

            {/* Budget Slider for Buyers */}
            {(isBuyer || !typeParam) && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white/5 border border-black/10 rounded-lg p-4 md:p-6"
              >
                <label className="block text-lg text-black/80 font-medium mb-4 tracking-wide">
                  <DollarSign className="inline w-5 h-5 mr-2" />
                  {t('estimated_budget')}
                </label>
                <div dir="ltr" className="space-y-6">
                  <div className="relative">
                    <input
                      type="range"
                      min="500000"
                      max="25000000"
                      step="250000"
                      value={budgetValue}
                      onChange={(e) => handleBudgetChange(Number(e.target.value))}
                      className="w-full h-3 bg-black/10 rounded-lg appearance-none cursor-pointer slider-custom"
                      style={{
                        background: `linear-gradient(to right, #000 0%, #000 ${(budgetValue - 500000) / (25000000 - 500000) * 100}%, #e5e5e5 ${(budgetValue - 500000) / (25000000 - 500000) * 100}%, #e5e5e5 100%)`
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">{formatBudget(budgetValue)}</div>
                  </div>
                </div>
                <input type="hidden" {...register('budget')} />
              </motion.div>
            )}

            {/* Estimation Slider for Sellers */}
            {isSeller && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="bg-white/5 border border-black/10 rounded-lg p-4 md:p-6"
              >
                <label className="block text-lg text-black/80 font-medium mb-4 tracking-wide">
                  <DollarSign className="inline w-5 h-5 mr-2" />
                  {t('property_valuation')}
                </label>
                <div dir="ltr" className="space-y-6">
                  <div className="relative">
                    <input
                      type="range"
                      min="500000"
                      max="25000000"
                      step="250000"
                      value={budgetValue}
                      onChange={(e) => handleBudgetChange(Number(e.target.value))}
                      className="w-full h-3 bg-black/10 rounded-lg appearance-none cursor-pointer slider-custom"
                      style={{
                        background: `linear-gradient(to right, #000 0%, #000 ${(budgetValue - 500000) / (25000000 - 500000) * 100}%, #e5e5e5 ${(budgetValue - 500000) / (25000000 - 500000) * 100}%, #e5e5e5 100%)`
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">{formatBudget(budgetValue)}</div>
                  </div>
                </div>
                <input type="hidden" {...register('estimation')} />
              </motion.div>
            )}

            {/* Echeance du projet */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.95 }}
            >
              <span className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <CalendarClock className="inline w-4 h-4 mr-2" />
                {isSeller ? t('horizon_sell') : t('horizon_buy')} <span className="text-red-500">*</span>
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {HORIZONS.map((horizon) => (
                  <label
                    key={horizon}
                    className="flex items-center gap-3 px-3 py-3 border border-black/20 rounded-sm cursor-pointer transition-colors duration-300 hover:border-black/40 has-[:checked]:border-black has-[:checked]:bg-black/5"
                  >
                    <input
                      type="radio"
                      value={horizon}
                      {...register('horizon', { required: t('required_horizon') })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm text-black/70 font-light">
                      {t(HORIZON_LABEL_KEYS[horizon])}
                    </span>
                  </label>
                ))}
              </div>
              {errors.horizon && (
                <p className="text-red-500 text-sm mt-1">{errors.horizon.message}</p>
              )}
            </motion.div>

            {/* Message */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <label htmlFor="message" className="block text-sm text-black/60 font-light mb-3 tracking-wide">
                <MessageSquare className="inline w-4 h-4 mr-2" />
                {t('free_message')}
              </label>
              <textarea
                {...register('message')}
                rows={5}
                className="w-full px-3 md:px-4 py-3 border border-black/20 bg-transparent text-black font-light focus:border-black focus:outline-none transition-colors duration-300 resize-none rounded-sm"
                placeholder={isSeller 
                  ? t('describe_property')
                  : t('message_placeholder')
                }
              />
            </motion.div>

            {/* Page d'entree du lead, invisible pour le visiteur */}
            <input type="hidden" {...register('sourcePage')} />

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center pt-6"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black text-white px-10 py-4 rounded-sm font-light tracking-wide text-lg hover:bg-black/90 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? t('sending') : t('send_discreetly')}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      <style jsx global>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .slider-custom::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .slider-custom::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #000;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .slider-custom::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      <style jsx global>{`
  /* SLIDER PREMIUM */
  .slider-custom {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 4px;
    background: linear-gradient(to right, #000 0%, #000 100%);
    outline: none;
    transition: background 0.4s ease;
  }

  /* Curseur (Webkit - Chrome, Safari, etc.) */
  .slider-custom::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 28px;
    width: 28px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #111, #000);
    border: 2px solid #fff;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .slider-custom::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35),
                0 0 8px rgba(255, 215, 0, 0.3);
  }

  .slider-custom::-webkit-slider-thumb:active {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  /* Curseur (Firefox) */
  .slider-custom::-moz-range-thumb {
    height: 28px;
    width: 28px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #111, #000);
    border: 2px solid #fff;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  .slider-custom::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35),
                0 0 8px rgba(255, 215, 0, 0.3);
  }

  .slider-custom::-moz-range-thumb:active {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  /* Track (Firefox) */
  .slider-custom::-moz-range-track {
    height: 6px;
    border-radius: 4px;
    background: linear-gradient(to right, #000 0%, #000 100%);
  }

  /* Focus glow (accessibilité + élégance) */
  .slider-custom:focus::-webkit-slider-thumb {
    outline: none;
    box-shadow: 0 0 0 5px rgba(255, 215, 0, 0.2);
  }
`}</style>

    </div>
  );
}