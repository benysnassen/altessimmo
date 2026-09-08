import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const normalizePhone = (value?: string) => {
  const raw = (value || '').trim();
  if (!raw) return '';

  if (raw.includes('|')) {
    const [dialCode, _country, digits = ''] = raw.split('|');
    const onlyDigits = digits.replace(/\D/g, '');
    const cleanDialCode = (dialCode || '').replace(/\D/g, '');
    return `${cleanDialCode}${onlyDigits}`;
  }

  return raw.replace(/\D/g, '');
};

/**
 * Historique des envois d'un prospect.
 *
 * La cle est le telephone normalise, pas l'identifiant : une fiche du
 * dashboard peut etre un buyer, un seller ou un contact brut, et l'historique
 * vit toujours sur la ligne `contacts`. Le telephone est ce qui les relie.
 */
export async function GET(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const { searchParams } = new URL(request.url);
    const phone = normalizePhone(searchParams.get('phone') || '');
    const type = searchParams.get('type') === 'SELLER' ? 'SELLER' : 'BUYER';

    if (!phone) {
      return NextResponse.json({ error: 'Telephone requis' }, { status: 400 });
    }

    const contact = await prisma.contact.findFirst({
      where: { type, phoneNormalized: phone },
      select: { id: true, sourcePage: true },
    });

    if (!contact) {
      return NextResponse.json({ submissions: [] });
    }

    const submissions = await prisma.contactSubmission.findMany({
      where: { contactId: contact.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        id: s.id,
        message: s.message,
        budget: s.budget,
        estimation: s.estimation,
        horizon: s.horizon,
        sourcePage: s.sourcePage,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
