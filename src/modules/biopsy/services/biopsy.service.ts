import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BiopsyRepository } from '../data/repositories/biopsy.repository';
import { PatientService } from 'src/modules/patient/services/patient.service';
import { CreateBiopsyDto } from '../dtos/create-biopsy.dto';
import { UpdateBiopsyDto } from '../dtos/update-biopsy.dto';

@Injectable()
export class BiopsyService {
  constructor(
    private readonly _biopsyRepository: BiopsyRepository,
    private readonly _patientService: PatientService,
  ) {}

  async create(data: CreateBiopsyDto) {
    await this._patientService.requireById(new Types.ObjectId(data.patientId));

    return this._biopsyRepository.create({
      patient: new Types.ObjectId(data.patientId),
      sampleNumber: data.sampleNumber,
      expectedReadyAt: data.expectedReadyAt ? new Date(data.expectedReadyAt) : undefined,
    });
  }

  async update(id: Types.ObjectId, data: UpdateBiopsyDto) {
    const existing = await this._biopsyRepository.findOne({ _id: id });
    if (!existing) throw new NotFoundException('Biopsy not found.');

    const updated = await this._biopsyRepository.updateOne(
      { _id: id },
      {
        ...data,
        expectedReadyAt: data.expectedReadyAt
          ? new Date(data.expectedReadyAt)
          : existing.expectedReadyAt,
      },
    );

    if (!updated) throw new NotFoundException('Biopsy not found.');
    return updated;
  }

  async findOneForAdmin(id: Types.ObjectId) {
    const biopsy = await this._biopsyRepository.findOne({ _id: id });
    if (!biopsy) throw new NotFoundException('Biopsy not found.');
    return biopsy;
  }

  async listForPatient(patientId: Types.ObjectId) {
    await this._patientService.requireById(patientId);
    return this._biopsyRepository.find(
      { patient: patientId },
      undefined,
      { sort: { createdAt: -1 } },
    );
  }
}
