import { Injectable } from '@nestjs/common';
import { ImageRepository } from '../data/repositories/image.repository';
import { UploadImageDto } from '../dtos/upload-image.dto';
import { ImageResponseDto } from '../dtos/image-response.dto';
import { ImageStorageService } from './image-storage.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly _imageRepository: ImageRepository,
    private readonly _imageStorage: ImageStorageService,
  ) {}

  async upload(data: UploadImageDto, file: Express.Multer.File): Promise<ImageResponseDto> {
    const path = await this._imageStorage.save(file);

    try {
      const image = await this._imageRepository.create({
        name: data.name,
        path,
        mimeType: file.mimetype,
        size: file.size,
      });

      return {
        name: image.name,
        createdAt: image.createdAt,
        imageURL: this._imageStorage.toUrl(image.path),
      };
    } catch (error) {
      await this._imageStorage.remove(path);
      throw error;
    }
  }
}
