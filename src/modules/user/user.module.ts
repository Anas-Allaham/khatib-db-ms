import { Global, Module } from '@nestjs/common';
import { UserUpsetterService } from './services/user-upsetter.service';
import { UserMappingInterceptor } from './interceptors/user-mapping.interceptor';
import { UserGetterService } from './services/user-getter.service';
import { UserRepository } from './data/repositories/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './data/schemas/user-entity.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

  ],
  providers: [UserUpsetterService, UserGetterService, UserMappingInterceptor, UserRepository],
  exports: [UserUpsetterService, UserGetterService, UserMappingInterceptor, UserRepository],
})
export class UserModule {
  configure() { }
}
