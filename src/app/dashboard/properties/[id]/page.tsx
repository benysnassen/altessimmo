'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Eye, MapPin, Sparkles, User } from 'lucide-react';

type PropertyDetail = {
  id: string;
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
  seller: { name: string; phone: string; email?: string | null };
  images: Array<{ id: string; url: string; alt?: string | null; isPrimary: boolean }>;
  matches: Array<{
    id: string;
    score: number;
    reasons?: string | null;
    buyer: { name: string; phone: string; budget?: string | null; location?: string | null };
  }>;
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const authResponse = await fetch('/api/auth/verify/');
        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/properties/${params.id}/`);
        if (!response.ok) {
          router.push('/dashboard/properties');
          return;
        }
        const data = (await response.json()) as PropertyDetail;
        setProperty(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="admin-light min-h-screen bg-black flex items-center justify-center text-white/70">
        Chargement du detail du bien...
      </div>
    );
  }

  if (!property) return null;

  const primaryImage = property.images.find((image) => image.isPrimary) || property.images[0];

  return (
    <div className="admin-light min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Link href="/dashboard/properties" className="inline-flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Retour a la liste des biens
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid lg:grid-cols-[420px,1fr]">
            <div className="bg-white/5 border-r border-white/10">
              {primaryImage?.url ? (
                <img src={primaryImage.url} alt={primaryImage.alt || property.title} className="w-full h-full min-h-[320px] object-cover" />
              ) : (
                <div className="min-h-[320px] flex items-center justify-center text-white/40">
                  <Building2 className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full border border-white/20 text-sm">{property.propertyType}</span>
                <span className="px-3 py-1 rounded-full border border-white/20 text-sm">{property.status}</span>
                <span className="px-3 py-1 rounded-full border border-white/20 text-sm">{property.listingType}</span>
                {property.isFeatured && (
                  <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Mise en avant
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl mb-2">{property.title}</h1>
              <p className="text-2xl font-semibold mb-4">{property.price}</p>

              <div className="grid md:grid-cols-2 gap-3 text-sm text-white/75 mb-5">
                <p className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> {property.location} {property.neighborhood ? `- ${property.neighborhood}` : ''}</p>
                <p className="inline-flex items-center gap-2"><User className="w-4 h-4" /> {property.seller.name}</p>
                <p>Surface: {property.surface || 'n/a'} m2</p>
                <p>Terrain: {property.landSurface || 'n/a'} m2</p>
                <p>Pieces: {property.rooms || 'n/a'}</p>
                <p>SDB: {property.bathrooms || 'n/a'}</p>
                <p>Garages: {property.garages || 'n/a'}</p>
                <p>Etage: {property.floor || 'n/a'}</p>
              </div>

              {property.description && <p className="text-white/80 leading-relaxed mb-6">{property.description}</p>}

              <div className="border-t border-white/10 pt-5">
                <h2 className="font-display text-xl mb-3 inline-flex items-center gap-2"><Eye className="w-5 h-5" /> Matches acheteurs</h2>
                {property.matches.length === 0 ? (
                  <p className="text-white/50">Aucun match pour le moment.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {property.matches.map((match) => (
                      <div key={match.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
                        <p className="font-medium">{match.buyer.name} - {match.score}%</p>
                        <p className="text-sm text-white/60">{match.buyer.phone} | {match.buyer.budget || 'budget n/a'}</p>
                        <p className="text-sm text-white/75 mt-2">{match.reasons || 'Compatibilite globale.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {property.images.length > 1 && (
            <div className="p-4 md:p-6 border-t border-white/10 flex gap-3 overflow-x-auto">
              {property.images.map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt || property.title}
                  className={`w-28 h-20 object-cover rounded-lg border ${image.isPrimary ? 'border-emerald-400/60' : 'border-white/10'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
