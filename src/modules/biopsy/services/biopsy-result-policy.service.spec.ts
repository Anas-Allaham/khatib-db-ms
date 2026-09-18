import { BiopsyResultPolicyService } from './biopsy-result-policy.service';
import { BiopsyStatus } from '../enums/biopsy-status.enum';
import { BiopsyClassification } from '../enums/biopsy-classification.enum';
import { PatientResultDisposition } from '../enums/patient-result-disposition.enum';

function biopsy(overrides: Record<string, any> = {}): any {
  return {
    _id: { toString: () => 'biopsy-id' },
    sampleNumber: 'BX-1',
    status: BiopsyStatus.COMPLETED,
    classification: BiopsyClassification.BENIGN,
    rawReport: 'raw pathology text',
    ...overrides,
  };
}

describe('BiopsyResultPolicyService', () => {
  const service = new BiopsyResultPolicyService();

  it('returns a pending disposition without clinical interpretation', () => {
    const result = service.toPatientSafeResult(
      biopsy({ status: BiopsyStatus.PENDING, classification: undefined }),
    );

    expect(result.disposition).toBe(PatientResultDisposition.PENDING);
    expect(result).not.toHaveProperty('rawReport');
    expect(result).not.toHaveProperty('classification');
  });

  it('maps benign results to the benign patient disposition', () => {
    const result = service.toPatientSafeResult(biopsy());

    expect(result.disposition).toBe(PatientResultDisposition.BENIGN);
    expect(result).not.toHaveProperty('rawReport');
  });

  it.each([BiopsyClassification.MALIGNANT, BiopsyClassification.CRITICAL])(
    'does not expose critical classification %s to the patient contract',
    (classification) => {
      const result = service.toPatientSafeResult(biopsy({ classification }));

      expect(result.disposition).toBe(PatientResultDisposition.CLINICIAN_REVIEW_REQUIRED);
      expect(JSON.stringify(result)).not.toContain(classification);
      expect(JSON.stringify(result)).not.toContain('raw pathology text');
    },
  );
});
