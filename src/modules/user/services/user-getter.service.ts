import { Injectable } from '@nestjs/common';
import { UserRepository } from '../data/repositories/user.repository';

@Injectable()
export class UserGetterService {
  constructor(
    private readonly _userRepository: UserRepository
  ) { }

  async findAll() {
    return this._userRepository.find({})
  }

  async findOneById(userId: string) {
    return this._userRepository.findOne({ ownerId: userId })
  }
}
