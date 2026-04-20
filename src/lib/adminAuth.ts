import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

type JwtPayload = jwt.JwtPayload & { adminId?: string }

export async function requireAdmin(request: NextRequest): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const token = request.cookies.get('admin-token')?.value
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Non autorise' }, { status: 401 }) }
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Configuration JWT manquante' }, { status: 500 }),
    }
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    if (!decoded.adminId) {
      return { ok: false, response: NextResponse.json({ error: 'Token invalide' }, { status: 401 }) }
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, isActive: true },
    })

    if (!admin?.isActive) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Administrateur invalide' }, { status: 401 }),
      }
    }
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Token invalide' }, { status: 401 }) }
  }

  return { ok: true }
}
