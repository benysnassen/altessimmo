import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, budget, estimation, message, confidential, type } = body;

    // Validation basique
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nom et téléphone sont requis' },
        { status: 400 }
      );
    }

    // Sauvegarde en base de données
    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        email: email || null,
        type: type === 'seller' ? 'SELLER' : 'BUYER',
        budget: budget || null,
        estimation: estimation || null,
        message: message || null,
        confidential: confidential || false,
        status: 'NEW'
      }
    });

    console.log('Nouveau contact sauvegardé:', contact);

    return NextResponse.json(
      { message: 'Message envoyé avec succès', contact },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors du traitement du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
