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
    let notes = '';
    try {
      const body = await request.json();
      notes = body.notes || '';
    } catch {
      // Body may be empty
    }

    const wish = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!wish) {
      return NextResponse.json({ error: 'Wish item not found' }, { status: 404 });
    }

    const isAlreadyGranted = wish.status === 'GRANTED';

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        status: isAlreadyGranted ? 'ACTIVE' : 'GRANTED',
        grantedAt: isAlreadyGranted ? null : new Date(),
        grantedNotes: isAlreadyGranted ? null : (notes ? notes.trim() : null),
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

    return NextResponse.json({
      wish: updated,
      granted: !isAlreadyGranted,
      message: !isAlreadyGranted ? 'Wish fulfilled! Time to celebrate!' : 'Wish moved back to active.',
    });
  } catch (error) {
    console.error('Error toggling grant status on wish:', error);
    return NextResponse.json({ error: 'Failed to update grant status' }, { status: 500 });
  }
}
