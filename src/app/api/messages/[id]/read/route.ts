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

  const { id } = await params;

  try {
    const existing = await prisma.message.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (existing.recipientId !== session.id) {
      return NextResponse.json(
        { error: 'Only the recipient can mark a message as read.' },
        { status: 403 }
      );
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            theme: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            displayName: true,
            theme: true,
          },
        },
        attachments: true,
      },
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error('Error updating read status:', error);
    return NextResponse.json({ error: 'Failed to update read status' }, { status: 500 });
  }
}
