import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const status = searchParams.get('status');

    // Build filter conditions
    const where: any = {};
    if (ownerId) {
      where.ownerId = ownerId;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const wishes = await prisma.wishlistItem.findMany({
      where,
      orderBy: [
        { status: 'asc' },      // ACTIVE first, then CLAIMED, then GRANTED
        { priority: 'desc' },    // 3 stars first
        { createdAt: 'desc' },
      ],
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

    return NextResponse.json({ wishes });
  } catch (error) {
    console.error('Error fetching wishes:', error);
    return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      url,
      price,
      currency = 'PHP',
      category = 'General',
      priority = 1,
      imageUrl,
      ownerId,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Wish title is required.' },
        { status: 400 }
      );
    }

    // Determine target owner: default to session user or specified owner
    let targetOwnerId = ownerId || session.id;

    // Validate that the target owner exists
    const ownerUser = await prisma.user.findUnique({
      where: { id: targetOwnerId },
      select: { id: true },
    });

    if (!ownerUser) {
      targetOwnerId = session.id;
    }

    const wish = await prisma.wishlistItem.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        url: url?.trim() || null,
        price: typeof price === 'number' ? price : price ? parseFloat(price) : null,
        currency: currency || 'PHP',
        category: category || 'General',
        priority: Math.min(3, Math.max(1, Number(priority) || 1)),
        imageUrl: imageUrl?.trim() || null,
        status: 'ACTIVE',
        ownerId: targetOwnerId,
        creatorId: session.id,
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

    return NextResponse.json({ wish }, { status: 201 });
  } catch (error) {
    console.error('Error creating wish:', error);
    return NextResponse.json({ error: 'Failed to create wish' }, { status: 500 });
  }
}
