import { join } from 'path';

export const IMAGE_UPLOAD_ROOT = join(process.cwd(), 'uploads');
export const IMAGE_PUBLIC_PREFIX = '/uploads/';
export const IMAGE_SUBDIRECTORY = 'images';

export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

// The stored file extension comes from this map, never from the client's original filename.
export const IMAGE_EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const IMAGE_ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;
