import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { CreateResultDto } from '../dtos/create-result.dto';
import { UpdateResultDto } from '../dtos/update-result.dto';
import { ListResultsQueryDto } from '../dtos/list-results-query.dto';
import { ResultService } from '../services/result.service';

@ApiTags('Results - Admin')
@Controller('admins/results')
@AuthenticationGuard('Account')
export class ResultAdminController {
  constructor(private readonly _resultService: ResultService) {}

  @Post()
  @ApiOperation({ summary: 'Create a result under a biopsy' })
  @UseGuards(IsTenantAdminGuard)
  create(@Body() body: CreateResultDto) {
    return this._resultService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all results for a biopsy (raw, lab-admin view)' })
  @UseGuards(IsTenantAdminGuard)
  listForBiopsy(@Query() query: ListResultsQueryDto) {
    return this._resultService.listForBiopsy(new Types.ObjectId(query.biopsyId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the raw result record for an authenticated lab admin' })
  @UseGuards(IsTenantAdminGuard)
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this._resultService.findOneForAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a result status or clinical classification' })
  @UseGuards(IsTenantAdminGuard)
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateResultDto,
  ) {
    return this._resultService.update(id, body);
  }
}
