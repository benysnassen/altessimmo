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

    // Mettre à jour l'évaluation
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { rating },
    });

    return NextResponse.json(
      { 
        message: 'Évaluation mise à jour avec succès',
        contact: updatedContact 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
