import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { CreateBiopsyDto } from '../dtos/create-biopsy.dto';
import { UpdateBiopsyDto } from '../dtos/update-biopsy.dto';
import { BiopsyService } from '../services/biopsy.service';

@ApiTags('Biopsies - Admin')
@Controller('admins/biopsies')
@AuthenticationGuard('Account')
@UseGuards(IsTenantAdminGuard)
export class BiopsyAdminController {
  constructor(private readonly _biopsyService: BiopsyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a biopsy record' })
  create(@Body() body: CreateBiopsyDto) {
    return this._biopsyService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a biopsy status or clinical result' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateBiopsyDto,
  ) {
    return this._biopsyService.update(id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the raw biopsy record for an authenticated lab admin' })
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this._biopsyService.findOneForAdmin(id);
  }
}
