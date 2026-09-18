import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientModule } from 'src/modules/patient/patient.module';
import { Biopsy, BiopsySchema } from './data/schemas/biopsy.schema';
import { BiopsyRepository } from './data/repositories/biopsy.repository';
import { BiopsyService } from './services/biopsy.service';
import { BiopsyAdminController } from './controllers/biopsy-admin.controller';
import { AccountModule } from 'src/modules/account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Biopsy.name, schema: BiopsySchema }]),
    PatientModule,
    AccountModule,
  ],
  controllers: [BiopsyAdminController],
  providers: [BiopsyRepository, BiopsyService],
  exports: [BiopsyRepository, BiopsyService],
})
export class BiopsyModule {}
