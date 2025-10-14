'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Home, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  MoreVertical,
  Edit3,
  Filter,
  Search,
  LogOut,
  User,
  ShoppingCart,
  Building2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  DollarSign,
  MapPin,
  MessageSquare,
  Trash2,
  Save,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Key,
  StickyNote
} from 'lucide-react';
import ChangePasswordModal from '@/app/components/ChangePasswordModal';
import ContactDetailCard from '@/app/components/ContactDetailCard';
import StarRating from '@/app/components/StarRating';
import ProportionalStar from '@/app/components/ProportionalStar';
import { useDropdownPosition } from '../hooks/useDropdownPosition';

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

// Badges colorés avec icônes pour les statuts
const statusConfig = {
  NEW: {
    label: 'Nouveau',
    icon: Star,
    className: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30',
    iconColor: 'text-gray-400'
  },
  CONTACTED: {
    label: 'Contacté',
    icon: Phone,
    className: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  INTERESTED: {
    label: 'Intéressé',
    icon: Star,
    className: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-500/30',
    iconColor: 'text-yellow-400'
  },
  VIEWING: {
    label: 'Visite',
    icon: Eye,
    className: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  OFFER: {
    label: 'Offre',
    icon: DollarSign,
    className: 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/30',
    iconColor: 'text-orange-400'
  },
  SOLD: {
    label: 'Vendu',
    icon: CheckCircle,
    className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30',
    iconColor: 'text-green-400'
  },
  ARCHIVED: {
    label: 'Archivé',
    icon: Archive,
    className: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30',
    iconColor: 'text-red-400'
  }
};

// Configuration pour les types de contacts
const typeConfig = {
  BUYER: {
    label: 'Acheteur',
    icon: ShoppingCart,
    className: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  SELLER: {
    label: 'Vendeur',
    icon: Building2,
    className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-500/30',
    iconColor: 'text-green-400'
  }
};

// Fonction de formatage des montants
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

// Fonction de formatage des dates (avec heure pour la carte de détail)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Fonction de formatage des dates (sans heure pour le tableau)
const formatDateTable = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Fonction pour extraire le code pays du numéro de téléphone
const getCountryCode = (phone: string): string => {
  // Mapping des indicatifs vers les codes pays ISO
  const countryCodes: { [key: string]: string } = {
    '+212': 'MA', // Maroc
    '+33': 'FR',  // France
    '+34': 'ES',  // Espagne
    '+39': 'IT',  // Italie
    '+49': 'DE',  // Allemagne
    '+44': 'GB',  // Royaume-Uni
    '+1': 'US',   // États-Unis/Canada
    '+971': 'AE', // Émirats arabes unis
    '+966': 'SA', // Arabie saoudite
    '+213': 'DZ', // Algérie
    '+216': 'TN', // Tunisie
    '+20': 'EG',  // Égypte
    '+90': 'TR',  // Turquie
    '+7': 'RU',   // Russie
    '+86': 'CN',  // Chine
    '+81': 'JP',  // Japon
    '+82': 'KR',  // Corée du Sud
    '+91': 'IN',  // Inde
    '+55': 'BR',  // Brésil
    '+54': 'AR',  // Argentine
    '+61': 'AU',  // Australie
    '+27': 'ZA',  // Afrique du Sud
  };

  // Extraire l'indicatif du numéro
  for (const [code, country] of Object.entries(countryCodes)) {
    if (phone.startsWith(code)) {
      return country;
    }
  }
  
  // Par défaut, retourner le Maroc si on ne trouve pas
  return 'MA';
};

// Fonction pour formater le numéro de téléphone avec des traits d'union
const formatPhoneDisplay = (phone: string): string => {
  // Séparer l'indicatif du numéro
  const parts = phone.split(' ');
  if (parts.length < 2) return phone;
  
  const countryCode = parts[0];
  const number = parts[1];
  
  // Supprimer tous les caractères non numériques du numéro
  const cleanedNumber = number.replace(/\D/g, '');
  
  // Formatage selon la longueur
  if (cleanedNumber.length <= 3) {
    return `${countryCode} ${cleanedNumber}`;
  } else if (cleanedNumber.length <= 6) {
    return `${countryCode} ${cleanedNumber.slice(0, 3)}-${cleanedNumber.slice(3)}`;
  } else if (cleanedNumber.length <= 9) {
    return `${countryCode} ${cleanedNumber.slice(0, 3)}-${cleanedNumber.slice(3, 6)}-${cleanedNumber.slice(6)}`;
  } else {
    return `${countryCode} ${cleanedNumber.slice(0, 3)}-${cleanedNumber.slice(3, 6)}-${cleanedNumber.slice(6, 9)}-${cleanedNumber.slice(9, 12)}`;
  }
};

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

// Composant Badge cliquable pour les statuts
const ClickableStatusBadge = ({ contact, onStatusChange }: { contact: Contact, onStatusChange: (id: string, newStatus: Contact['status']) => void }) => {
  const currentConfig = statusConfig[contact.status] || statusConfig.NEW;
  const IconComponent = currentConfig.icon;
  
  const {
    isOpen,
    position,
    triggerRef,
    dropdownRef,
    toggleDropdown,
    closeDropdown
  } = useDropdownPosition();

  const handleStatusChange = (newStatus: Contact['status']) => {
    console.log('Changing status for', contact.id, 'to', newStatus);
    onStatusChange(contact.id, newStatus);
    closeDropdown();
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, closeDropdown]);

  return (
    <div className="relative" ref={triggerRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium px-2 py-1 text-xs cursor-pointer transition-all duration-200 hover:scale-105 ${currentConfig.className}`}
      >
        <IconComponent className={`w-3 h-3 ${currentConfig.iconColor}`} />
        {currentConfig.label}
      </button>
      
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bg-black/90 border border-white/20 rounded-lg p-2 z-50 min-w-[120px]"
          style={{
            ...position,
            transform: position.transform || 'translateY(4px)'
          }}
        >
          {Object.entries(statusConfig).map(([value, config]) => {
            const StatusIcon = config.icon;
            return (
              <button
                key={value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(value as Contact['status']);
                }}
                className={`w-full text-left px-2 py-1 rounded-sm text-xs flex items-center gap-2 hover:bg-white/10 transition-colors ${
                  contact.status === value ? 'bg-white/10' : ''
                }`}
              >
                <StatusIcon className={`w-3 h-3 ${config.iconColor}`} />
                {config.label}
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

// Composant Menu contextuel
const ContextMenu = ({ contact, onEdit, onDelete, onClose }: { 
  contact: Contact, 
  onEdit: (contact: Contact) => void, 
  onDelete: (id: string) => void,
  onClose: () => void 
}) => {
  const {
    position,
    dropdownRef
  } = useDropdownPosition();

  const handleEdit = () => {
    onEdit(contact);
    onClose();
  };

  const handleDelete = () => {
    onDelete(contact.id);
    onClose();
  };

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute bg-black/90 border border-white/20 rounded-lg p-2 z-50 w-[60px] shadow-xl"
      style={{
        ...position,
        transform: position.transform || 'translateY(8px)'
      }}
    >
      <button
        onClick={handleEdit}
        className="w-full text-left px-3 py-2 rounded-sm text-sm flex items-center justify-center hover:bg-white/10 transition-colors text-white/80"
      >
        <Edit3 className="w-4 h-4 text-blue-400" />
      </button>
      <button
        onClick={handleDelete}
        className="w-full text-left px-3 py-2 rounded-sm text-sm flex items-center justify-center hover:bg-white/10 transition-colors text-white/80"
      >
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </motion.div>
  );
};

// Composant Badge réutilisable
const Badge = ({ config, size = 'sm' }: { config: any, size?: 'sm' | 'md' }) => {
  if (!config || !config.icon) {
    return <span className="text-white/40">-</span>;
  }
  
  const IconComponent = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.className} ${sizeClasses}`}>
      <IconComponent className={`w-3 h-3 ${config.iconColor}`} />
      {config.label}
    </span>
  );
};


// Composant Pagination
const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems, 
  onPageChange, 
  onItemsPerPageChange 
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/60">
          Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} contacts
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Par page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 bg-black/20 border border-white/20 rounded-sm text-white text-sm focus:border-white/50 focus:outline-none [&>option]:bg-black [&>option]:text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-white/20 rounded-sm text-white/60 hover:border-white/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex gap-1">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-1 text-sm border border-white/20 rounded-sm text-white/60 hover:border-white/40 hover:text-white transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-white/40">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm border rounded-sm transition-colors ${
                page === currentPage
                  ? 'border-white/50 bg-white/10 text-white'
                  : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-white/40">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 text-sm border border-white/20 rounded-sm text-white/60 hover:border-white/40 hover:text-white transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-white/20 rounded-sm text-white/60 hover:border-white/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Composant Formulaire de modification
const EditContactForm = ({ contact, onSave, onCancel }: { 
  contact: Contact, 
  onSave: (updatedContact: Contact) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState({
    name: contact.name,
    phone: contact.phone,
    email: contact.email || '',
    budget: contact.budget || '',
    estimation: contact.estimation || '',
    message: contact.message || '',
    personalNote: contact.personalNote || '',
    confidential: contact.confidential
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedContact: Contact = {
      ...contact,
      ...formData,
      email: formData.email || undefined,
      budget: formData.budget || undefined,
      estimation: formData.estimation || undefined,
      message: formData.message || undefined
    };
    onSave(updatedContact);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black border border-white/20 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-light text-white">
            Modifier {contact.type === 'BUYER' ? 'l\'acheteur' : 'le vendeur'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-sm transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-white/60 mb-2">Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-light text-white/60 mb-2">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-light text-white/60 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none"
              />
            </div>
            
            {contact.type === 'BUYER' ? (
              <div>
                <label className="block text-sm font-light text-white/60 mb-2">Budget (MAD)</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none"
                  placeholder="Ex: 2500000"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-light text-white/60 mb-2">Estimation (MAD)</label>
                <input
                  type="text"
                  value={formData.estimation}
                  onChange={(e) => setFormData({ ...formData, estimation: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none"
                  placeholder="Ex: 4500000"
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-light text-white/60 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-white/60 mb-2">Note personnelle</label>
            <textarea
              value={formData.personalNote}
              onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
              rows={3}
              placeholder="Ex: Très bon investisseur, recherche que du top..."
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none resize-none"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="confidential"
              checked={formData.confidential}
              onChange={(e) => setFormData({ ...formData, confidential: e.target.checked })}
              className="w-4 h-4 text-black bg-black/20 border-white/20 rounded focus:ring-black accent-black"
            />
            <label htmlFor="confidential" className="text-sm text-white/80">
              Accompagnement confidentiel
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-white/20 text-white/60 hover:border-white/40 hover:text-white/80 transition-colors rounded-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors rounded-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUYER' | 'SELLER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Contact['status']>('ALL');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contextMenuContact, setContextMenuContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Écouter l'événement d'édition depuis la carte de détail
    const handleEditContact = (event: CustomEvent) => {
      setEditingContact(event.detail);
    };
    
    window.addEventListener('editContact', handleEditContact as EventListener);
    
    return () => {
      window.removeEventListener('editContact', handleEditContact as EventListener);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, typeFilter, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.admin);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/verify', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(contact => contact.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  };

  const updateContactStatus = async (id: string, newStatus: Contact['status']) => {
    console.log('updateContactStatus called:', id, newStatus);
    try {
      const response = await fetch('/api/contacts/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (response.ok) {
        console.log('Status updated successfully');
        setContacts(contacts.map(contact =>
          contact.id === id ? { ...contact, status: newStatus } : contact
        ));
      } else {
        console.error('Failed to update status:', response.status);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleUpdatePersonalNote = async (contactId: string, personalNote: string) => {
    try {
      const response = await fetch('/api/contacts/personal-note', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, personalNote })
      });

      if (response.ok) {
        console.log('Note personnelle mise à jour avec succès');
        setContacts(contacts.map(contact =>
          contact.id === contactId ? { ...contact, personalNote } : contact
        ));
      } else {
        console.error('Failed to update personal note:', response.status);
        throw new Error('Erreur lors de la mise à jour de la note');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note personnelle:', error);
      throw error;
    }
  };

  const handleUpdateRating = async (contactId: string, rating: number | null) => {
    try {
      const response = await fetch('/api/contacts/rating/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, rating })
      });

      if (response.ok) {
        console.log('Évaluation mise à jour avec succès');
        setContacts(contacts.map(contact =>
          contact.id === contactId ? { ...contact, rating } : contact
        ));
      } else {
        console.error('Failed to update rating:', response.status);
        throw new Error('Erreur lors de la mise à jour de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
      throw error;
    }
  };

  const handleEditContact = async (updatedContact: Contact) => {
    try {
      const response = await fetch('/api/contacts/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContact)
      });

      if (response.ok) {
        const updatedContacts = contacts.map(contact =>
          contact.id === updatedContact.id ? updatedContact : contact
        );
        setContacts(updatedContacts);
        
        // Mettre à jour selectedContact si c'est le contact actuellement sélectionné
        if (selectedContact && selectedContact.id === updatedContact.id) {
          setSelectedContact(updatedContact);
        }
        
        setEditingContact(null);
      } else {
        console.error('Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

    try {
      const response = await fetch('/api/contacts/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setContacts(contacts.filter(contact => contact.id !== id));
        setContextMenuContact(null);
      } else {
        console.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const buyers = contacts.filter(c => c.type === 'BUYER');
  const sellers = contacts.filter(c => c.type === 'SELLER');
  const newContacts = contacts.filter(c => c.status === 'NEW');

  // Logique de pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 font-light">Vérification de l'authentification...</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 font-light">Chargement du dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 py-8"
      >
        <div className="max-w-7xl mx-auto px-0 md:px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display text-3xl font-light tracking-wide mb-2">
                Dashboard
              </h1>
              <p className="text-white/60 font-light">
                Gestion des contacts et propriétés
              </p>
            </div>
            <div className="flex items-center space-x-4 pt-1">
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <div className="flex items-center space-x-2 text-white/60">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.username}</span>
                  </div>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto"
                  >
                    <div className="bg-black/90 border border-white/20 rounded-lg p-2 whitespace-nowrap hover:bg-black/95 hover:border-white/30 transition-all duration-200 cursor-pointer">
                      <span className="text-xs text-white/70">Changer mot de passe</span>
                    </div>
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 rounded-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden md:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-0 md:px-8 py-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          {/* Nouveaux contacts */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">Nouveaux contacts</p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{newContacts.length}</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((newContacts.length / Math.max(contacts.length, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Acheteurs actifs */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">Acheteurs actifs</p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Home className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{buyers.filter(b => b.status !== 'ARCHIVED').length}</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((buyers.filter(b => b.status !== 'ARCHIVED').length / Math.max(contacts.length, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendeurs actifs */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">Vendeurs actifs</p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Shield className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{sellers.filter(s => s.status !== 'ARCHIVED').length}</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((sellers.filter(s => s.status !== 'ARCHIVED').length / Math.max(contacts.length, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ventes conclues */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 md:p-6 transition-all duration-300 hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="flex flex-col h-full">
              <div className="text-center mb-3">
                <p className="text-white/70 text-sm md:text-base font-semibold mb-2">Ventes conclues</p>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-orange-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{contacts.filter(c => c.status === 'SOLD').length}</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min((contacts.filter(c => c.status === 'SOLD').length / Math.max(contacts.length, 1)) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-0 md:px-8 pb-8"
      >
        <div className="bg-white/5 border border-white/10 rounded-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, téléphone, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/20 rounded-sm text-white placeholder-white/40 focus:border-white/50 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2 md:gap-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="flex-1 px-2 md:px-4 py-3 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none [&>option]:bg-black [&>option]:text-white text-sm"
              >
                <option value="ALL">Tous les types</option>
                <option value="BUYER">Acheteurs</option>
                <option value="SELLER">Vendeurs</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 px-2 md:px-4 py-3 bg-black/20 border border-white/20 rounded-sm text-white focus:border-white/50 focus:outline-none [&>option]:bg-black [&>option]:text-white text-sm"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="NEW">Nouveau</option>
                <option value="CONTACTED">Contacté</option>
                <option value="INTERESTED">Intéressé</option>
                <option value="VIEWING">Visite</option>
                <option value="OFFER">Offre</option>
                <option value="SOLD">Vendu</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto px-0 md:px-8 pb-16"
      >
        <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-2 md:px-6 py-4 text-left text-sm font-light text-white/60 tracking-wide">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="hidden md:inline">Contact</span>
                    </div>
                  </th>
                  <th className="px-2 md:px-6 py-4 text-left text-sm font-light text-white/60 tracking-wide">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="hidden md:inline">Type</span>
                    </div>
                  </th>
                  <th className="px-2 md:px-6 py-4 text-left text-sm font-light text-white/60 tracking-wide">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="hidden md:inline">Budget (MAD)</span>
                    </div>
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-light text-white/60 tracking-wide">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>Statut</span>
                    </div>
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-light text-white/60 tracking-wide">Date</th>
                  <th className="px-2 md:px-6 py-4 text-left text-sm font-light text-white/60 tracking-wide">
                    <div className="flex items-center gap-1">
                      <MoreVertical className="w-4 h-4" />
                      <span className="hidden md:inline">Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-2 md:px-6 py-4">
                      <div className="font-light text-white flex items-center gap-1">
                        <FlagIcon countryCode={getCountryCode(contact.phone)} />
                        <span className="truncate max-w-[60px] md:max-w-none text-xs md:text-sm">{contact.name.substring(0, 8)}</span>
                        {contact.personalNote && (
                          <StickyNote className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        )}
                        {contact.rating && (
                          <ProportionalStar rating={contact.rating} size="sm" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-2 md:px-6 py-4">
                      <Badge config={typeConfig[contact.type] || typeConfig.BUYER} size="sm" />
                    </td>
                    
                    <td className="px-2 md:px-6 py-4">
                      <div className="text-white/80">
                        {contact.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <span className="text-green-300 font-mono text-xs md:text-base font-semibold">{formatAmount(contact.budget)}</span>
                          </div>
                        )}
                        {contact.estimation && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-300 font-mono text-xs md:text-base font-semibold">{formatAmount(contact.estimation)}</span>
                          </div>
                        )}
                        {!contact.budget && !contact.estimation && (
                          <span className="text-white/40 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="hidden md:table-cell px-6 py-4">
                      <ClickableStatusBadge
                        contact={contact} 
                        onStatusChange={updateContactStatus} 
                      />
                    </td>
                    
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="text-sm text-white/60 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-white/40" />
                        <span>{formatDateTable(contact.createdAt)}</span>
                      </div>
                    </td>
                    
                    <td className="px-2 md:px-6 py-4">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenuContact(contextMenuContact?.id === contact.id ? null : contact);
                          }}
                          className="p-1 md:p-2 hover:bg-white/10 rounded-sm transition-colors"
                        >
                          <MoreVertical className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
                        </button>
                        
                        {contextMenuContact?.id === contact.id && (
                          <ContextMenu
                            contact={contact}
                            onEdit={setEditingContact}
                            onDelete={handleDeleteContact}
                            onClose={() => setContextMenuContact(null)}
                          />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 font-light">Aucun contact trouvé</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredContacts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredContacts.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </motion.div>
      
      {/* Card de détail */}
      {selectedContact && (
        <ContactDetailCard 
          contact={selectedContact} 
          onClose={() => setSelectedContact(null)} 
          onUpdateNote={handleUpdatePersonalNote}
          onUpdateRating={handleUpdateRating}
        />
      )}
      
      {/* Formulaire d'édition */}
      {editingContact && (
        <EditContactForm
          contact={editingContact}
          onSave={handleEditContact}
          onCancel={() => setEditingContact(null)}
        />
      )}

      {/* Modal de changement de mot de passe */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}