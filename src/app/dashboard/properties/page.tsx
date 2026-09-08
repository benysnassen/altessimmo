'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Camera,
  Building2,
  Car,
  Check,
  Eye,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trees,
  Waves,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';

type SellerOption = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  status: string;
};

type BuyerMatch = {
  id: string;
  score: number;
  reasons?: string | null;
  buyer: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    budget?: string | null;
    location?: string | null;
  };
};

type PropertyImage = {
  id?: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
  localFile?: File | null;
};

type PropertyRecord = {
  id: string;
  sellerId: string;
  title: string;
  propertyType: string;
  status: string;
  listingType: string;
  location: string;
  neighborhood?: string | null;
  address?: string | null;
  price: string;
  surface?: number | null;
  landSurface?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  description?: string | null;
  hasGarden: boolean;
  hasPool: boolean;
  hasSeaView: boolean;
  isFeatured: boolean;
  seller: SellerOption;
  images: PropertyImage[];
  matches: BuyerMatch[];
};

type PropertyForm = {
  id?: string;
  sellerId: string;
  title: string;
  propertyType: string;
  status: string;
  listingType: string;
  location: string;
  neighborhood: string;
  address: string;
  price: string;
  surface: string;
  landSurface: string;
  rooms: string;
  bathrooms: string;
  garages: string;
  floor: string;
  yearBuilt: string;
  description: string;
  hasGarden: boolean;
  hasPool: boolean;
  hasSeaView: boolean;
  isFeatured: boolean;
  images: PropertyImage[];
};

const PROPERTY_TYPES = [
  'APARTMENT',
  'VILLA',
  'HOUSE',
  'RIAD',
  'LAND',
  'COMMERCIAL',
  'OFFICE',
  'PENTHOUSE',
  'DUPLEX',
  'OTHER',
] as const;

const PROPERTY_STATUSES = ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED'] as const;
const LISTING_TYPES = ['SALE', 'RENT'] as const;

const LABELS: Record<string, string> = {
  APARTMENT: 'Appartement',
  VILLA: 'Villa',
  HOUSE: 'Maison',
  RIAD: 'Riad',
  LAND: 'Terrain',
  COMMERCIAL: 'Commerce',
  OFFICE: 'Bureau',
  PENTHOUSE: 'Penthouse',
  DUPLEX: 'Duplex',
  OTHER: 'Autre',
  DRAFT: 'Brouillon',
  AVAILABLE: 'Disponible',
  RESERVED: 'Réservé',
  SOLD: 'Vendu',
  ARCHIVED: 'Archivé',
  SALE: 'Vente',
  RENT: 'Location',
};

const emptyForm = (): PropertyForm => ({
  sellerId: '',
  title: '',
  propertyType: 'APARTMENT',
  status: 'AVAILABLE',
  listingType: 'SALE',
  location: '',
  neighborhood: '',
  address: '',
  price: '',
  surface: '',
  landSurface: '',
  rooms: '',
  bathrooms: '',
  garages: '',
  floor: '',
  yearBuilt: '',
  description: '',
  hasGarden: false,
  hasPool: false,
  hasSeaView: false,
  isFeatured: false,
  images: Array.from({ length: 4 }, (_, index) => ({
    url: '',
    alt: '',
    isPrimary: index === 0,
    sortOrder: index,
    localFile: null,
  })),
});

const toNumberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCompactPrice = (value: string) => {
  const numeric = Number(value.replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return value;

  if (numeric >= 1_000_000) {
    const millions = numeric / 1_000_000;
    return `${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
  }

  if (numeric >= 1_000) {
    const thousands = numeric / 1_000;
    return `${thousands.toFixed(0)}K`;
  }

  return `${Math.round(numeric)}`;
};

export default function PropertiesDashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [form, setForm] = useState<PropertyForm>(emptyForm());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [matchesOnly, setMatchesOnly] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [sortBy, setSortBy] = useState<'none' | 'price' | 'status' | 'matches'>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const verify = async () => {
      const response = await fetch('/api/auth/verify/');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      setCheckingAuth(false);
    };

    verify().catch(() => {
      router.push('/login');
    });
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propertiesResponse, sellersResponse] = await Promise.all([
        fetch('/api/properties/'),
        fetch('/api/clients/?type=sellers'),
      ]);

      const propertiesData = await propertiesResponse.json();
      const sellersData = await sellersResponse.json();

      setProperties(propertiesData);
      setSellers(sellersData);
    } catch {
      setError('Impossible de charger les biens pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      loadData();
    }
  }, [checkingAuth]);

  const availableSellers = useMemo(
    () => sellers.filter((seller) => seller.status !== 'ARCHIVED'),
    [sellers]
  );

  const resetForm = () => {
    setForm(emptyForm());
    setError('');
    setMessage('');
    setActiveView('list');
  };

  const populateForm = (property: PropertyRecord) => {
    setForm({
      id: property.id,
      sellerId: property.sellerId,
      title: property.title,
      propertyType: property.propertyType,
      status: property.status,
      listingType: property.listingType,
      location: property.location,
      neighborhood: property.neighborhood || '',
      address: property.address || '',
      price: property.price,
      surface: property.surface?.toString() || '',
      landSurface: property.landSurface?.toString() || '',
      rooms: property.rooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      garages: property.garages?.toString() || '',
      floor: property.floor?.toString() || '',
      yearBuilt: property.yearBuilt?.toString() || '',
      description: property.description || '',
      hasGarden: property.hasGarden,
      hasPool: property.hasPool,
      hasSeaView: property.hasSeaView,
      isFeatured: property.isFeatured,
      images: property.images.length
        ? [
            ...property.images.map((image, index) => ({
              id: image.id,
              url: image.url,
              alt: image.alt || '',
              isPrimary: image.isPrimary,
              sortOrder: index,
              localFile: null,
            })),
            ...Array.from({ length: Math.max(0, 4 - property.images.length) }, (_, offset) => ({
              url: '',
              alt: '',
              isPrimary: false,
              sortOrder: property.images.length + offset,
              localFile: null,
            })),
          ].slice(0, 8)
        : emptyForm().images,
    });
    setActiveView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (index: number, field: keyof PropertyImage, value: string | boolean) => {
    setForm((current) => {
      const images = current.images.map((image, imageIndex) => {
        if (imageIndex !== index) {
          return field === 'isPrimary' ? { ...image, isPrimary: false } : image;
        }
        return {
          ...image,
          [field]: value,
        };
      });

      if (field === 'isPrimary') {
        images[index].isPrimary = true;
      }

      return { ...current, images };
    });
  };

  const addImageSlot = () => {
    setForm((current) => {
      if (current.images.length >= 8) return current;
      return {
        ...current,
        images: [
          ...current.images,
          {
            url: '',
            alt: '',
            isPrimary: current.images.length === 0,
            sortOrder: current.images.length,
            localFile: null,
          },
        ],
      };
    });
  };

  const removeImageSlot = (index: number) => {
    setForm((current) => {
      const next = current.images.filter((_, i) => i !== index);
      if (next.length === 0) {
        return {
          ...current,
          images: emptyForm().images,
        };
      }
      if (!next.some((img) => img.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return {
        ...current,
        images: next.map((img, i) => ({ ...img, sortOrder: i })),
      };
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setForm((current) => {
      if (toIndex < 0 || toIndex >= current.images.length) return current;
      const next = [...current.images];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return {
        ...current,
        images: next.map((img, i) => ({ ...img, sortOrder: i })),
      };
    });
  };

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new window.Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1600;
          const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
          canvas.width = Math.round(image.width * ratio);
          canvas.height = Math.round(image.height * ratio);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('ctx-unavailable'));
            return;
          }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('compression-failed'));
                return;
              }
              const filename = file.name.replace(/\.[^.]+$/, '') || 'image';
              resolve(new File([blob], `${filename}.webp`, { type: 'image/webp' }));
            },
            'image/webp',
            0.75
          );
        };
        image.onerror = reject;
        image.src = String(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (index: number, file?: File) => {
    if (!file) return;
    setError('');
    try {
      const compressed = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      setForm((current) => {
        const images = current.images.map((image, imageIndex) =>
          imageIndex === index
            ? {
                ...image,
                url: previewUrl,
                localFile: compressed,
                alt: image.alt || compressed.name.replace(/\.[^.]+$/, ''),
              }
            : image
        );
        return { ...current, images };
      });
    } catch {
      setError("Impossible de compresser cette image. Essaie un autre fichier.");
    }
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const basePayload = {
        id: form.id,
        sellerId: form.sellerId,
        title: form.title,
        propertyType: form.propertyType,
        status: form.status,
        listingType: form.listingType,
        location: form.location,
        neighborhood: form.neighborhood,
        address: form.address,
        price: form.price,
        surface: toNumberOrNull(form.surface),
        landSurface: toNumberOrNull(form.landSurface),
        rooms: toNumberOrNull(form.rooms),
        bathrooms: toNumberOrNull(form.bathrooms),
        garages: toNumberOrNull(form.garages),
        floor: toNumberOrNull(form.floor),
        yearBuilt: toNumberOrNull(form.yearBuilt),
        description: form.description,
        hasGarden: form.hasGarden,
        hasPool: form.hasPool,
        hasSeaView: form.hasSeaView,
        isFeatured: form.isFeatured,
      };

      const imageSlots = form.images.slice(0, 8);
      const nonEmptyImages = imageSlots.filter((image) => image.url || image.localFile);
      if (nonEmptyImages.length === 0) {
        throw new Error('at-least-one-image');
      }
      if (!nonEmptyImages.some((image) => image.isPrimary)) {
        throw new Error('primary-required');
      }

      let propertyId = form.id;
      if (!propertyId) {
        const createResponse = await fetch('/api/properties/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, images: [] }),
        });
        if (!createResponse.ok) throw new Error('create-failed');
        const created = await createResponse.json();
        propertyId = created.id as string;
      }

      const uploadedImages = await Promise.all(
        imageSlots.map(async (image, index) => {
          if (image.localFile && propertyId) {
            const formData = new FormData();
            formData.append('file', image.localFile);
            formData.append('propertyId', propertyId);
            const uploadResponse = await fetch('/api/properties/images/', {
              method: 'POST',
              body: formData,
            });
            if (!uploadResponse.ok) throw new Error('upload-failed');
            const uploaded = await uploadResponse.json();
            return {
              url: uploaded.url as string,
              alt: image.alt,
              isPrimary: image.isPrimary,
              sortOrder: index,
            };
          }

          if (image.url) {
            return {
              url: image.url,
              alt: image.alt,
              isPrimary: image.isPrimary,
              sortOrder: index,
            };
          }

          return null;
        })
      );

      const finalImages = uploadedImages.filter(Boolean);
      if (finalImages.length === 0) throw new Error('images-empty');

      const response = await fetch('/api/properties/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basePayload,
          id: propertyId,
          images: finalImages,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setMessage(form.id ? 'Bien mis a jour avec succes.' : 'Bien ajoute avec succes.');
      resetForm();
      await loadData();
      setActiveView('list');
    } catch {
      setError('Enregistrement impossible. Verifie les champs obligatoires et reessaie.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!window.confirm('Supprimer ce bien et ses images ?')) return;

    try {
      const response = await fetch('/api/properties/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error();
      setProperties((current) => current.filter((property) => property.id !== id));
      if (form.id === id) {
        resetForm();
      }
    } catch {
      setError('Suppression impossible pour le moment.');
    }
  };

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((property) => {
      if (statusFilter !== 'ALL' && property.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && property.propertyType !== typeFilter) return false;
      if (matchesOnly && property.matches.length === 0) return false;
      if (!searchTerm.trim()) return true;

      const query = searchTerm.toLowerCase();
      return (
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        (property.neighborhood || '').toLowerCase().includes(query) ||
        property.seller.name.toLowerCase().includes(query)
      );
    });

    if (sortBy === 'none') return filtered;

    const statusOrder = ['DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED'];
    const toNumber = (value: string) => {
      const parsed = Number(value.replace(/[^\d]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const sorted = [...filtered].sort((a, b) => {
      let compare = 0;
      if (sortBy === 'price') {
        compare = toNumber(a.price) - toNumber(b.price);
      } else if (sortBy === 'status') {
        compare = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      } else if (sortBy === 'matches') {
        compare = a.matches.length - b.matches.length;
      }
      return sortDirection === 'asc' ? compare : -compare;
    });

    return sorted;
  }, [properties, matchesOnly, searchTerm, statusFilter, typeFilter, sortBy, sortDirection]);

  const toggleSort = (column: 'price' | 'status' | 'matches') => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDirection(column === 'price' ? 'desc' : 'asc');
      return;
    }
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const SortIcon = ({ column }: { column: 'price' | 'status' | 'matches' }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-white/45" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-white" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-white" />
    );
  };

  if (checkingAuth || loading) {
    return (
      <div className="admin-light min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-light">Chargement des biens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-light min-h-screen bg-black text-white">
      <div className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </Link>
            <h1 className="font-display text-3xl font-normal tracking-wide mb-2">Biens & matching</h1>
            <p className="text-white/60 font-light">
              Enregistre les proprietes, lie-les a un proprietaire et visualise les acheteurs pertinents.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 min-w-[280px]">
            <div className="border border-white/10 bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/50 text-sm mb-1">Biens</p>
              <p className="text-2xl font-semibold">{properties.length}</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/50 text-sm mb-1">Dispo</p>
              <p className="text-2xl font-semibold">{properties.filter((property) => property.status === 'AVAILABLE').length}</p>
            </div>
            <div className="border border-white/10 bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/50 text-sm mb-1">Matches</p>
              <p className="text-2xl font-semibold">{properties.reduce((sum, property) => sum + property.matches.length, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm ${
                activeView === 'list' ? 'bg-white text-black border border-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Listing des biens
            </button>
            <button
              type="button"
              onClick={() => setActiveView('form')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm ${
                activeView === 'form' ? 'bg-white text-black border border-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {form.id ? 'Modifier le bien' : 'Ajouter un bien'}
            </button>
            <span className="text-xs text-white/50 md:ml-auto">
              Vue active: {activeView === 'list' ? 'Liste + filtres + matches' : 'Formulaire de saisie'}
            </span>
          </div>
        </div>

        {activeView === 'form' && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submitForm}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-normal">{form.id ? 'Modifier le bien' : 'Nouveau bien'}</h2>
              <p className="text-white/50 text-sm mt-1">Titre, medias, criteres et proprietaire associe.</p>
            </div>
            {form.id && (
              <button type="button" onClick={resetForm} className="text-sm text-white/60 hover:text-white">
                Annuler
              </button>
            )}
          </div>

          <div className="space-y-4">
            <select
              value={form.sellerId}
              onChange={(event) => setForm({ ...form, sellerId: event.target.value })}
              className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white"
              required
            >
              <option value="">Selectionner un proprietaire</option>
              {availableSellers.map((seller) => (
                <option key={seller.id} value={seller.id} className="bg-black">
                  {seller.name}
                </option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white"
              placeholder="Titre du bien"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <select value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white">
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-black">
                    {LABELS[type]}
                  </option>
                ))}
              </select>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white">
                {PROPERTY_STATUSES.map((status) => (
                  <option key={status} value={status} className="bg-black">
                    {LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select value={form.listingType} onChange={(event) => setForm({ ...form, listingType: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white">
                {LISTING_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-black">
                    {LABELS[type]}
                  </option>
                ))}
              </select>
              <input
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white"
                placeholder="Prix"
                required
              />
            </div>

            <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Ville / secteur principal" required />
            <input value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Quartier / residence" />
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Adresse precise" />

            <div className="grid grid-cols-2 gap-4">
              <input value={form.surface} onChange={(event) => setForm({ ...form, surface: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Surface m2" />
              <input value={form.landSurface} onChange={(event) => setForm({ ...form, landSurface: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Terrain m2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <input value={form.rooms} onChange={(event) => setForm({ ...form, rooms: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Pieces" />
              <input value={form.bathrooms} onChange={(event) => setForm({ ...form, bathrooms: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="SDB" />
              <input value={form.garages} onChange={(event) => setForm({ ...form, garages: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Garages" />
              <input value={form.floor} onChange={(event) => setForm({ ...form, floor: event.target.value })} className="px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Etage" />
            </div>

            <input value={form.yearBuilt} onChange={(event) => setForm({ ...form, yearBuilt: event.target.value })} className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white" placeholder="Annee de construction" />

            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-sm text-white min-h-[110px]"
              placeholder="Description du bien"
            />

            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'hasGarden', label: 'Jardin' },
                { key: 'hasPool', label: 'Piscine' },
                { key: 'hasSeaView', label: 'Vue mer' },
                { key: 'isFeatured', label: 'Mise en avant' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 px-4 py-3 bg-black/20 border border-white/10 rounded-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form[item.key as keyof PropertyForm])}
                    onChange={(event) => setForm({ ...form, [item.key]: event.target.checked })}
                    className="accent-white"
                  />
                  <span className="text-sm text-white/80">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="border border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white/80">Photo de l&apos;annonce</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60">{form.images.filter((img) => img.url || img.localFile).length}/8</span>
                  <button
                    type="button"
                    onClick={addImageSlot}
                    disabled={form.images.length >= 8}
                    className="px-3 py-1.5 rounded-full text-xs bg-black/10 border border-black/20 hover:bg-black/20 disabled:opacity-40"
                  >
                    + Ajouter une photo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {form.images.map((image, index) => (
                  <div
                    key={`${image.id || 'new'}-${index}`}
                    className="relative"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', String(index));
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const fromIndex = Number(event.dataTransfer.getData('text/plain'));
                      moveImage(fromIndex, index);
                    }}
                  >
                    <label
                      className="relative group border-2 border-dashed border-black/20 rounded-xl bg-white/70 hover:border-black/40 transition-colors cursor-pointer overflow-hidden aspect-[4/3] block"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleFileUpload(index, event.target.files?.[0])}
                        className="hidden"
                      />

                      {image.url ? (
                        <img
                          src={image.url}
                          alt={image.alt || `Photo ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-black/70">
                          <Camera className="w-7 h-7 mb-2" />
                          <span className="text-xs font-medium">{index + 1}/8</span>
                        </div>
                      )}

                      {/* Use zinc, not black: .admin-light [class*="bg-black"] forces opaque cream and hides previews */}
                      <div className="pointer-events-none absolute inset-0 z-[1] bg-transparent transition-colors group-hover:bg-zinc-900/10" />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleImageChange(index, 'isPrimary', true)}
                      disabled={!image.url}
                      className={`absolute bottom-2 left-2 z-[2] px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        image.isPrimary
                          ? 'bg-amber-400 text-black'
                          : 'bg-white/90 text-black hover:bg-white'
                      } ${!image.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {image.isPrimary ? '⭐ Photo principale' : 'Définir principale'}
                    </button>
                    {(image.url || form.images.length > 4) && (
                      <button
                        type="button"
                        onClick={() => removeImageSlot(index)}
                        className="absolute top-2 right-2 z-[2] p-1.5 rounded-full bg-zinc-900/75 text-white hover:bg-zinc-900"
                        aria-label="Retirer cette photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-indigo-100 text-indigo-700 px-4 py-3 text-sm">
                ℹ️ Faites glisser vos miniatures pour changer leur ordre.
              </div>
            </div>

            {message && <p className="text-sm text-green-300">{message}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Save className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              {form.id ? 'Mettre a jour le bien' : 'Enregistrer le bien'}
            </button>
          </div>
          </motion.form>
        )}

        {activeView === 'list' && (
          <div className="space-y-5">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 md:p-5">
            <h2 className="font-display text-xl md:text-2xl text-white mb-1">Listing des biens</h2>
            <p className="text-sm text-white/60">Filtre, parcours, matches et edition complete des biens.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
            <div className="grid md:grid-cols-4 gap-3">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Recherche titre, zone, proprietaire..."
                className="px-4 py-2.5 bg-black/30 border border-white/15 rounded-sm text-white"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="px-4 py-2.5 bg-black/30 border border-white/15 rounded-sm text-white"
              >
                <option value="ALL">Tous les statuts</option>
                {PROPERTY_STATUSES.map((status) => (
                  <option key={status} value={status} className="bg-black">
                    {LABELS[status]}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="px-4 py-2.5 bg-black/30 border border-white/15 rounded-sm text-white"
              >
                <option value="ALL">Tous les types</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-black">
                    {LABELS[type]}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-3 px-4 py-2.5 bg-black/30 border border-white/15 rounded-sm text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={matchesOnly}
                  onChange={(event) => setMatchesOnly(event.target.checked)}
                  className="accent-white"
                />
                Avec matches seulement
              </label>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[72vh]">
              <table className="w-full min-w-[980px] table-fixed">
                <thead className="bg-white/10 border-b border-white/10 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/15">
                  <tr className="text-left text-xs uppercase tracking-wide text-white/60">
                    <th className="px-4 py-3 w-[18%]">Bien</th>
                    <th className="px-4 py-3 w-[20%]">
                      <button
                        type="button"
                        onClick={() => toggleSort('status')}
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        Type / Statut
                        <SortIcon column="status" />
                      </button>
                    </th>
                    <th className="px-4 py-3 w-[12%]">
                      <button
                        type="button"
                        onClick={() => toggleSort('price')}
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        Prix
                        <SortIcon column="price" />
                      </button>
                    </th>
                    <th className="px-4 py-3 w-[14%]">Zone</th>
                    <th className="px-4 py-3 w-[12%]">Proprietaire</th>
                    <th className="px-4 py-3 w-[8%]">Images</th>
                    <th className="px-4 py-3 w-[8%]">
                      <button
                        type="button"
                        onClick={() => toggleSort('matches')}
                        className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        Matches
                        <SortIcon column="matches" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="border-b border-white/5 hover:bg-white/[0.08] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white truncate">{property.title}</p>
                        <p className="text-xs text-white/50 truncate">{property.surface ? `${property.surface} m2` : 'surface n/a'} - {property.rooms ? `${property.rooms}p` : 'pieces n/a'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-full text-xs border border-white/20 text-white/80">{LABELS[property.propertyType]}</span>
                          <span className="px-2 py-1 rounded-full text-xs border border-white/20 text-white/80">{LABELS[property.status]}</span>
                          {property.isFeatured && (
                            <span
                              className="px-2 py-1 rounded-full text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 inline-flex items-center justify-center"
                              title="Mise en avant"
                              aria-label="Mise en avant"
                            >
                              <Sparkles className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">{formatCompactPrice(property.price)}</td>
                      <td className="px-4 py-3 text-sm text-white/70">
                        <span className="block truncate">{property.location}</span>
                        {property.neighborhood ? <span className="block text-white/50 truncate">{property.neighborhood}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/75 truncate">{property.seller.name}</td>
                      <td className="px-4 py-3 text-sm text-white/75">{property.images.length}/8</td>
                      <td className="px-4 py-3 text-sm text-white/75">{property.matches.length}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/properties/${property.id}`}
                            className="group inline-flex items-center justify-center px-2.5 py-2 rounded-lg bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all"
                            aria-label="Voir ce bien"
                            title="Voir ce bien"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => populateForm(property)}
                            className="group inline-flex items-center justify-center px-2.5 py-2 rounded-lg border border-transparent bg-transparent text-sky-400 hover:text-sky-300 active:scale-[0.98] transition-all"
                            title="Modifier ce bien"
                            aria-label="Modifier ce bien"
                          >
                            <Pencil className="w-3.5 h-3.5 transition-transform group-hover:-rotate-6" />
                          </button>
                          <button
                            onClick={() => deleteProperty(property.id)}
                            className="group inline-flex items-center justify-center px-2.5 py-2 rounded-lg border border-transparent bg-transparent text-[#EC4134] hover:text-[#EC4134]/90 active:scale-[0.98] transition-all"
                            title="Supprimer ce bien"
                            aria-label="Supprimer ce bien"
                          >
                            <Trash2 className="w-3.5 h-3.5 transition-transform group-hover:rotate-[-8deg]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredProperties.length === 0 && (
            <div className="border border-dashed border-white/15 rounded-2xl p-8 text-center text-white/50">
              Aucun bien ne correspond aux filtres actifs.
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
}
