import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les acheteurs, vendeurs et contacts
    const [buyers, sellers, contacts] = await Promise.all([
      prisma.buyer.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.seller.findMany({
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contact.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Mapping des statuts Prisma vers les statuts du dashboard
    const mapBuyerStatusToDashboard = (status: string) => {
      switch (status) {
        case 'OFFER_MADE': return 'OFFER';
        case 'PURCHASED': return 'SOLD';
        default: return status;
      }
    };

    const mapSellerStatusToDashboard = (status: string) => {
      switch (status) {
        case 'OFFER_RECEIVED': return 'OFFER';
        case 'SOLD': return 'SOLD';
        default: return status;
      }
    };

    // Convertir en format compatible avec l'ancien dashboard
    const allContacts = [
      ...buyers.map(buyer => ({
        id: buyer.id,
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email,
        type: 'BUYER' as const,
        budget: buyer.budget,
        estimation: null,
        message: buyer.message,
        personalNote: buyer.personalNote,
        rating: buyer.rating,
        confidential: buyer.confidential,
        status: mapBuyerStatusToDashboard(buyer.status),
        createdAt: buyer.createdAt.toISOString(),
        updatedAt: buyer.updatedAt.toISOString()
      })),
      ...sellers.map(seller => ({
        id: seller.id,
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
        type: 'SELLER' as const,
        budget: null,
        estimation: seller.price,
        message: seller.message,
        personalNote: seller.personalNote,
        rating: seller.rating,
        confidential: seller.confidential,
        status: mapSellerStatusToDashboard(seller.status),
        createdAt: seller.createdAt.toISOString(),
        updatedAt: seller.updatedAt.toISOString()
      })),
      ...contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        type: contact.type === 'SELLER' ? 'SELLER' as const : 'BUYER' as const,
        budget: contact.budget,
        estimation: contact.estimation,
        message: contact.message,
        personalNote: contact.personalNote,
        rating: contact.rating,
        confidential: contact.confidential,
        status: contact.status,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString()
      }))
    ];

    return NextResponse.json(allContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, status, name, phone, email, budget, estimation, message, personalNote, confidential } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Si c'est juste une mise à jour de statut
    if (status && !name) {
      // Mapping des statuts du dashboard vers les enums Prisma
      const mapDashboardStatusToBuyerStatus = (status: string) => {
        switch (status) {
          case 'OFFER': return 'OFFER_MADE';
          case 'SOLD': return 'PURCHASED';
          default: return status as any;
        }
      };

      const mapDashboardStatusToSellerStatus = (status: string) => {
        switch (status) {
          case 'OFFER': return 'OFFER_RECEIVED';
          case 'SOLD': return 'SOLD';
          default: return status as any;
        }
      };

      // Essayer de mettre à jour un buyer d'abord
      const updatedBuyer = await prisma.buyer.updateMany({
        where: { id },
        data: { status: mapDashboardStatusToBuyerStatus(status) }
      });

      if (updatedBuyer.count > 0) {
        return NextResponse.json({ success: true, type: 'buyer' });
      }

      // Si ce n'est pas un buyer, essayer un seller
      const updatedSeller = await prisma.seller.updateMany({
        where: { id },
        data: { status: mapDashboardStatusToSellerStatus(status) }
      });

      if (updatedSeller.count > 0) {
        return NextResponse.json({ success: true, type: 'seller' });
      }

      // Si aucun n'a été trouvé, essayer l'ancienne table Contact
      const updatedContact = await prisma.contact.updateMany({
        where: { id },
        data: { status: status as any }
      });

      if (updatedContact.count > 0) {
        return NextResponse.json({ success: true, type: 'contact' });
      }

      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Si c'est une mise à jour complète du contact
    if (name) {
      // Essayer de mettre à jour un buyer d'abord
      const updatedBuyer = await prisma.buyer.updateMany({
        where: { id },
        data: {
          name,
          phone,
          email: email || null,
          budget: budget || null, // Maintenant budget peut être null
          message: message || null,
          personalNote: personalNote || null,
          confidential: confidential || false
        }
      });

      if (updatedBuyer.count > 0) {
        return NextResponse.json({ success: true, type: 'buyer' });
      }

      // Si ce n'est pas un buyer, essayer un seller
      const updatedSeller = await prisma.seller.updateMany({
        where: { id },
        data: {
          name,
          phone,
          email: email || null,
          price: estimation || null,
          message: message || null,
          personalNote: personalNote || null,
          confidential: confidential || false
        }
      });

      if (updatedSeller.count > 0) {
        return NextResponse.json({ success: true, type: 'seller' });
      }

      // Si aucun n'a été trouvé, essayer l'ancienne table Contact
      const updatedContact = await prisma.contact.updateMany({
        where: { id },
        data: {
          name,
          phone,
          email: email || null,
          budget: budget || null,
          estimation: estimation || null,
          message: message || null,
          personalNote: personalNote || null,
          confidential: confidential || false
        }
      });

      if (updatedContact.count > 0) {
        return NextResponse.json({ success: true, type: 'contact' });
      }

      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Essayer de supprimer un buyer d'abord
    const deletedBuyer = await prisma.buyer.deleteMany({
      where: { id }
    });

    if (deletedBuyer.count > 0) {
      return NextResponse.json({ success: true, type: 'buyer' });
    }

    // Si ce n'est pas un buyer, essayer un seller
    const deletedSeller = await prisma.seller.deleteMany({
      where: { id }
    });

    if (deletedSeller.count > 0) {
      return NextResponse.json({ success: true, type: 'seller' });
    }

    // Si aucun n'a été trouvé, essayer l'ancienne table Contact
    const deletedContact = await prisma.contact.deleteMany({
      where: { id }
    });

    if (deletedContact.count > 0) {
      return NextResponse.json({ success: true, type: 'contact' });
    }

    return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}