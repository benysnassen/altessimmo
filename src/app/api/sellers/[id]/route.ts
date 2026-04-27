import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

async function assertAdmin(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) return false;
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId?: string };
    if (!decoded.adminId) return false;
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { isActive: true },
    });
    return !!admin?.isActive;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const seller = await prisma.seller.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            location: true,
            neighborhood: true,
            price: true,
            status: true,
            listingType: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        visits: {
          orderBy: { date: 'desc' },
          take: 15,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json(seller);
  } catch (error) {
    console.error('GET /api/sellers/[id]:', error);
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}
