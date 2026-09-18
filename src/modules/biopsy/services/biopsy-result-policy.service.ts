import { Injectable } from '@nestjs/common';
import { Biopsy } from '../data/schemas/biopsy.schema';
import { BiopsyStatus } from '../enums/biopsy-status.enum';
import { BiopsyClassification } from '../enums/biopsy-classification.enum';
import { PatientResultDisposition } from '../enums/patient-result-disposition.enum';

@Injectable()
export class BiopsyResultPolicyService {
  toPatientSafeResult(biopsy: Biopsy) {
    if (biopsy.status === BiopsyStatus.PENDING) {
      return {
        biopsyId: biopsy._id.toString(),
        sampleNumber: biopsy.sampleNumber,
        status: biopsy.status,
        disposition: PatientResultDisposition.PENDING,
        expectedReadyAt: biopsy.expectedReadyAt,
        patientMessage: biopsy.expectedReadyAt
          ? `العينة ما زالت قيد المعالجة. الوقت المتوقع لجهوز النتيجة هو ${biopsy.expectedReadyAt.toISOString()}.`
          : 'العينة ما زالت قيد المعالجة. يرجى المحاولة لاحقًا أو التواصل مع المختبر لمعرفة الوقت المتوقع.',
      };
    }

    if (
      biopsy.classification === BiopsyClassification.NORMAL ||
      biopsy.classification === BiopsyClassification.BENIGN
    ) {
      return {
        biopsyId: biopsy._id.toString(),
        sampleNumber: biopsy.sampleNumber,
        status: biopsy.status,
        disposition: PatientResultDisposition.BENIGN,
        patientMessage: 'النتيجة مكتملة، وتُظهر العينة أنسجة طبيعية أو حميدة. يمكنك مراجعة طبيبك إذا كانت لديك أي أسئلة إضافية.',
      };
    }

    // The public/agent contract intentionally never returns the malignant/critical label or raw report.
    return {
      biopsyId: biopsy._id.toString(),
      sampleNumber: biopsy.sampleNumber,
      status: biopsy.status,
      disposition: PatientResultDisposition.CLINICIAN_REVIEW_REQUIRED,
      patientMessage: 'نتيجتك جاهزة، ولكنها تتطلب مراجعة الطبيب المختص لشرح التفاصيل الطبية بدقة. هل أساعدك في حجز موعد في العيادة؟',
    };
  }
}
