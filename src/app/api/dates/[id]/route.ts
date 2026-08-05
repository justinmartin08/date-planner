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

  const { id } = await params;

  try {
    const existing = await prisma.dateProposal.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Date proposal not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, dateTime, location, locationLat, locationLng, status } = body;

    const updateData: Record<string, unknown> = {};

    // Creator editing content
    if (existing.creatorId === session.id) {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (dateTime !== undefined) updateData.dateTime = new Date(dateTime);
      if (location !== undefined) updateData.location = location || null;
      if (locationLat !== undefined) updateData.locationLat = typeof locationLat === 'number' ? locationLat : null;
      if (locationLng !== undefined) updateData.locationLng = typeof locationLng === 'number' ? locationLng : null;
    }

    // Anyone updating status (PROPOSED, CONFIRMED, DECLINED, COMPLETED)
    if (status && ['PROPOSED', 'CONFIRMED', 'DECLINED', 'COMPLETED'].includes(status)) {
      updateData.status = status;
    }

    const updated = await prisma.dateProposal.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            theme: true,
          },
        },
      },
    });

    return NextResponse.json({ date: updated });
  } catch (error) {
    console.error('Error updating date proposal:', error);
    return NextResponse.json({ error: 'Failed to update date proposal' }, { status: 500 });
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

  const { id } = await params;

  try {
    const existing = await prisma.dateProposal.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Date proposal not found' }, { status: 404 });
    }

    // Only the creator can delete their proposal
    if (existing.creatorId !== session.id) {
      return NextResponse.json(
        { error: 'Only the creator can delete this proposal.' },
        { status: 403 }
      );
    }

    await prisma.dateProposal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting date proposal:', error);
    return NextResponse.json({ error: 'Failed to delete date proposal' }, { status: 500 });
  }
}
