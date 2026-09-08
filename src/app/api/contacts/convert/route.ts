import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

/**
 * Promeut un lead du formulaire en fiche client.
 *
 * Les deux etages restent distincts : la ligne `contacts` garde la trace de
 * l'origine et l'historique des demandes, la fiche `buyers` ou `sellers`
 * porte le suivi commercial. Le telephone normalise les relie — c'est deja
 * la cle utilisee par la liste du dashboard pour ne pas afficher de doublon.
 *
 * L'operation est sans perte : rien n'est supprime, et convertir deux fois
 * ne cree pas de doublon puisque `phoneNormalized` est unique.
 */
export async function POST(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });

    if (!contact) {
      return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });
    }

    if (!contact.phoneNormalized) {
      return NextResponse.json(
        { error: 'Ce lead n\'a pas de telephone exploitable' },
        { status: 400 }
      );
    }

    /**
     * Les trois modeles n'ont pas les memes statuts. Convertir ne doit jamais
     * faire reculer le suivi : a defaut de correspondance exacte, on retombe
     * sur CONTACTED — jamais sur NEW, qui effacerait le travail deja fait.
     */
    const statutAcheteur: Record<string, string> = {
      NEW: 'NEW',
      CONTACTED: 'CONTACTED',
      INTERESTED: 'INTERESTED',
      VIEWING: 'VIEWING',
      OFFER: 'OFFER_MADE',
      SOLD: 'PURCHASED',
      ARCHIVED: 'ARCHIVED',
    };

    const statutProprietaire: Record<string, string> = {
      NEW: 'NEW',
      CONTACTED: 'CONTACTED',
      INTERESTED: 'CONTACTED', // le modele proprietaire n'a pas d'equivalent
      VIEWING: 'VIEWING',
      OFFER: 'OFFER_RECEIVED',
      SOLD: 'SOLD',
      ARCHIVED: 'ARCHIVED',
    };

    const commun = {
      name: contact.name,
      phone: contact.phone,
      phoneNormalized: contact.phoneNormalized,
      email: contact.email,
      message: contact.message,
      personalNote: contact.personalNote,
      rating: contact.rating,
      confidential: contact.confidential,
      nextActionAt: contact.nextActionAt,
    };

    if (contact.type === 'SELLER') {
      const existante = await prisma.seller.findUnique({
        where: { phoneNormalized: contact.phoneNormalized },
        select: { id: true },
      });

      if (existante) {
        return NextResponse.json(
          { error: 'Une fiche proprietaire existe deja pour ce telephone', id: existante.id },
          { status: 409 }
        );
      }

      const seller = await prisma.seller.create({
        data: {
          ...commun,
          price: contact.estimation,
          status: (statutProprietaire[contact.status] ?? 'CONTACTED') as never,
        },
      });
      return NextResponse.json({ id: seller.id, type: 'seller' }, { status: 201 });
    }

    const existante = await prisma.buyer.findUnique({
      where: { phoneNormalized: contact.phoneNormalized },
      select: { id: true },
    });

    if (existante) {
      return NextResponse.json(
        { error: 'Une fiche acheteur existe deja pour ce telephone', id: existante.id },
        { status: 409 }
      );
    }

    const buyer = await prisma.buyer.create({
      data: {
        ...commun,
        budget: contact.budget,
        status: (statutAcheteur[contact.status] ?? 'CONTACTED') as never,
      },
    });
    return NextResponse.json({ id: buyer.id, type: 'buyer' }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la conversion du lead:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
