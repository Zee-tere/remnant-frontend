const MAX_IMAGE_EDGE = 1600;
const TARGET_IMAGE_SIZE = 1.5 * 1024 * 1024;
export const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('This image could not be compressed.'))),
      'image/webp',
      quality,
    );
  });
}

function webpFileName(name: string) {
  const baseName = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'listing-photo';
  return `${baseName}.webp`;
}

export async function optimizeImageFile(file: File) {
  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    throw new Error(`${file.name} is larger than 10 MB.`);
  }

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    bitmap.close();
    throw new Error('Your browser could not prepare this image.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, 0.82);
  for (const quality of [0.72, 0.62, 0.52]) {
    if (blob.size <= TARGET_IMAGE_SIZE) break;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > 3 * 1024 * 1024) {
    throw new Error(`${file.name} could not be reduced below the upload limit.`);
  }

  return new File([blob], webpFileName(file.name), {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}
