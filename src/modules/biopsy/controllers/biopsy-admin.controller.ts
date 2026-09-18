import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { CreateBiopsyDto } from '../dtos/create-biopsy.dto';
import { UpdateBiopsyDto } from '../dtos/update-biopsy.dto';
import { ListBiopsiesQueryDto } from '../dtos/list-biopsies-query.dto';
import { BiopsyService } from '../services/biopsy.service';

@ApiTags('Biopsies - Admin')
@Controller('admins/biopsies')
@AuthenticationGuard('Account')
export class BiopsyAdminController {
  constructor(private readonly _biopsyService: BiopsyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a biopsy record' })
  @UseGuards(IsTenantAdminGuard)
  create(@Body() body: CreateBiopsyDto) {
    return this._biopsyService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a biopsy status or clinical result' })
  @UseGuards(IsTenantAdminGuard)
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateBiopsyDto,
  ) {
    return this._biopsyService.update(id, body);
  }

  @Get()
  @ApiOperation({ summary: 'List all results for a patient (raw, lab-admin view)' })
  @UseGuards(IsTenantAdminGuard)
  listForPatient(@Query() query: ListBiopsiesQueryDto) {
    return this._biopsyService.listForPatient(new Types.ObjectId(query.patientId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the raw biopsy record for an authenticated lab admin' })
  @UseGuards(IsTenantAdminGuard)
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this._biopsyService.findOneForAdmin(id);
  }
}
