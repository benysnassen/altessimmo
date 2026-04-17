import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function ensureSellersMaterializedFromContacts() {
  const sellerContacts = await prisma.contact.findMany({
    where: { type: 'SELLER' },
    select: {
      name: true,
      phone: true,
      email: true,
      message: true,
      estimation: true,
      confidential: true,
    },
  });

  if (sellerContacts.length === 0) return;

  const existingPhones = new Set(
    (
      await prisma.seller.findMany({
        select: { phone: true },
      })
    ).map((seller) => seller.phone)
  );

  const missing = sellerContacts.filter((contact) => !existingPhones.has(contact.phone));
  if (missing.length === 0) return;

  await prisma.$transaction(
    missing.map((contact) =>
      prisma.seller.create({
        data: {
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          message: contact.message,
          confidential: contact.confidential,
          price: contact.estimation,
        },
      })
    )
  );
}

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
      await ensureSellersMaterializedFromContacts();

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
      await ensureSellersMaterializedFromContacts();

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
      const buyer = await prisma.buyer.create({
        data: {
          name: data.name,
          phone: data.phone,
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
          hasSeaView: data.hasSeaView || false
        }
      });
      return NextResponse.json(buyer);
    } else if (type === 'seller') {
      const seller = await prisma.seller.create({
        data: {
          name: data.name,
          phone: data.phone,
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
          description: data.description
        }
      });
      return NextResponse.json(seller);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
