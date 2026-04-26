import { NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sanitizeDebugEditorStatePayload } from '@/lib/editor/sanitizeEditorState';

export const runtime = 'nodejs';

const DEBUG_STATE_PATH = path.join(process.cwd(), '.debug', 'editor-runtime-state.json');

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const fileContents = await readFile(DEBUG_STATE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(fileContents));
  } catch {
    return NextResponse.json({ error: 'No debug state captured yet' }, { status: 404 });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const payload = sanitizeDebugEditorStatePayload(await request.json());

    await mkdir(path.dirname(DEBUG_STATE_PATH), { recursive: true });
    await writeFile(
      DEBUG_STATE_PATH,
      JSON.stringify(
        {
          ...payload,
          capturedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf-8'
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown debug capture error',
      },
      { status: 400 }
    );
  }
}
