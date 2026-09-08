import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const { contactId, personalNote } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    const updatedBuyer = await prisma.buyer.updateMany({
      where: { id: contactId },
      data: { personalNote: personalNote || null },
    });

    if (updatedBuyer.count > 0) {
      return NextResponse.json({ message: 'Note mise a jour', type: 'buyer' }, { status: 200 });
    }

    const updatedSeller = await prisma.seller.updateMany({
      where: { id: contactId },
      data: { personalNote: personalNote || null },
    });

    if (updatedSeller.count > 0) {
      return NextResponse.json({ message: 'Note mise a jour', type: 'seller' }, { status: 200 });
    }

    const updatedContact = await prisma.contact.updateMany({
      where: { id: contactId },
      data: { personalNote: personalNote || null },
    });

    if (updatedContact.count > 0) {
      return NextResponse.json({ message: 'Note mise a jour', type: 'contact' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Contact introuvable' }, { status: 404 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note personnelle:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
