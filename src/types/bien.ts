export type Bien = {
  id: string;
  adresse: string;
  quartier: string;
  type: 'Appartement' | 'Maison' | 'Villa' | 'Loft' | 'Studio';
  etat: 'Neuf' | 'Rénové' | 'Ancien' | 'Luxe';
  chambres: number;
  surface: number;
  prix: number;
  etage?: number;
  score: number;
  statut: 'Disponible' | 'Loué' | 'Option';
  favori: boolean;
  created_at: string;
  caracteristiques?: string[];
  photos?: string[];
};
