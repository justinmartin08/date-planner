import { NextResponse } from 'next/server';
import { getSession, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserTheme } from '@/lib/types';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let avatarUrl = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.avatarBase64) {
        return NextResponse.json({ error: 'No avatar image data provided.' }, { status: 400 });
      }
      avatarUrl = body.avatarBase64;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Uploaded file must be an image.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/png';
      const base64Data = buffer.toString('base64');
      avatarUrl = `data:${mimeType};base64,${base64Data}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { avatarUrl },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        theme: true,
      },
    });

    const newSession = {
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      avatarUrl: updatedUser.avatarUrl,
      theme: updatedUser.theme as UserTheme,
    };

    await setSessionCookie(newSession, true);

    return NextResponse.json({ user: updatedUser, avatarUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar image.' }, { status: 500 });
  }
}
