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
import { CreateWebhookDto } from '../dtos/create-webhook.dto';
import { UpdateWebhookDto } from '../dtos/update-webhook.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WebhookDto } from '../dtos/webhook.dto';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { WebhookApiAdminService } from './webhook-api-admin.service';
import { WebhookFilter } from '../dtos/webhook-filter.dto';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';

@ApiTags('Webhooks - Admin')
@Controller('admins/webhooks')
@AuthenticationGuard('Account')
export class WebhookApiAdminController {
  constructor(private readonly _webhookService: WebhookApiAdminService) { }

  @Get()
  @ApiOperation({
    summary: 'Get all Webhooks',
    description:
      'Retrieve a list of all webhooks registered for the tenant. Admin Authentication required.',
  })
  @ApiOkResponse({ type: WebhookDto, isArray: true })
  @UseGuards(IsTenantAdminGuard)
  async findAll(@Query() filter: WebhookFilter) {
    return this._webhookService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Webhook Details',
    description:
      'Retrieve detailed configuration for a specific tenant webhook by its ID, Admin Authentication required.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsTenantAdminGuard)
  async findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this._webhookService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Webhook',
    description:
      'Register a new webhook endpoint for the tenant to receive event notifications, Admin Authentication required.',
  })
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsTenantAdminGuard)
  async create(@Body() body: CreateWebhookDto) {
    return this._webhookService.create(body);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Webhook',
    description:
      'Update the configuration of an existing tenant webhook, Admin Authentication required.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WebhookDto })
  @UseGuards(IsTenantAdminGuard)
  async update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateWebhookDto,
  ) {
    return this._webhookService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Webhook',
    description:
      'Delete a tenant webhook configuration, Admin Authentication required.',
  })
  @ApiOkResponse()
  @UseGuards(IsTenantAdminGuard)
  async delete(@Param('id') id: Types.ObjectId) {
    return this._webhookService.delete(id);
  }
}
