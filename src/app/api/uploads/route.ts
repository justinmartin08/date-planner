import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Files are saved under <project root>/uploads (outside /public so they
// aren't served directly by Next's static handler) and streamed back
// through /api/uploads/[...path]/route.ts, which checks auth first.
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const kind = (formData.get('kind') as string) || 'file';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File is too large (max 25MB).' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.name) || (kind === 'voice' ? '.webm' : '');
    const safeName = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, safeName), bytes);

    return NextResponse.json({
      url: `/api/uploads/${safeName}`,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
