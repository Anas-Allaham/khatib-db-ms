import { PatientNameNormalizerService } from './patient-name-normalizer.service';

describe('PatientNameNormalizerService', () => {
  const service = new PatientNameNormalizerService();

  it('normalizes whitespace and common Arabic orthographic variants', () => {
    expect(service.normalize('  أَحْمَد   مُحَمَّد  ')).toBe('احمد محمد');
  });
});
