import { createClient } from '@/lib/supabase/client';

export const TEMPLATE_ASSET_BUCKET = 'template-region-assets';

function sanitizePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80);
}

export async function uploadTemplateRegionAsset({
  file,
  userId,
  projectId,
  regionId,
}: {
  file: File;
  userId: string;
  projectId: string;
  regionId: string;
}) {
  const supabase = createClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
  const safeRegion = sanitizePathPart(regionId);
  const safeProject = sanitizePathPart(projectId);
  const safeUser = sanitizePathPart(userId);
  const path = `${safeUser}/${safeProject}/${safeRegion}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(TEMPLATE_ASSET_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type || 'image/png',
      upsert: true,
    });

  if (error) throw error;

  const signedUrl = await getTemplateRegionAssetUrl(path);
  return { path, signedUrl };
}

export async function getTemplateRegionAssetUrl(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(TEMPLATE_ASSET_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);

  if (error) throw error;
  return data.signedUrl;
}
