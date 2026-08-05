import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all messages sent or received by this session user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.id },
          { recipientId: session.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
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

    const unreadCount = messages.filter(
      (m) => m.recipientId === session.id && !m.isRead
    ).length;

    return NextResponse.json({ messages, unreadCount });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, contentHtml, attachments } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    // Find the recipient (the partner user)
    const partner = await prisma.user.findFirst({
      where: { id: { not: session.id } },
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Recipient partner not found.' },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.id,
        recipientId: partner.id,
        title: title ? title.trim() : null,
        content: content.trim(),
        contentHtml: contentHtml || null,
        isRead: false,
        attachments: Array.isArray(attachments) && attachments.length > 0
          ? {
              create: attachments.map((a: {
                kind: string;
                url: string;
                fileName: string;
                mimeType: string;
                size: number;
                duration?: number;
              }) => ({
                kind: a.kind,
                url: a.url,
                fileName: a.fileName,
                mimeType: a.mimeType,
                size: a.size,
                duration: a.duration ?? null,
              })),
            }
          : undefined,
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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
