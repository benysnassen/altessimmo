import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { masterKey, username, password } = await request.json();

    // Vérifier la clé maître
    if (masterKey !== process.env.MASTER_KEY) {
      return NextResponse.json(
        { error: 'Clé maître invalide' },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un admin
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Un administrateur existe déjà' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Mot de passe invalide. Doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&)' },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'admin
    const admin = await prisma.admin.create({
      data: {
        username: username || 'admin',
        password: hashedPassword,
        email: 'admin@altessimmo.com',
        lastLogin: new Date(),
        isActive: true,
      },
    });

    // Générer le token JWT
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username,
        isFirstLogin: true 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      }
    });

    // Définir le cookie HTTP-only
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 heures
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de la création de l\'admin:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


