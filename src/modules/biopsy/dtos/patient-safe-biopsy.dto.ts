import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BiopsyStatus } from '../enums/biopsy-status.enum';
import { PatientResultDisposition } from '../enums/patient-result-disposition.enum';

export class PatientSafeBiopsyDto {
  @ApiProperty()
  biopsyId: string;

  @ApiProperty()
  sampleNumber: string;

  @ApiProperty({ enum: BiopsyStatus })
  status: BiopsyStatus;

  @ApiProperty({ enum: PatientResultDisposition })
  disposition: PatientResultDisposition;

  @ApiPropertyOptional()
  expectedReadyAt?: Date;

  @ApiProperty({
    example: 'نتيجتك جاهزة، ولكنها تتطلب مراجعة الطبيب المختص لشرح التفاصيل الطبية بدقة. هل أساعدك في حجز موعد في العيادة؟',
  })
  patientMessage: string;
}
