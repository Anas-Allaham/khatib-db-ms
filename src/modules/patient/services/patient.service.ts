import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PatientRepository } from '../data/repositories/patient.repository';
import { PatientNameNormalizerService } from './patient-name-normalizer.service';
import { CreatePatientDto } from '../dtos/create-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    private readonly _patientRepository: PatientRepository,
    private readonly _nameNormalizer: PatientNameNormalizerService,
  ) {}

  async create(data: CreatePatientDto) {
    return this._patientRepository.create({
      ...data,
      normalizedFullName: this._nameNormalizer.normalize(data.fullName),
    });
  }

  async findById(id: Types.ObjectId) {
    return this._patientRepository.findOne({ _id: id });
  }

  async requireById(id: Types.ObjectId) {
    const patient = await this.findById(id);
    if (!patient) throw new NotFoundException('Patient not found.');
    return patient;
  }

  async findVerificationCandidates(fullName: string) {
    return this._patientRepository.find({
      normalizedFullName: this._nameNormalizer.normalize(fullName),
    });
  }
}
