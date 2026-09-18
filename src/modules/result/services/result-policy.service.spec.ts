import { ResultPolicyService } from './result-policy.service';
import { ResultStatus } from '../enums/result-status.enum';
import { ResultClassification } from '../enums/result-classification.enum';
import { PatientResultDisposition } from '../enums/patient-result-disposition.enum';

function result(overrides: Record<string, any> = {}): any {
  return {
    _id: { toString: () => 'result-id' },
    biopsy: { toString: () => 'biopsy-id' },
    status: ResultStatus.FINAL,
    classification: ResultClassification.BENIGN,
    rawReport: 'raw pathology text',
    ...overrides,
  };
}

const biopsyContext = { sampleNumber: 'BX-1' };

describe('ResultPolicyService', () => {
  const service = new ResultPolicyService();

  it('returns a pending disposition for a non-final result', () => {
    const output = service.toPatientSafeResult(
      result({ status: ResultStatus.DRAFT, classification: ResultClassification.MALIGNANT }),
      biopsyContext,
    );

    expect(output.disposition).toBe(PatientResultDisposition.PENDING);
    expect(output).not.toHaveProperty('rawReport');
    expect(output).not.toHaveProperty('classification');
  });

  it('maps benign final results to the benign patient disposition', () => {
    const output = service.toPatientSafeResult(result(), biopsyContext);

    expect(output.disposition).toBe(PatientResultDisposition.BENIGN);
    expect(output).not.toHaveProperty('rawReport');
  });

  it.each([ResultClassification.MALIGNANT, ResultClassification.CRITICAL])(
    'does not expose critical classification %s to the patient contract',
    (classification) => {
      const output = service.toPatientSafeResult(
        result({ classification }),
        biopsyContext,
      );

      expect(output.disposition).toBe(PatientResultDisposition.CLINICIAN_REVIEW_REQUIRED);
      expect(JSON.stringify(output)).not.toContain(classification);
      expect(JSON.stringify(output)).not.toContain('raw pathology text');
    },
  );
});
