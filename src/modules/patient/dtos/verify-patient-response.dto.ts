import { ApiProperty } from '@nestjs/swagger';
import { PatientVerificationMethod } from '../enums/patient-verification-method.enum';

export class VerifyPatientResponseDto {
  @ApiProperty()
  patientId: string;

  @ApiProperty()
  verificationToken: string;

  @ApiProperty({ example: 300 })
  expiresInSeconds: number;

  @ApiProperty({ enum: PatientVerificationMethod })
  verificationMethod: PatientVerificationMethod;
}
