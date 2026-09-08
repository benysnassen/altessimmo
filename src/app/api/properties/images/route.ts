import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const sanitizeSegment = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '');
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  const bucket = process.env.SUPABASE_PROPERTY_IMAGES_BUCKET || 'property-images';

  if (!supabaseUrl || !supabaseKey) return null;
  return { supabaseUrl, supabaseKey, bucket };
}

async function uploadToSupabaseStorage(file: File, propertyId: string, fileExtension: string) {
  const config = getSupabaseConfig();
  if (!config) return null;

  const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false },
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `properties/${propertyId}/${Date.now()}-${randomUUID().slice(0, 8)}.${fileExtension}`;

  const { error } = await supabase.storage
    .from(config.bucket)
    .upload(storagePath, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`supabase-upload-failed:${error.message}`);
  }

  const { data } = supabase.storage.from(config.bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function POST(request: NextRequest) {
  const acces = await requireAdmin(request);
  if (!acces.ok) return acces.response;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyIdRaw = (formData.get('propertyId') as string | null) || '';

    if (!file || !propertyIdRaw) {
      return NextResponse.json({ error: 'file and propertyId are required' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are accepted' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image too large (max 8MB)' }, { status: 413 });
    }

    const propertyId = sanitizeSegment(propertyIdRaw);
    if (!propertyId) {
      return NextResponse.json({ error: 'invalid propertyId' }, { status: 400 });
    }

    const extension = file.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg');

    // Preferred strategy in production: object storage (Supabase)
    try {
      const storageUrl = await uploadToSupabaseStorage(file, propertyId, extension);
      if (storageUrl) {
        return NextResponse.json({ url: storageUrl }, { status: 201 });
      }
    } catch (storageError) {
      console.error('Supabase image upload failed, fallback to local filesystem:', storageError);
    }

    // Fallback strategy (mainly for local dev): write to public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties', propertyId);
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const absoluteFilePath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(absoluteFilePath, Buffer.from(bytes));

    const publicUrl = `/uploads/properties/${propertyId}/${filename}`;
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Error uploading property image:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        hint: 'Check Supabase storage config or filesystem write permissions in production',
      },
      { status: 500 }
    );
  }
}
