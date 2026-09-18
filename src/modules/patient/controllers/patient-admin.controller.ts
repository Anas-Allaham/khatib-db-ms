import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { IsTenantAdminGuard } from 'src/modules/auth/account/guards/is-tenant-admin.guard';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { CreatePatientDto } from '../dtos/create-patient.dto';
import { PatientService } from '../services/patient.service';

@ApiTags('Patients - Admin')
@Controller('admins/patients')
@AuthenticationGuard('Account')
export class PatientAdminController {
  constructor(private readonly _patientService: PatientService) {}

  @Post()
  @ApiOperation({ summary: 'Create a patient under the authenticated lab tenant' })
  @UseGuards(IsTenantAdminGuard)
  create(@Body() body: CreatePatientDto) {
    return this._patientService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all patients under the authenticated lab tenant' })
  @UseGuards(IsTenantAdminGuard)
  findAll() {
    return this._patientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by id under the authenticated lab tenant' })
  @UseGuards(IsTenantAdminGuard)
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this._patientService.requireById(id);
  }
}
