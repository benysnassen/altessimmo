import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const normalizePhone = (value?: string) => {
  const raw = (value || '').trim();
  if (!raw) return '';

  if (raw.includes('|')) {
    const [dialCode, _country, digits = ''] = raw.split('|');
    const onlyDigits = digits.replace(/\D/g, '');
    const cleanDialCode = (dialCode || '').replace(/\D/g, '');
    return `${cleanDialCode}${onlyDigits}`;
  }

  return raw.replace(/\D/g, '');
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const whereClause: any = {};
    
    if (type === 'buyers') {
      if (status) {
        whereClause.status = status;
      }
      const buyers = await prisma.buyer.findMany({
        where: whereClause,
        include: {
          visits: true,
          offers: true,
          notes: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(buyers);
    } else if (type === 'sellers') {
      if (status) {
        whereClause.status = status;
      }
      const sellers = await prisma.seller.findMany({
        where: whereClause,
        include: {
          visits: true,
          offers: true,
          notes: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(sellers);
    } else {
      // Retourner les deux types
      const [buyers, sellers] = await Promise.all([
        prisma.buyer.findMany({
          include: {
            visits: true,
            offers: true,
            notes: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.seller.findMany({
          include: {
            visits: true,
            offers: true,
            notes: true
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);
      
      return NextResponse.json({ buyers, sellers });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'buyer') {
      const phone = normalizePhone(data.phone);
      if (!phone) {
        return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
      }

      const existingBuyer = await prisma.buyer.findFirst({
        where: {
          OR: [{ phoneNormalized: phone }, { phone: data.phone?.trim() }],
        },
      });

      const buyer = existingBuyer
        ? await prisma.buyer.update({
            where: { id: existingBuyer.id },
            data: {
              name: data.name,
              phone: data.phone.trim(),
              phoneNormalized: phone,
              email: data.email || null,
              budget: data.budget || null,
              message: data.message || null,
              confidential: data.confidential || false,
              propertyType: data.propertyType || null,
              location: data.location || null,
              minSurface: data.minSurface ?? null,
              maxSurface: data.maxSurface ?? null,
              minRooms: data.minRooms ?? null,
              maxRooms: data.maxRooms ?? null,
              hasGarden: data.hasGarden || false,
              hasPool: data.hasPool || false,
              hasSeaView: data.hasSeaView || false,
            },
          })
        : await prisma.buyer.create({
            data: {
              name: data.name,
              phone: data.phone.trim(),
              phoneNormalized: phone,
              email: data.email,
              budget: data.budget,
              message: data.message,
              confidential: data.confidential || false,
              propertyType: data.propertyType,
              location: data.location,
              minSurface: data.minSurface,
              maxSurface: data.maxSurface,
              minRooms: data.minRooms,
              maxRooms: data.maxRooms,
              hasGarden: data.hasGarden || false,
              hasPool: data.hasPool || false,
              hasSeaView: data.hasSeaView || false,
            },
          });
      return NextResponse.json(buyer);
    } else if (type === 'seller') {
      const phone = normalizePhone(data.phone);
      if (!phone) {
        return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
      }

      const existingSeller = await prisma.seller.findFirst({
        where: {
          OR: [{ phoneNormalized: phone }, { phone: data.phone?.trim() }],
        },
      });

      const seller = existingSeller
        ? await prisma.seller.update({
            where: { id: existingSeller.id },
            data: {
              name: data.name,
              phone: data.phone.trim(),
              phoneNormalized: phone,
              email: data.email || null,
              message: data.message || null,
              confidential: data.confidential || false,
              propertyType: data.propertyType || null,
              location: data.location || null,
              surface: data.surface ?? null,
              rooms: data.rooms ?? null,
              price: data.price || null,
              hasGarden: data.hasGarden || false,
              hasPool: data.hasPool || false,
              hasSeaView: data.hasSeaView || false,
              description: data.description || null,
            },
          })
        : await prisma.seller.create({
            data: {
              name: data.name,
              phone: data.phone.trim(),
              phoneNormalized: phone,
              email: data.email,
              message: data.message,
              confidential: data.confidential || false,
              propertyType: data.propertyType,
              location: data.location,
              surface: data.surface,
              rooms: data.rooms,
              price: data.price,
              hasGarden: data.hasGarden || false,
              hasPool: data.hasPool || false,
              hasSeaView: data.hasSeaView || false,
              description: data.description,
            },
          });
      return NextResponse.json(seller);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
