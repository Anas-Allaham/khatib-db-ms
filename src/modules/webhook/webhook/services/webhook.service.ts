import { Injectable } from '@nestjs/common';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import { WebhookRepository } from '../data/repositories/webhook.repository';
import { Webhook } from '../data/schemas/webhook.schema';
import { WebhookEvents } from '../enums/webhook-events.enum';
import { PaginationListDto } from 'src/common/pagination/pagination-list.dto';

@Injectable()
export class WebhookService {
  constructor(
    private readonly _webhookRepository: WebhookRepository
  ) { }


  async findAll(filter?: IFilterWebhook, isSuperAdmin = false) {
    const matchStage: FilterQuery<Webhook> = {};
    const aggregationPipeline: PipelineStage[] = [];

    if (filter?.isActive !== undefined) {
      matchStage.isActive = filter.isActive
    }

    aggregationPipeline.unshift({ $match: matchStage });


    if (isSuperAdmin) {
      aggregationPipeline.push(
        {
          $lookup: {
            from: 'tenants',
            localField: 'clientId',
            foreignField: 'clientId',
            as: 'tenant',
            pipeline: [
              {
                $project: {
                  id: '$_id',
                  name: 1,
                  _id: 0,
                },
              },
            ],
          },
        },
        { $unwind: { path: '$tenant', preserveNullAndEmptyArrays: true } },
      );

      if (filter?.tenantId) {
        aggregationPipeline.push({ $match: { 'tenant.id': new Types.ObjectId(filter.tenantId) } });
      }
    }


    const data = await this._webhookRepository.aggregate<Webhook & { tenant?: { id: string; name?: string } }>(aggregationPipeline)

    return new PaginationListDto(data, data.length);
  }

  async findOne(id: Types.ObjectId) {
    return this._webhookRepository.findOne({ _id: id });
  }

  async create(data: ICreateWebhook): Promise<Webhook> {
    return await this._webhookRepository.create({
      ...data,
      maxRetryAttempts: data.maxRetryAttempts || 1
    });
  }

  async update(id: Types.ObjectId, body: Partial<ICreateWebhook>) {
    return this._webhookRepository.updateOne({ _id: id }, body, { new: true });
  }

  async delete(id: Types.ObjectId) {
    return this._webhookRepository.delete({ _id: id });
  }
}

interface ICreateWebhook {
  url: string
  events: WebhookEvents[]
  maxRetryAttempts?: number
  clientId?: string
}

interface IFilterWebhook {
  isActive?: boolean
  tenantId?: Types.ObjectId
}