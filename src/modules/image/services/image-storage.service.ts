import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import {
  IMAGE_EXTENSIONS_BY_MIME_TYPE,
  IMAGE_PUBLIC_PREFIX,
  IMAGE_SUBDIRECTORY,
  IMAGE_UPLOAD_ROOT,
} from '../constants/image-upload.constants';

@Injectable()
export class ImageStorageService {
  constructor(private readonly _configService: ConfigService) {}

  /** Writes the file to disk and returns its public path, without the base URL. */
  async save(file: Express.Multer.File): Promise<string> {
    const extension = IMAGE_EXTENSIONS_BY_MIME_TYPE[file.mimetype];
    const fileName = `${randomUUID()}.${extension}`;
    const directory = join(IMAGE_UPLOAD_ROOT, IMAGE_SUBDIRECTORY);

    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, fileName), file.buffer, { flag: 'wx' });

    return `${IMAGE_PUBLIC_PREFIX}${IMAGE_SUBDIRECTORY}/${fileName}`;
  }

  async remove(path: string) {
    await unlink(join(IMAGE_UPLOAD_ROOT, IMAGE_SUBDIRECTORY, basename(path))).catch(() => undefined);
  }

  toUrl(path: string) {
    const baseUrl =
      this._configService.get<string>('PUBLIC_BASE_URL') ??
      `http://localhost:${this._configService.get<string>('PORT')}`;
    return `${baseUrl.replace(/\/+$/, '')}${path}`;
  }
}
