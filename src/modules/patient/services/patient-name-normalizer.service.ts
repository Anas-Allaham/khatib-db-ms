import { Injectable } from '@nestjs/common';

@Injectable()
export class PatientNameNormalizerService {
  normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/ـ/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ');
  }
}
