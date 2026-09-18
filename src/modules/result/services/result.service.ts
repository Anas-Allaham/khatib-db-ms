import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ResultRepository } from '../data/repositories/result.repository';
import { BiopsyService } from 'src/modules/biopsy/services/biopsy.service';
import { PatientService } from 'src/modules/patient/services/patient.service';
import { ResultPolicyService } from './result-policy.service';
import { CreateResultDto } from '../dtos/create-result.dto';
import { UpdateResultDto } from '../dtos/update-result.dto';
import { ResultStatus } from '../enums/result-status.enum';
import { Result } from '../data/schemas/result.schema';
import { ClinicalWebhookPublisherService } from 'src/modules/webhook/webhook-queue/services/clinical-webhook-publisher.service';
import { WebhookEvents } from 'src/modules/webhook/webhook/enums/webhook-events.enum';

@Injectable()
export class ResultService {
  constructor(
    private readonly _resultRepository: ResultRepository,
    private readonly _biopsyService: BiopsyService,
    private readonly _patientService: PatientService,
    private readonly _resultPolicy: ResultPolicyService,
    private readonly _clinicalWebhooks: ClinicalWebhookPublisherService,
  ) {}

  async create(data: CreateResultDto) {
    const biopsy = await this._biopsyService.findOneForAdmin(
      new Types.ObjectId(data.biopsyId),
    );

    const result = await this._resultRepository.create({
      biopsy: biopsy._id,
      patient: biopsy.patient,
      status: data.status,
      classification: data.classification,
      rawReport: data.rawReport,
      issuedAt: data.status === ResultStatus.FINAL ? new Date() : undefined,
    });

    await this._publishStatusEvents(result);
    return result;
  }

  async update(id: Types.ObjectId, data: UpdateResultDto) {
    const existing = await this._resultRepository.findOne({ _id: id });
    if (!existing) throw new NotFoundException('Result not found.');

    const status = data.status ?? existing.status;

    const updated = await this._resultRepository.updateOne(
      { _id: id },
      {
        ...data,
        issuedAt:
          status === ResultStatus.FINAL
            ? existing.issuedAt ?? new Date()
            : undefined,
      },
    );

    if (!updated) throw new NotFoundException('Result not found.');
    await this._publishStatusEvents(updated);
    return updated;
  }

  async findOneForAdmin(id: Types.ObjectId) {
    const result = await this._resultRepository.findOne({ _id: id });
    if (!result) throw new NotFoundException('Result not found.');
    return result;
  }

  async listForBiopsy(biopsyId: Types.ObjectId) {
    await this._biopsyService.findOneForAdmin(biopsyId);
    return this._resultRepository.find(
      { biopsy: biopsyId },
      undefined,
      { sort: { createdAt: -1 } },
    );
  }

  async latestForPatient(patientId: Types.ObjectId) {
    await this._patientService.requireById(patientId);

    const result = await this._resultRepository.findOne(
      { patient: patientId },
      undefined,
      { sort: { createdAt: -1 } },
    );
    if (!result) throw new NotFoundException('No result was found for this patient.');

    const biopsy = await this._biopsyService.findOneForAdmin(result.biopsy);
    return this._resultPolicy.toPatientSafeResult(result, biopsy);
  }

  private async _publishStatusEvents(result: Result) {
    const payload = {
      resultId: result._id.toString(),
      biopsyId: result.biopsy.toString(),
      patientId: result.patient.toString(),
      status: result.status,
    };

    await this._clinicalWebhooks.publish(WebhookEvents.BIOPSY_STATUS_UPDATED, payload);
    if (result.status === ResultStatus.FINAL) {
      await this._clinicalWebhooks.publish(WebhookEvents.BIOPSY_RESULT_READY, payload);
    }
  }
}
