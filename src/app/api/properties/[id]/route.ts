import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true,
          },
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        matches: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                budget: true,
                location: true,
                propertyType: true,
                minSurface: true,
                maxSurface: true,
                minRooms: true,
                maxRooms: true,
              },
            },
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property by id:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}
