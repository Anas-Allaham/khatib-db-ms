import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UpdateWebhookDto } from '../dtos/update-webhook.dto';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { WebhookDto } from '../dtos/webhook.dto';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { WebhookApiDashboardService } from './webhook-api-dashboard.service';
import { CreateWebhookDashboardDto } from '../dtos/create-webhook-dashboard.dto';
import { WebhookDashboardFilter } from '../dtos/webhook-dashboard-filter.dto';
import { IsSuperAdminGuard } from 'src/modules/auth/account/guards/is-super-admin.guard';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { RedocExcludeController } from 'src/common/decorators';
import { CreateWebhookQueueDto } from '../dtos/create-webhook-queue.dto';

@ApiTags('Webhooks - Dashboard')
@Controller('dashboards/webhooks')
@AuthenticationGuard('Account')
@RedocExcludeController()
export class WebhookApiDashboardController {
  constructor(private readonly _webhookService: WebhookApiDashboardService) { }

  @Get()
  @ApiOkResponse({ type: WebhookDto, isArray: true })
  @UseGuards(IsSuperAdminGuard)
  async findAll(@Query() filter: WebhookDashboardFilter) {
    return this._webhookService.findAll(filter);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsSuperAdminGuard)
  async findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this._webhookService.findOne(id);
  }

  @Post(':id/queue/test')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsSuperAdminGuard)
  async testCreateQueue(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: CreateWebhookQueueDto) {
    return this._webhookService.testCreateQueue(id, body);
  }

  @Post()
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsSuperAdminGuard)
  async create(@Body() body: CreateWebhookDashboardDto) {
    return this._webhookService.create(body);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsSuperAdminGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateWebhookDto,
  ) {
    return this._webhookService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsSuperAdminGuard)
  async delete(@Param('id') id: Types.ObjectId) {
    return this._webhookService.delete(id);
  }
}
