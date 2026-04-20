import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

const propertySelect = {
  id: true,
  title: true,
  price: true,
  status: true,
  location: true,
  neighborhood: true,
  propertyType: true,
  rooms: true,
  surface: true,
} as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buyerId: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const { buyerId } = await params

  const buyer = await prisma.buyer.findUnique({ where: { id: buyerId }, select: { id: true } })
  if (!buyer) {
    return NextResponse.json({ error: 'Acheteur introuvable' }, { status: 404 })
  }

  const interests = await prisma.buyerPropertyInterest.findMany({
    where: { buyerId },
    include: {
      property: {
        select: propertySelect,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(interests)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ buyerId: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const { buyerId } = await params
  const body = await request.json().catch(() => null) as { propertyId?: string; note?: string } | null

  const propertyId = typeof body?.propertyId === 'string' ? body.propertyId.trim() : ''
  const note = typeof body?.note === 'string' ? body.note.trim() || null : null

  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId requis' }, { status: 400 })
  }

  const buyer = await prisma.buyer.findUnique({ where: { id: buyerId }, select: { id: true } })
  if (!buyer) {
    return NextResponse.json({ error: 'Acheteur introuvable' }, { status: 404 })
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      price: true,
      location: true,
      neighborhood: true,
      propertyType: true,
      rooms: true,
      surface: true,
    },
  })

  if (!property) {
    return NextResponse.json({ error: 'Bien introuvable' }, { status: 404 })
  }

  try {
    const created = await prisma.buyerPropertyInterest.create({
      data: {
        buyerId,
        propertyId,
        note,
        snapshotPrice: property.price,
        snapshotRooms: property.rooms,
        snapshotLocation: property.location,
        snapshotNeighborhood: property.neighborhood,
        snapshotPropertyType: property.propertyType,
        snapshotSurface: property.surface,
      },
      include: {
        property: {
          select: propertySelect,
        },
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e: unknown) {
    const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: string }).code) : ''
    if (code === 'P2002') {
      return NextResponse.json({ error: 'Ce bien est deja lie a ce prospect' }, { status: 409 })
    }
    console.error('buyerPropertyInterest create', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
