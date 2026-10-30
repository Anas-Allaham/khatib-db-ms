import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from './data/schemas/image.schema';
import { ImageRepository } from './data/repositories/image.repository';
import { ImageService } from './services/image.service';
import { ImageStorageService } from './services/image-storage.service';
import { ImageAdminController } from './controllers/image-admin.controller';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    AccountModule,
  ],
  controllers: [ImageAdminController],
  providers: [ImageRepository, ImageService, ImageStorageService],
  exports: [ImageService],
})
export class ImageModule {}
