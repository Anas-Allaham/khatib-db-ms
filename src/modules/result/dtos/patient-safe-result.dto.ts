import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultStatus } from '../enums/result-status.enum';
import { PatientResultDisposition } from '../enums/patient-result-disposition.enum';

export class PatientSafeResultDto {
  @ApiProperty()
  resultId: string;

  @ApiProperty()
  biopsyId: string;

  @ApiProperty()
  sampleNumber: string;

  @ApiProperty({ enum: ResultStatus })
  status: ResultStatus;

  @ApiProperty({ enum: PatientResultDisposition })
  disposition: PatientResultDisposition;

  @ApiPropertyOptional()
  expectedReadyAt?: Date;

  @ApiProperty({
    example: 'نتيجتك جاهزة، ولكنها تتطلب مراجعة الطبيب المختص لشرح التفاصيل الطبية بدقة. هل أساعدك في حجز موعد في العيادة؟',
  })
  patientMessage: string;
}
