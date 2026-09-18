import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ClientSession } from 'mongoose';

@Injectable()
export class MongoTransactionService {

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  async apply<T>(cb: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const result = await cb(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}
