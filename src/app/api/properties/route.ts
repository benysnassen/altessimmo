import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

type PropertyInput = {
  id?: string;
  sellerId: string;
  title: string;
  propertyType: 'APARTMENT' | 'VILLA' | 'HOUSE' | 'RIAD' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'PENTHOUSE' | 'DUPLEX' | 'OTHER';
  status?: 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
  listingType?: 'SALE' | 'RENT';
  location: string;
  neighborhood?: string | null;
  address?: string | null;
  price: string;
  surface?: number | null;
  landSurface?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  description?: string | null;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasSeaView?: boolean;
  isFeatured?: boolean;
  images?: Array<{
    id?: string;
    url: string;
    alt?: string | null;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
};

function parseBudget(value?: string | null) {
  if (!value) return null;
  const numeric = Number(value.replace(/[^\d]/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function normalizeLocation(value?: string | null) {
  return value?.trim().toLowerCase() || '';
}

function computeMatch(property: any, buyer: any) {
  let score = 0;
  const reasons: string[] = [];

  if (buyer.status === 'ARCHIVED') {
    return null;
  }

  if (buyer.propertyType) {
    if (buyer.propertyType.toLowerCase() === property.propertyType.toLowerCase()) {
      score += 25;
      reasons.push('type compatible');
    } else {
      return null;
    }
  } else {
    score += 10;
  }

  if (buyer.location) {
    const buyerLocation = normalizeLocation(buyer.location);
    const propertyLocation = normalizeLocation(`${property.location} ${property.neighborhood || ''}`);
    if (propertyLocation.includes(buyerLocation) || buyerLocation.includes(normalizeLocation(property.location))) {
      score += 20;
      reasons.push('zone demandee');
    } else {
      return null;
    }
  } else {
    score += 10;
  }

  const budget = parseBudget(buyer.budget);
  const propertyPrice = parseBudget(property.price);
  if (budget && propertyPrice) {
    if (propertyPrice <= budget) {
      score += 20;
      reasons.push('budget compatible');
    } else if (propertyPrice <= budget * 1.1) {
      score += 8;
      reasons.push('legerement au-dessus du budget');
    } else {
      return null;
    }
  }

  if (buyer.minSurface && property.surface) {
    if (property.surface >= buyer.minSurface) {
      score += 10;
      reasons.push('surface minimale atteinte');
    } else {
      return null;
    }
  }

  if (buyer.maxSurface && property.surface) {
    if (property.surface <= buyer.maxSurface) {
      score += 5;
    }
  }

  if (buyer.minRooms && property.rooms) {
    if (property.rooms >= buyer.minRooms) {
      score += 10;
      reasons.push('nombre de pieces compatible');
    } else {
      return null;
    }
  }

  if (buyer.maxRooms && property.rooms) {
    if (property.rooms <= buyer.maxRooms) {
      score += 5;
    }
  }

  if (buyer.hasGarden) {
    if (property.hasGarden) {
      score += 5;
      reasons.push('jardin');
    } else {
      return null;
    }
  }

  if (buyer.hasPool) {
    if (property.hasPool) {
      score += 5;
      reasons.push('piscine');
    } else {
      return null;
    }
  }

  if (buyer.hasSeaView) {
    if (property.hasSeaView) {
      score += 5;
      reasons.push('vue mer');
    } else {
      return null;
    }
  }

  return score >= 35 ? { score, reasons } : null;
}

async function refreshMatches(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) return;

  const buyers = await prisma.buyer.findMany();
  const matches = buyers
    .map((buyer) => {
      const result = computeMatch(property, buyer);
      if (!result) return null;
      return {
        buyerId: buyer.id,
        propertyId,
        score: result.score,
        reasons: result.reasons.join(', '),
      };
    })
    .filter(Boolean) as Array<{ buyerId: string; propertyId: string; score: number; reasons: string }>;

  await prisma.propertyMatch.deleteMany({
    where: { propertyId },
  });

  if (matches.length > 0) {
    await prisma.propertyMatch.createMany({
      data: matches,
    });
  }
}

function sanitizePayload(data: PropertyInput) {
  const images = (data.images || [])
    .filter((image) => image.url?.trim())
    .map((image, index) => ({
      url: image.url.trim(),
      alt: image.alt?.trim() || null,
      isPrimary: Boolean(image.isPrimary),
      sortOrder: image.sortOrder ?? index,
    }));

  if (images.length > 0 && !images.some((image) => image.isPrimary)) {
    images[0].isPrimary = true;
  }

  return {
    sellerId: data.sellerId,
    title: data.title.trim(),
    propertyType: data.propertyType,
    status: data.status || 'AVAILABLE',
    listingType: data.listingType || 'SALE',
    location: data.location.trim(),
    neighborhood: data.neighborhood?.trim() || null,
    address: data.address?.trim() || null,
    price: data.price.trim(),
    surface: data.surface ?? null,
    landSurface: data.landSurface ?? null,
    rooms: data.rooms ?? null,
    bathrooms: data.bathrooms ?? null,
    garages: data.garages ?? null,
    floor: data.floor ?? null,
    yearBuilt: data.yearBuilt ?? null,
    description: data.description?.trim() || null,
    hasGarden: Boolean(data.hasGarden),
    hasPool: Boolean(data.hasPool),
    hasSeaView: Boolean(data.hasSeaView),
    isFeatured: Boolean(data.isFeatured),
    images,
  };
}

export async function GET(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const properties = await prisma.property.findMany({
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
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const body = (await request.json()) as PropertyInput;
    const data = sanitizePayload(body);

    const property = await prisma.property.create({
      data: {
        ...data,
        images: data.images.length
          ? {
              create: data.images,
            }
          : undefined,
      },
      include: {
        seller: true,
        images: true,
      },
    });

    await refreshMatches(property.id);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const body = (await request.json()) as PropertyInput;

    if (!body.id) {
      return NextResponse.json({ error: 'Missing property id' }, { status: 400 });
    }

    const data = sanitizePayload(body);

    await prisma.property.update({
      where: { id: body.id },
      data: {
        sellerId: data.sellerId,
        title: data.title,
        propertyType: data.propertyType,
        status: data.status,
        listingType: data.listingType,
        location: data.location,
        neighborhood: data.neighborhood,
        address: data.address,
        price: data.price,
        surface: data.surface,
        landSurface: data.landSurface,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        garages: data.garages,
        floor: data.floor,
        yearBuilt: data.yearBuilt,
        description: data.description,
        hasGarden: data.hasGarden,
        hasPool: data.hasPool,
        hasSeaView: data.hasSeaView,
        isFeatured: data.isFeatured,
      },
    });

    await prisma.propertyImage.deleteMany({
      where: { propertyId: body.id },
    });

    if (data.images.length > 0) {
      await prisma.propertyImage.createMany({
        data: data.images.map((image) => ({
          propertyId: body.id!,
          ...image,
        })),
      });
    }

    await refreshMatches(body.id);

    const property = await prisma.property.findUnique({
      where: { id: body.id },
      include: {
        seller: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        matches: {
          include: {
            buyer: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing property id' }, { status: 400 });
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
