import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { isHorizon } from '@/lib/leads';

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
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    // Profils CRM et leads du formulaire. Un lead promu en fiche client
    // existe des deux cotes : la deduplication se fait plus bas sur le
    // telephone normalise, pas en excluant les contacts de la liste.
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

    // La qualification (echeance, page d'entree) reste sur le contact meme
    // apres promotion : on la retrouve par telephone, par type.
    const qualificationByPhone = new Map(
      contacts
        .filter((contact) => contact.phoneNormalized)
        .map((contact) => [
          `${contact.type}:${contact.phoneNormalized}`,
          { horizon: contact.horizon, sourcePage: contact.sourcePage },
        ])
    );

    const hasProfile = new Set([
      ...buyers
        .filter((buyer) => buyer.phoneNormalized)
        .map((buyer) => `BUYER:${buyer.phoneNormalized}`),
      ...sellers
        .filter((seller) => seller.phoneNormalized)
        .map((seller) => `SELLER:${seller.phoneNormalized}`),
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
        horizon: qualificationByPhone.get(`BUYER:${buyer.phoneNormalized}`)?.horizon ?? null,
        sourcePage: qualificationByPhone.get(`BUYER:${buyer.phoneNormalized}`)?.sourcePage ?? null,
        nextActionAt: buyer.nextActionAt ? buyer.nextActionAt.toISOString() : null,
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
        horizon: qualificationByPhone.get(`SELLER:${seller.phoneNormalized}`)?.horizon ?? null,
        sourcePage: qualificationByPhone.get(`SELLER:${seller.phoneNormalized}`)?.sourcePage ?? null,
        nextActionAt: seller.nextActionAt ? seller.nextActionAt.toISOString() : null,
        createdAt: seller.createdAt.toISOString(),
        updatedAt: seller.updatedAt.toISOString()
      })),
      // Les leads du formulaire pas encore promus en fiche client. Sans
      // telephone normalise, impossible de rapprocher : on les garde.
      ...contacts
        .filter(
          (contact) =>
            !contact.phoneNormalized ||
            !hasProfile.has(`${contact.type}:${contact.phoneNormalized}`)
        )
        .map(contact => ({
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
          horizon: contact.horizon,
          sourcePage: contact.sourcePage,
          nextActionAt: contact.nextActionAt ? contact.nextActionAt.toISOString() : null,
          createdAt: contact.createdAt.toISOString(),
          updatedAt: contact.updatedAt.toISOString()
        }))
    ];

    // Fiches et leads sont concatenes : sans tri, les leads finiraient
    // tous apres les fiches quelle que soit leur date.
    allContacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json(allContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const data = await request.json();
    const { id, status, name, phone, email, budget, estimation, message, personalNote, confidential, horizon } = data;

    // L'echeance n'existe que sur les contacts : ni buyers ni sellers ne la
    // portent. Un champ absent de la requete ne doit rien effacer, d'ou la
    // distinction entre « non fourni » et « vide ».
    const horizonFourni = Object.prototype.hasOwnProperty.call(data, 'horizon');
    const cleanHorizon = isHorizon(horizon) ? horizon : null;

    /**
     * Reporte l'echeance sur la ligne `contacts` correspondante. Une fiche
     * acheteur ou proprietaire n'a pas de colonne horizon : sans ce report,
     * modifier l'echeance d'un lead promu ne sauvegarderait rien.
     */
    const reporterHorizon = async (
      telephoneNormalise: string,
      type: 'BUYER' | 'SELLER'
    ) => {
      if (!horizonFourni || !telephoneNormalise) return;
      await prisma.contact.updateMany({
        where: { type, phoneNormalized: telephoneNormalise },
        data: { horizon: cleanHorizon },
      });
    };

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // --- Gestion mise à jour de statut uniquement ---
    if (status && !name) {
      // Buyer
      const buyerStatuses = ['NEW','CONTACTED','INTERESTED','VIEWING','OFFER_MADE','NEGOTIATING','PURCHASED','ARCHIVED'];
      const mapDashboardToBuyer = (s: string) => {
        switch (s) {
          case 'OFFER': return 'OFFER_MADE';
          case 'SOLD': return 'PURCHASED';
          default: return s as any;
        }
      };

      if (buyerStatuses.includes(mapDashboardToBuyer(status))) {
        const updatedBuyer = await prisma.buyer.updateMany({
          where: { id },
          data: { status: mapDashboardToBuyer(status) }
        });
        if (updatedBuyer.count > 0) return NextResponse.json({ success: true, type: 'buyer' });
      }

      // Seller
      const sellerStatuses = ['NEW','CONTACTED','EVALUATED','LISTED','VIEWING','OFFER_RECEIVED','NEGOTIATING','SOLD','ARCHIVED'];
      const mapDashboardToSeller = (s: string) => {
        switch (s) {
          case 'OFFER': return 'OFFER_RECEIVED';
          case 'SOLD': return 'SOLD';
          default: return s as any;
        }
      };

      if (sellerStatuses.includes(status)) {
        const updatedSeller = await prisma.seller.updateMany({
          where: { id },
          data: { status: mapDashboardToSeller(status) }
        });
        if (updatedSeller.count > 0) return NextResponse.json({ success: true, type: 'seller' });
      }

      // Contact
      const contactStatuses = ['NEW','CONTACTED','INTERESTED','VIEWING','OFFER','SOLD','ARCHIVED'];
      if (contactStatuses.includes(status)) {
        const updatedContact = await prisma.contact.updateMany({
          where: { id },
          data: { status: status as any }
        });
        if (updatedContact.count > 0) return NextResponse.json({ success: true, type: 'contact' });
      }

      return NextResponse.json({ error: 'Contact not found or statut incompatible' }, { status: 404 });
    }

    // --- Gestion mise à jour complète d'un contact ---
    if (name) {
      const normalizedPhone = normalizePhone(phone);
      // Buyer
      const updatedBuyer = await prisma.buyer.updateMany({
        where: { id },
        data: {
          name,
          phone,
          phoneNormalized: normalizedPhone || null,
          email: email || null,
          budget: budget || null,
          message: message || null,
          personalNote: personalNote || null,
          confidential: confidential || false
        }
      });
      if (updatedBuyer.count > 0) {
        await reporterHorizon(normalizedPhone, 'BUYER');
        return NextResponse.json({ success: true, type: 'buyer' });
      }

      // Seller
      const updatedSeller = await prisma.seller.updateMany({
        where: { id },
        data: {
          name,
          phone,
          phoneNormalized: normalizedPhone || null,
          email: email || null,
          price: estimation || null,
          message: message || null,
          personalNote: personalNote || null,
          confidential: confidential || false
        }
      });
      if (updatedSeller.count > 0) {
        await reporterHorizon(normalizedPhone, 'SELLER');
        return NextResponse.json({ success: true, type: 'seller' });
      }

      // Contact
      const updatedContact = await prisma.contact.updateMany({
        where: { id },
        data: {
          name,
          phone,
          phoneNormalized: normalizedPhone || null,
          email: email || null,
          budget: budget || null,
          estimation: estimation || null,
          message: message || null,
          personalNote: personalNote || null,
          confidential: confidential || false,
          ...(horizonFourni ? { horizon: cleanHorizon } : {})
        }
      });
      if (updatedContact.count > 0) return NextResponse.json({ success: true, type: 'contact' });

      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

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