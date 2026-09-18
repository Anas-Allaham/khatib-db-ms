import { ResultClassification } from '../src/modules/result/enums/result-classification.enum';
import { ResultStatus } from '../src/modules/result/enums/result-status.enum';

export interface SeedMedicalCase {
  fullName: string;
  dateOfBirth: string;
  phoneLast4?: string;
  medicalRecordNumber: string;
  sampleNumber: string;
  expectedReadyOffsetHours?: number;
  result: {
    status: ResultStatus;
    classification: ResultClassification;
    rawReport?: string;
  };
}
