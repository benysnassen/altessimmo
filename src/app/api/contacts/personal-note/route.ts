import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const { contactId, personalNote } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    // Mettre à jour la note personnelle
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { personalNote },
    });

    return NextResponse.json(
      { 
        message: 'Note personnelle mise à jour avec succès',
        contact: updatedContact 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note personnelle:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
