import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

/**
 * Date de la prochaine action a mener sur un prospect.
 *
 * Elle vit sur les trois tables : une fiche acheteur ou proprietaire creee a
 * la main n'a pas de ligne `contacts` ou la ranger. On essaie donc les trois,
 * comme le fait deja la note personnelle.
 *
 * `nextActionAt: null` efface la date — c'est ainsi qu'on retire un prospect
 * de la liste des relances sans toucher a son statut.
 */
export async function PATCH(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const { contactId, nextActionAt } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    let date: Date | null = null;
    if (nextActionAt) {
      const parsee = new Date(nextActionAt);
      if (Number.isNaN(parsee.getTime())) {
        return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
      }
      date = parsee;
    }

    const cibles = [
      { modele: prisma.buyer, type: 'buyer' as const },
      { modele: prisma.seller, type: 'seller' as const },
      { modele: prisma.contact, type: 'contact' as const },
    ];

    for (const { modele, type } of cibles) {
      const maj = await (modele as { updateMany: (args: unknown) => Promise<{ count: number }> }).updateMany({
        where: { id: contactId },
        data: { nextActionAt: date },
      });

      if (maj.count > 0) {
        return NextResponse.json({ nextActionAt: date ? date.toISOString() : null, type });
      }
    }

    return NextResponse.json({ error: 'Contact introuvable' }, { status: 404 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la date de relance:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
