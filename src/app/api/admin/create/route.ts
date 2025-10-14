import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin existe déjà',
        username: existingAdmin.username,
        note: 'Utilisez les identifiants existants'
      });
    }

    // Créer l'admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });

    return NextResponse.json({
      message: 'Admin créé avec succès',
      username: admin.username,
      note: 'Mot de passe par défaut: admin123 - Changez-le immédiatement!'
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
    return NextResponse.json(
      { error: `Erreur lors de la création de l'admin: ${error}` },
      { status: 500 }
    );
  }
}
