import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PatientService } from '../services/patient.service';

@ApiTags('Patients - Admin')
@Controller('admins/patients')
@AuthenticationGuard('Account')
@UseGuards(IsTenantAdminGuard)
export class PatientAdminController {
  constructor(private readonly _patientService: PatientService) {}

  @Post()
  @ApiOperation({ summary: 'Create a patient under the authenticated lab tenant' })
  create(@Body() body: CreatePatientDto) {
    return this._patientService.create(body);
  }
}
