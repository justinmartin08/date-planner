import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dates = await prisma.dateProposal.findMany({
      orderBy: { dateTime: 'asc' },
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

    return NextResponse.json({ dates });
  } catch (error) {
    console.error('Error fetching dates:', error);
    return NextResponse.json({ error: 'Failed to fetch dates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, dateTime, location, locationLat, locationLng } = body;

    if (!title || !description || !dateTime) {
      return NextResponse.json(
        { error: 'Title, description, and date/time are required.' },
        { status: 400 }
      );
    }

    const dateProposal = await prisma.dateProposal.create({
      data: {
        title,
        description,
        dateTime: new Date(dateTime),
        location: location || null,
        locationLat: typeof locationLat === 'number' ? locationLat : null,
        locationLng: typeof locationLng === 'number' ? locationLng : null,
        status: 'PROPOSED',
        creatorId: session.id,
      },
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

    return NextResponse.json({ date: dateProposal }, { status: 201 });
  } catch (error) {
    console.error('Error creating date proposal:', error);
    return NextResponse.json({ error: 'Failed to create date proposal' }, { status: 500 });
  }
}
