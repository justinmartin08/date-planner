import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { UserTheme } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { displayName, username, password, theme = 'pokemon' } = await request.json();

    if (!displayName?.trim() || !username?.trim() || !password) {
      return NextResponse.json(
        { error: 'Display name, username, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This username is already taken. Please choose another.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const resolvedTheme: UserTheme =
      cleanUsername === 'yani' || theme === 'tiger' ? 'tiger' : 'pokemon';

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        displayName: displayName.trim(),
        passwordHash,
        theme: resolvedTheme,
      },
    });

    const session = {
      id: newUser.id,
      username: newUser.username,
      displayName: newUser.displayName,
      theme: newUser.theme as UserTheme,
    };

    // Auto-login session (1 year persistence)
    await setSessionCookie(session, true);

    return NextResponse.json({ success: true, user: session }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
