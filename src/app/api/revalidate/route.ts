import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { paths } = (await request.json()) as { paths: string[] };
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true });
}
