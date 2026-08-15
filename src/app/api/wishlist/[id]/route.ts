import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      url,
      price,
      currency,
      category,
      priority,
      imageUrl,
      status,
      ownerId,
    } = body;

    const existingWish = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!existingWish) {
      return NextResponse.json({ error: 'Wish item not found' }, { status: 404 });
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title.trim();
    if (description !== undefined) updatedData.description = description ? description.trim() : null;
    if (url !== undefined) updatedData.url = url ? url.trim() : null;
    if (price !== undefined) updatedData.price = price !== '' && price !== null ? Number(price) : null;
    if (currency !== undefined) updatedData.currency = currency;
    if (category !== undefined) updatedData.category = category;
    if (priority !== undefined) updatedData.priority = Math.min(3, Math.max(1, Number(priority) || 1));
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl ? imageUrl.trim() : null;
    if (status !== undefined) updatedData.status = status;
    if (ownerId !== undefined) updatedData.ownerId = ownerId;

    const wish = await prisma.wishlistItem.update({
      where: { id },
      data: updatedData,
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

    return NextResponse.json({ wish });
  } catch (error) {
    console.error('Error updating wish:', error);
    return NextResponse.json({ error: 'Failed to update wish' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existingWish = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!existingWish) {
      return NextResponse.json({ error: 'Wish item not found' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wish:', error);
    return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 });
  }
}
