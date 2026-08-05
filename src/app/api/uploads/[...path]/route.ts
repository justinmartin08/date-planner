import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const MIME_BY_EXT: Record<string, string> = {
  '.webm': 'audio/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path: segments } = await params;
  // Reject traversal attempts; only allow a single flat filename segment.
  if (!segments || segments.length !== 1 || segments[0].includes('..') || segments[0].includes('/')) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, segments[0]);
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    return new NextResponse(new Uint8Array(data), {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'private, max-age=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }
}
