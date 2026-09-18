import { Injectable } from '@nestjs/common';
import { UserRepository } from '../data/repositories/user.repository';

@Injectable()
export class UserUpsetterService {
  constructor(
    private readonly _userRepository: UserRepository
  ) { }

  async upsert(userId: string) {
    const user = await this._userRepository.findOneAndUpdate(
      {
        ownerId: userId,
      },
      {
        ownerId: userId
      },
      {
        upsert: true,
        new: true
      },
    );
    return user;
  }
}
