import { NextResponse } from 'next/server';
import { getSession, setSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserTheme } from '@/lib/types';

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, displayName } = await request.json();

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: 'Username cannot be empty.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName ? displayName.trim() : session.displayName;

    // If username is changing, verify it is not already taken by another user
    if (cleanUsername !== session.username) {
      const existing = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });

      if (existing && existing.id !== session.id) {
        return NextResponse.json(
          { error: 'Username is already taken by another account.' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        username: cleanUsername,
        displayName: cleanDisplayName,
      },
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

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
