import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
