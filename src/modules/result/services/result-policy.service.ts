import { Injectable } from '@nestjs/common';
import { Result } from '../data/schemas/result.schema';
import { ResultStatus } from '../enums/result-status.enum';
import { ResultClassification } from '../enums/result-classification.enum';
import { PatientResultDisposition } from '../enums/patient-result-disposition.enum';
import { PatientSafeResultDto } from '../dtos/patient-safe-result.dto';

interface BiopsyContext {
  sampleNumber: string;
  expectedReadyAt?: Date;
}

@Injectable()
export class ResultPolicyService {
  toPatientSafeResult(result: Result, biopsy: BiopsyContext): PatientSafeResultDto {
    const base = {
      resultId: result._id.toString(),
      biopsyId: result.biopsy.toString(),
      sampleNumber: biopsy.sampleNumber,
      status: result.status,
    };

    // A result that is not finalized is treated as still pending for the patient.
    if (result.status !== ResultStatus.FINAL) {
      return {
        ...base,
        disposition: PatientResultDisposition.PENDING,
        expectedReadyAt: biopsy.expectedReadyAt,
        patientMessage: biopsy.expectedReadyAt
          ? `العينة ما زالت قيد المعالجة. الوقت المتوقع لجهوز النتيجة هو ${biopsy.expectedReadyAt.toISOString()}.`
          : 'العينة ما زالت قيد المعالجة. يرجى المحاولة لاحقًا أو التواصل مع المختبر لمعرفة الوقت المتوقع.',
      };
    }

    if (
      result.classification === ResultClassification.NORMAL ||
      result.classification === ResultClassification.BENIGN
    ) {
      return {
        ...base,
        disposition: PatientResultDisposition.BENIGN,
        patientMessage:
          'النتيجة مكتملة، وتُظهر العينة أنسجة طبيعية أو حميدة. يمكنك مراجعة طبيبك إذا كانت لديك أي أسئلة إضافية.',
      };
    }

    // The public/agent contract intentionally never returns the malignant/critical label or raw report.
    return {
      ...base,
      disposition: PatientResultDisposition.CLINICIAN_REVIEW_REQUIRED,
      patientMessage:
        'نتيجتك جاهزة، ولكنها تتطلب مراجعة الطبيب المختص لشرح التفاصيل الطبية بدقة. هل أساعدك في حجز موعد في العيادة؟',
    };
  }
}
