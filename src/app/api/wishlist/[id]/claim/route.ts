import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const wish = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!wish) {
      return NextResponse.json({ error: 'Wish item not found' }, { status: 404 });
    }

    // Toggle claim
    const isCurrentlyClaimedByMe = wish.claimedById === session.id;

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        claimedById: isCurrentlyClaimedByMe ? null : session.id,
        claimedAt: isCurrentlyClaimedByMe ? null : new Date(),
        status: isCurrentlyClaimedByMe ? 'ACTIVE' : wish.status === 'GRANTED' ? 'GRANTED' : 'CLAIMED',
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            theme: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            theme: true,
          },
        },
        claimedBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ wish: updated, isClaimed: !isCurrentlyClaimedByMe });
  } catch (error) {
    console.error('Error toggling claim on wish:', error);
    return NextResponse.json({ error: 'Failed to toggle claim' }, { status: 500 });
  }
}
