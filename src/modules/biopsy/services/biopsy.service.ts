import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BiopsyRepository } from '../data/repositories/biopsy.repository';
import { PatientService } from 'src/modules/patient/services/patient.service';
import { CreateBiopsyDto } from '../dtos/create-biopsy.dto';
import { UpdateBiopsyDto } from '../dtos/update-biopsy.dto';
import { BiopsyStatus } from '../enums/biopsy-status.enum';
import { BiopsyResultPolicyService } from './biopsy-result-policy.service';
import { ClinicalWebhookPublisherService } from 'src/modules/webhook/webhook-queue/services/clinical-webhook-publisher.service';
import { WebhookEvents } from 'src/modules/webhook/webhook/enums/webhook-events.enum';

@Injectable()
export class BiopsyService {
  constructor(
    private readonly _biopsyRepository: BiopsyRepository,
    private readonly _patientService: PatientService,
    private readonly _resultPolicy: BiopsyResultPolicyService,
    private readonly _clinicalWebhooks: ClinicalWebhookPublisherService,
  ) {}

  async create(data: CreateBiopsyDto) {
    await this._patientService.requireById(new Types.ObjectId(data.patientId));
    this._validateCompletedResult(data.status, data.classification);

    const biopsy = await this._biopsyRepository.create({
      patient: new Types.ObjectId(data.patientId),
      sampleNumber: data.sampleNumber,
      status: data.status,
      classification: data.classification,
      rawReport: data.rawReport,
      expectedReadyAt: data.expectedReadyAt ? new Date(data.expectedReadyAt) : undefined,
      completedAt: data.status === BiopsyStatus.COMPLETED ? new Date() : undefined,
    });

    await this._publishStatusEvents(biopsy);
    return biopsy;
  }

  async update(id: Types.ObjectId, data: UpdateBiopsyDto) {
    const existing = await this._biopsyRepository.findOne({ _id: id });
    if (!existing) throw new NotFoundException('Biopsy not found.');

    const status = data.status ?? existing.status;
    const classification = data.classification ?? existing.classification;
    this._validateCompletedResult(status, classification);

    const updated = await this._biopsyRepository.updateOne(
      { _id: id },
      {
        ...data,
        expectedReadyAt: data.expectedReadyAt ? new Date(data.expectedReadyAt) : existing.expectedReadyAt,
        completedAt:
          status === BiopsyStatus.COMPLETED
            ? existing.completedAt ?? new Date()
            : undefined,
      },
    );

    if (!updated) throw new NotFoundException('Biopsy not found.');
    await this._publishStatusEvents(updated);
    return updated;
  }

  async latestForPatient(patientId: Types.ObjectId) {
    await this._patientService.requireById(patientId);
    const biopsy = await this._biopsyRepository
      .findOne({ patient: patientId }, undefined, { sort: { createdAt: -1 } });

    if (!biopsy) throw new NotFoundException('No biopsy was found for this patient.');
    return this._resultPolicy.toPatientSafeResult(biopsy);
  }

  async findOneForAdmin(id: Types.ObjectId) {
    const biopsy = await this._biopsyRepository.findOne({ _id: id });
    if (!biopsy) throw new NotFoundException('Biopsy not found.');
    return biopsy;
  }

  private async _publishStatusEvents(biopsy: any) {
    const payload = {
      biopsyId: biopsy._id.toString(),
      patientId: biopsy.patient.toString(),
      sampleNumber: biopsy.sampleNumber,
      status: biopsy.status,
    };

    await this._clinicalWebhooks.publish(WebhookEvents.BIOPSY_STATUS_UPDATED, payload);
    if (biopsy.status === BiopsyStatus.COMPLETED) {
      await this._clinicalWebhooks.publish(WebhookEvents.BIOPSY_RESULT_READY, payload);
    }
  }

  private _validateCompletedResult(status: BiopsyStatus, classification?: string) {
    if (status === BiopsyStatus.COMPLETED && !classification) {
      throw new BadRequestException('classification is required when a biopsy is completed.');
    }
  }
}
