import {
  Body,
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';
import { UploadImageDto } from '../dtos/upload-image.dto';
import { ImageResponseDto } from '../dtos/image-response.dto';
import { ImageService } from '../services/image.service';
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
} from '../constants/image-upload.constants';

@ApiTags('Images - Admin')
@Controller('admins/images')
@AuthenticationGuard('Account')
export class ImageAdminController {
  constructor(private readonly _imageService: ImageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image and get its public URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'image'],
      properties: {
        name: { type: 'string', maxLength: 200, example: 'Biopsy report - page 1' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'JPEG, PNG or WEBP image, up to 5 MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: ImageResponseDto })
  @UseGuards(IsTenantAdminGuard)
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: IMAGE_MAX_SIZE_BYTES, files: 1 } }),
  )
  upload(
    @Body() body: UploadImageDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Checks the file's magic bytes, then the declared MIME type used for the extension.
          new FileTypeValidator({ fileType: IMAGE_ALLOWED_MIME_TYPES }),
          new FileTypeValidator({
            fileType: IMAGE_ALLOWED_MIME_TYPES,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this._imageService.upload(body, image);
  }
}
