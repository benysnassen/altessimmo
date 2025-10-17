'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  DollarSign, 
  MessageSquare, 
  Edit3, 
  XCircle,
  StickyNote
} from 'lucide-react';
import StarRating from './StarRating';

// Composant Badge réutilisable
const Badge = ({ config, size = 'md' }: { config: any, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

// Composant Drapeau
const FlagIcon = ({ countryCode }: { countryCode: string }) => {
  const flagEmojis: { [key: string]: string } = {
    'MA': '🇲🇦', 'DZ': '🇩🇿', 'FR': '🇫🇷', 'US': '🇺🇸', 'ES': '🇪🇸',
    'IT': '🇮🇹', 'DE': '🇩🇪', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
    'ZA': '🇿🇦', 'EG': '🇪🇬', 'TN': '🇹🇳', 'LY': '🇱🇾'
  };

  return (
    <span className="text-lg" role="img" aria-label={`Flag of ${countryCode}`}>
      {flagEmojis[countryCode] || '🏳️'}
    </span>
  );
};

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  type: 'BUYER' | 'SELLER';
  budget?: string | null;
  estimation?: string | null;
  message?: string | null;
  personalNote?: string | null;
  rating?: number | null;
  confidential: boolean;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'VIEWING' | 'OFFER' | 'SOLD' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface ContactDetailCardProps {
  contact: Contact;
  onClose: () => void;
  onUpdateNote: (contactId: string, personalNote: string) => void;
  onUpdateRating: (contactId: string, rating: number | null) => void;
}

const ContactDetailCard = ({ contact, onClose, onUpdateNote, onUpdateRating }: ContactDetailCardProps) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(contact.personalNote || '');
  const [currentRating, setCurrentRating] = useState(contact.rating);

  useEffect(() => {
    setCurrentRating(contact.rating);
    setNoteValue(contact.personalNote || '');
  }, [contact.rating, contact.personalNote]);

  const handleSaveNote = async () => {
    try {
      await onUpdateNote(contact.id, noteValue);
      setIsEditingNote(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la note:', error);
    }
  };

  const handleCancelNote = () => {
    setNoteValue(contact.personalNote || '');
    setIsEditingNote(false);
  };

  const handleRatingChange = async (rating: number | null) => {
    try {
      setCurrentRating(rating);
      await onUpdateRating(contact.id, rating);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: string) => {
    const num = parseInt(amount.replace(/\D/g, ''));
    if (isNaN(num)) return amount;

    if (num >= 1000000) {
      const millions = num / 1000000;
      return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2).replace(/\.?0+$/, '')}M`;
    } else if (num >= 1000) {
      const milliers = num / 1000;
      return `${milliers % 1 === 0 ? milliers.toFixed(0) : milliers.toFixed(2).replace(/\.?0+$/, '')}K`;
    } else {
      return `${num.toLocaleString('fr-FR')}`;
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    // Format: +213 777-888-999
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 9) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };


  const getCountryCode = (phone: string): string => {
    // Supporte le format : +1|US|123456789
    if (phone.includes('|')) {
      const parts = phone.split('|');
      if (parts.length >= 2) return parts[1];
    }
  
    const countryCodes: { [key: string]: string } = {
      '+212': 'MA', '+213': 'DZ', '+33': 'FR', '+34': 'ES', '+39': 'IT',
      '+49': 'DE', '+44': 'GB', '+1': 'US', '+971': 'AE', '+966': 'SA',
      '+216': 'TN', '+20': 'EG', '+90': 'TR', '+7': 'RU', '+86': 'CN',
      '+81': 'JP', '+82': 'KR', '+91': 'IN', '+55': 'BR', '+54': 'AR',
      '+61': 'AU', '+27': 'ZA',
    };
  
    // Cas spécial pour +1 (Canada ou US)
    if (phone.startsWith('+1')) {
      const canadianAreaCodes = ['514', '438', '416', '604', '819', '905', '450'];
      const areaCode = phone.replace(/\D/g, '').slice(1, 4);
      return canadianAreaCodes.includes(areaCode) ? 'CA' : 'US';
    }
  
    for (const [prefix, code] of Object.entries(countryCodes)) {
      if (phone.startsWith(prefix)) return code;
    }
  
    return 'MA'; // par défaut
  };
  
  const splitPhoneParts = (phone: string): { code: string; number: string } => {
    if (phone.includes('|')) {
      const [code, , rawNumber] = phone.split('|');
      const cleaned = rawNumber.replace(/\D/g, '');
      return { code, number: cleaned };
    }
  
    const match = phone.match(/^(\+\d+)\s*(.*)$/);
    if (match) {
      const code = match[1];
      const number = match[2].replace(/\D/g, '');
      return { code, number };
    }
  
    return { code: '', number: phone.replace(/\D/g, '') };
  };
  

  const formatPhoneNumber = (num: string): string => {
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)}-${num.slice(3)}`;
    if (num.length <= 9) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6, 9)}-${num.slice(9)}`;
  };

  
// Fonction pour formater le numéro de téléphone avec des traits d'union

// Composant Drapeau
const FlagIcon = ({ countryCode }: { countryCode: string }) => {
  return (
    <img
      src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`}
      alt={`Drapeau ${countryCode}`}
      className="w-6 h-4 rounded-sm object-cover border border-white/20"
      onError={(e) => {
        // Fallback si l'image ne charge pas
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};





  const contactTypeConfig = {
    BUYER: { label: 'Acheteur', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '🛒' },
    SELLER: { label: 'Vendeur', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '🏠' }
  };

  const contactStatusConfig = {
    NEW: { label: 'Nouveau', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: '⭐' },
    CONTACTED: { label: 'Contacté', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '📞' },
    INTERESTED: { label: 'Intéressé', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: '👀' },
    VIEWING: { label: 'Visite', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '👁️' },
    OFFER: { label: 'Offre', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '💰' },
    SOLD: { label: 'Vendu', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '✅' },
    ARCHIVED: { label: 'Archivé', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: '📁' }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black border border-white/20 rounded-none md:rounded-lg p-1 md:p-6 w-full md:max-w-2xl md:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-light text-white mb-2 truncate">{contact.name}</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge config={contactTypeConfig[contact.type]} />
              <Badge config={contactStatusConfig[contact.status]} />
            </div>
          </div>
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => {
                onClose();
                // Déclencher l'édition du contact
                setTimeout(() => {
                  const event = new CustomEvent('editContact', { detail: contact });
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Modifier le contact"
            >
              <Edit3 className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <XCircle className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 gap-2 md:gap-3">
          <div className="flex items-center gap-2">
  <Phone className="w-3 h-3 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
  <FlagIcon countryCode={getCountryCode(contact.phone)} />

  {/* Téléphone formaté proprement */}
  {(() => {
    const { code, number } = splitPhoneParts(contact.phone);
    return (
      <span className="flex gap-1 items-center text-white/80 font-mono tracking-wider text-xs md:text-sm">
        <span>{code}</span>
        <span className="opacity-50">|</span>
        <span>{formatPhoneNumber(number)}</span>
      </span>
    );
  })()}
</div>

            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/80 text-xs md:text-sm break-all">{contact.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
              <span className="text-white/80 text-xs md:text-sm">{formatDate(contact.createdAt)}</span>
            </div>
            {contact.confidential && (
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/80 text-xs md:text-sm">Confidentiel</span>
              </div>
            )}
          </div>
          
          {/* Note personnelle */}
          <div className="border-t border-white/10 pt-3 md:pt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 md:mb-3">
              <h4 className="text-xs md:text-sm font-light text-white/60 uppercase tracking-wider">Note personnelle</h4>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-xs text-white/60 hover:text-white/80 hover:bg-white/10 rounded-sm transition-colors self-start"
                >
                  <Edit3 className="w-2 h-2 md:w-3 md:h-3" />
                  {contact.personalNote ? 'Modifier' : 'Ajouter'}
                </button>
              )}
            </div>
            
            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-sm px-2 md:px-3 py-2 text-white text-xs md:text-sm placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                  rows={3}
                  placeholder="Ajouter une note personnelle..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="px-2 md:px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleCancelNote}
                    className="px-2 md:px-3 py-1 bg-white/10 text-white/60 text-xs rounded-sm hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <StickyNote className="w-3 h-3 md:w-4 md:h-4 text-white/40 mt-1 flex-shrink-0" />
                <p className="text-white/80 leading-relaxed text-xs md:text-sm break-words">
                  {noteValue || 'Aucune note personnelle'}
                </p>
              </div>
            )}
          </div>
          
          {/* Évaluation */}
          <div className="border-t border-white/10 pt-3 md:pt-4">
            <h4 className="text-xs md:text-sm font-light text-white/60 mb-2 md:mb-3 uppercase tracking-wider">Évaluation</h4>
            <div className="flex items-center gap-2 md:gap-3">
              <StarRating
                rating={currentRating ?? null}
                onRatingChange={handleRatingChange}
                size="md"
                interactive={true}
              />
              {currentRating && (
                <span className="text-xs md:text-sm text-white/60">
                  {currentRating === 1 && 'Très faible'}
                  {currentRating === 2 && 'Faible'}
                  {currentRating === 3 && 'Moyen'}
                  {currentRating === 4 && 'Bon'}
                  {currentRating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>
          
          {(contact.budget || contact.estimation) && (
            <div className="border-t border-white/10 pt-3 md:pt-4">
              <h4 className="text-xs md:text-sm font-light text-white/60 mb-2 md:mb-3 uppercase tracking-wider">Montants</h4>
              <div className="space-y-1 md:space-y-2">
                {contact.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0" />
                    <span className="text-green-300 font-mono text-xs md:text-sm break-all">{formatAmount(contact.budget)}</span>
                  </div>
                )}
                {contact.estimation && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-blue-300 font-mono text-xs md:text-sm break-all">{formatAmount(contact.estimation)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {contact.message && (
            <div className="border-t border-white/10 pt-3 md:pt-4">
              <h4 className="text-xs md:text-sm font-light text-white/60 mb-2 md:mb-3 uppercase tracking-wider">Message</h4>
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3 h-3 md:w-4 md:h-4 text-white/40 mt-1 flex-shrink-0" />
                <p className="text-white/80 leading-relaxed text-xs md:text-sm break-words">{contact.message}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactDetailCard;
