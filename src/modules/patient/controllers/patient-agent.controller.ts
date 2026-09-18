import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/modules/auth/common/decorators/authentication.decorator';
import { Permission } from 'src/modules/auth/tenant/decorators/permission.decorator';
import { VerifyPatientDto } from '../dtos/verify-patient.dto';
import { VerifyPatientResponseDto } from '../dtos/verify-patient-response.dto';
import { PatientVerificationService } from '../services/patient-verification.service';

@ApiTags('Patients - Agent')
@Controller('patients')
@AuthenticationGuard('Tenant')
export class PatientAgentController {
  constructor(private readonly _verificationService: PatientVerificationService) {}

  @Post('verify')
  @Permission('PATIENT_VERIFY')
  @ApiOperation({
    summary: 'Verify patient identity',
    description: 'Requires full name plus date of birth or the last 4 digits of the phone number.',
  })
  @ApiOkResponse({ type: VerifyPatientResponseDto })
  verify(@Body() body: VerifyPatientDto) {
    return this._verificationService.verify(body);
  }
}
