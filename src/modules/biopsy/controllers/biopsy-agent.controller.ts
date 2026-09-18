import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { Permission } from 'src/modules/auth/tenant/decorators/permission.decorator';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { PatientVerificationService } from 'src/modules/patient/services/patient-verification.service';
import { PatientSafeBiopsyDto } from '../dtos/patient-safe-biopsy.dto';
import { BiopsyService } from '../services/biopsy.service';

@ApiTags('Biopsies - Agent')
@Controller('biopsies')
@AuthenticationGuard('Tenant')
export class BiopsyAgentController {
  constructor(
    private readonly _biopsyService: BiopsyService,
    private readonly _patientVerification: PatientVerificationService,
  ) {}

  @Get(':patientId/latest')
  @Permission('BIOPSY_READ')
  @ApiHeader({ name: 'x-patient-verification-token', required: true })
  @ApiOperation({
    summary: 'Get the latest patient-safe biopsy result after identity verification',
    description: 'Critical/malignant clinical labels and raw report text are never exposed by this endpoint.',
  })
  @ApiOkResponse({ type: PatientSafeBiopsyDto })
  async latest(
    @Param('patientId', ParseObjectIdPipe) patientId: Types.ObjectId,
    @Headers('x-patient-verification-token') verificationToken?: string,
  ) {
    await this._patientVerification.assertVerified(patientId, verificationToken);
    return this._biopsyService.latestForPatient(patientId);
  }
}
