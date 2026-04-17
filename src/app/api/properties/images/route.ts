import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const sanitizeSegment = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyIdRaw = (formData.get('propertyId') as string | null) || '';

    if (!file || !propertyIdRaw) {
      return NextResponse.json({ error: 'file and propertyId are required' }, { status: 400 });
    }

    const propertyId = sanitizeSegment(propertyIdRaw);
    if (!propertyId) {
      return NextResponse.json({ error: 'invalid propertyId' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties', propertyId);
    await mkdir(uploadsDir, { recursive: true });

    const extension = file.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const absoluteFilePath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(absoluteFilePath, Buffer.from(bytes));

    const publicUrl = `/uploads/properties/${propertyId}/${filename}`;
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Error uploading property image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
