import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Configuration de sécurité
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 heures
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Store pour les tentatives de connexion (en production, utiliser Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Fonction pour vérifier le mot de passe fort
function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Minimum 8 caractères');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Au moins une lettre minuscule');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Au moins une lettre majuscule');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Au moins un chiffre');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Au moins un caractère spécial (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Fonction pour vérifier les tentatives de connexion
function checkLoginAttempts(ip: string): { isLocked: boolean; remainingTime?: number } {
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) {
    return { isLocked: false };
  }
  
  const now = Date.now();
  const timeSinceLastAttempt = now - attempts.lastAttempt;
  
  // Si le temps de verrouillage est écoulé, réinitialiser
  if (timeSinceLastAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(ip);
    return { isLocked: false };
  }
  
  // Si trop de tentatives, vérifier le verrouillage
  if (attempts.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 1000);
    return { isLocked: true, remainingTime };
  }
  
  return { isLocked: false };
}

// Fonction pour enregistrer une tentative échouée
function recordFailedAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(ip, attempts);
}

// Fonction pour réinitialiser les tentatives
function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
    
    const { username, password } = await request.json();

    // Vérifier les tentatives de connexion
    const lockCheck = checkLoginAttempts(ip);
    if (lockCheck.isLocked) {
      return NextResponse.json(
        { 
          error: `Trop de tentatives échouées. Réessayez dans ${Math.ceil((lockCheck.remainingTime || 0) / 60)} minutes.` 
        },
        { status: 429 }
      );
    }

    // Validation des données
    if (!username) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Nom d\'utilisateur requis' },
        { status: 400 }
      );
    }

    if (!password) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier la force du mot de passe
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { 
          error: 'Mot de passe trop faible',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Récupérer l'admin depuis la base de données par nom d'utilisateur
    const admin = await prisma.admin.findUnique({
      where: { username: username }
    });
    
    if (!admin) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Aucun administrateur trouvé. Utilisez la page de configuration admin.' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier si l'admin est actif
    if (!admin.isActive) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Compte administrateur désactivé' },
        { status: 403 }
      );
    }

    // Mettre à jour la dernière connexion
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Créer le token JWT
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor((Date.now() + SESSION_DURATION) / 1000)
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );

    // Réinitialiser les tentatives
    resetAttempts(ip);

    // Créer la réponse avec cookie sécurisé
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Connexion réussie',
        admin: { username: admin.username, email: admin.email, lastLogin: admin.lastLogin }
      },
      { status: 200 }
    );

    // Définir le cookie HTTP-only sécurisé
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier le statut d'authentification
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Vérifier que l'admin existe toujours et est actif
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, username: true, email: true, isActive: true, lastLogin: true }
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { authenticated: false, error: 'Compte administrateur invalide' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}