import { Injectable } from '@nestjs/common';
import mongoose, { FilterQuery, UpdateQuery, QueryOptions, PopulateOptions, PipelineStage, AnyKeys, AnyObject, Document, RootFilterQuery, ProjectionType, InsertManyOptions, Types, MongooseBaseQueryOptionKeys, QueryFilter } from 'mongoose';
import { TenantContext } from '../context/tenant.context';
import { SoftDeleteModel } from 'mongoose-delete';
import { DeleteOptions } from 'mongodb';

@Injectable()
export class BaseRepository<T extends Document> {
  constructor(
    private readonly _model: SoftDeleteModel<T>,
    private readonly _tenantContext: TenantContext
  ) { }

  private getTenantId(): Types.ObjectId | undefined {
    if (!this._model.schema.path('tenant')) {
      return undefined;
    }
    return this._tenantContext.getTenantId();
  }

  private addTenantIdFilter(filter?: FilterQuery<T>): FilterQuery<T> {
    const tenant = this.getTenantId()
    if (!tenant) return { ...filter }

    return { ...filter, tenant };
  }

  async create<DocContents = AnyKeys<T>>(
    doc: DocContents | T,
    options?: mongoose.SaveOptions,
  ): Promise<T> {
    const tenant = this.getTenantId();
    const docWithTenantId = tenant ? { ...doc, tenant } : doc;
    const modelInstance = new this._model(docWithTenantId);
    return await modelInstance.save(options);
  }

  async insertMany<DocContents = T>(
    docs: Array<DocContents | T>,
    options?: InsertManyOptions
  ) {
    const tenant = this.getTenantId();
    const docsWithTenantId = tenant ? docs.map(doc => ({ ...doc, tenant })) : docs;
    return await this._model.insertMany(tenant ? docsWithTenantId : docs, { ...options });
  }


  find<M extends T = T>(
    filter?: RootFilterQuery<M>,
    projection?: ProjectionType<M> | null | undefined,
    options?: QueryOptions<M> | null | undefined
  ) {
    return this._model.find<M>(this.addTenantIdFilter(filter || {}), projection, { lean: true, ...options })
  }


  findOne<M extends T = T>(
    filter: FilterQuery<M>,
    projection?: any,
    options?: QueryOptions,
    populate?: PopulateOptions | PopulateOptions[]
  ) {
    const query = this._model.findOne<M>(this.addTenantIdFilter(filter), projection, { lean: true, ...options });
    if (populate) query.populate(populate);
    return query
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return await this._model.findOneAndUpdate(
      this.addTenantIdFilter(filter),
      update,
      { lean: true, ...options }
    ).exec();
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: (mongoose.mongo.UpdateOptions & Pick<mongoose.QueryOptions<T>, "timestamps" | mongoose.MongooseBaseQueryOptionKeys> & { [other: string]: any; }) | null | undefined
  ): Promise<number> {
    const result = await this._model.updateMany(
      this.addTenantIdFilter(filter),
      update,
      options
    ).exec();
    return result.modifiedCount;
  }

  // TODO: Add options
  async delete(
    filter: FilterQuery<T>,
  ): Promise<void> {
    await this._model.delete(filter);
  }


  async count(filter?: FilterQuery<T>, options?: (mongoose.mongo.CountOptions & Pick<mongoose.QueryOptions<T>, mongoose.MongooseBaseQueryOptionKeys> & { [other: string]: any; }) | null | undefined): Promise<number> {
    return await this._model.countDocuments(this.addTenantIdFilter(filter), options).exec();
  }

  aggregate<T>(pipeline: PipelineStage[], options?: mongoose.AggregateOptions) {
    const tenant = this.getTenantId();
    const filteredPipeline = tenant ? [{ $match: { tenant } }, ...pipeline] : pipeline;
    return this._model.aggregate<T>(filteredPipeline, options)
  }

  aggregateWithTenantIdOrNull<T>(pipeline: PipelineStage[], options?: mongoose.AggregateOptions) {
    const tenant = this.getTenantId();
    const hasTenantIdField = !!this._model.schema.path('tenant');

    const filteredPipeline = (tenant && hasTenantIdField)
      ? [{ $match: { $or: [{ tenant }, { tenant: null }] } }, ...pipeline]
      : pipeline;
    return this._model.aggregate<T>(filteredPipeline, options)
  }

  async bulkWrite(operations: any[], options: mongoose.MongooseBulkWriteOptions & { ordered: false; }): Promise<any> {
    const tenant = this.getTenantId();
    const filteredOperations = operations.map(op => {
      if (op.insertOne) {
        return { insertOne: { document: tenant ? { ...op.insertOne.document, tenant } : op.insertOne.document } };
      }
      if (op.updateOne) {
        return {
          updateOne: {
            filter: this.addTenantIdFilter(op.updateOne.filter),
            update: op.updateOne.update,
            upsert: op.updateOne.upsert,
          },
        };
      }
      if (op.deleteOne) {
        return {
          deleteOne: {
            filter: this.addTenantIdFilter(op.deleteOne.filter),
          },
        };
      }
      return op;
    });
    return await this._model.bulkWrite(filteredOperations, options);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this._model.exists(this.addTenantIdFilter(filter)).exec();
    return !!result;
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return await this._model.findOneAndUpdate(
      this.addTenantIdFilter(filter),
      update,
      { new: true, ...options }
    ).exec();
  }

  async deletePermanently(
    filter?: QueryFilter<T> | undefined,
    options?:
      | (DeleteOptions &
        Pick<QueryOptions<T>, MongooseBaseQueryOptionKeys> & {
          [other: string]: any;
        })
      | null
      | undefined,
  ) {
    return this._model.deleteMany(filter, options);
  }

}
