import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { contactId, rating } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    if (rating !== null && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'L\'évaluation doit être entre 1 et 5' }, { status: 400 });
    }

    const updatedBuyer = await prisma.buyer.updateMany({
      where: { id: contactId },
      data: { rating },
    });

    if (updatedBuyer.count > 0) {
      return NextResponse.json({ message: 'Evaluation mise a jour', type: 'buyer' }, { status: 200 });
    }

    const updatedSeller = await prisma.seller.updateMany({
      where: { id: contactId },
      data: { rating },
    });

    if (updatedSeller.count > 0) {
      return NextResponse.json({ message: 'Evaluation mise a jour', type: 'seller' }, { status: 200 });
    }

    const updatedContact = await prisma.contact.updateMany({
      where: { id: contactId },
      data: { rating },
    });

    if (updatedContact.count > 0) {
      return NextResponse.json({ message: 'Evaluation mise a jour', type: 'contact' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Contact introuvable' }, { status: 404 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
