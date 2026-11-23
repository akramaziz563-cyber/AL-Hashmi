export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1400,
  quality = 0.84
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type (${file.name}). Only JPG, PNG, and WebP are allowed.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} exceeds the 15 MB file limit.`);
  }

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Could not read image ${file.name}.`));
      el.src = bitmapUrl;
    });

    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas compression unavailable in this browser.');
    ctx.drawImage(img, 0, 0, width, height);

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';
    const dataUrl = canvas.toDataURL(outputType, quality);
    if (!dataUrl.startsWith('data:image/')) {
      return canvas.toDataURL('image/jpeg', quality);
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

export async function uploadCompressedImage(
  file: File,
  idToken: string
): Promise<string> {
  const dataUrl = await compressImageToDataUrl(file);
  const res = await fetch('/api/uploads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ dataUrl, fileName: file.name }),
  });

  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) {
    throw new Error(json.error || `Failed to upload ${file.name}.`);
  }
  return json.url;
}
