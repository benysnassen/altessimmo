import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/adminAuth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ buyerId: string; interestId: string }> }
) {
  const auth = await requireAdmin(request)
  if (!auth.ok) return auth.response

  const { buyerId, interestId } = await params

  const existing = await prisma.buyerPropertyInterest.findFirst({
    where: { id: interestId, buyerId },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Lien introuvable' }, { status: 404 })
  }

  await prisma.buyerPropertyInterest.delete({
    where: { id: interestId },
  })

  return NextResponse.json({ success: true })
}
