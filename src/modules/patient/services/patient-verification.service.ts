import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { TenantContext } from 'src/common/context/tenant.context';
import { PatientService } from './patient.service';
import { VerifyPatientDto } from '../dtos/verify-patient.dto';
import { PatientVerificationMethod } from '../enums/patient-verification-method.enum';
import { AppConfigService } from 'src/common/app-config/services/app-config.service';
import { SettingKeys } from 'src/common/app-config/enums/settings-keys.enum';
import { ClinicalWebhookPublisherService } from 'src/modules/webhook/webhook-queue/services/clinical-webhook-publisher.service';
import { WebhookEvents } from 'src/modules/webhook/webhook/enums/webhook-events.enum';

interface PatientVerificationPayload {
  patientId: string;
  tenantId: string;
  purpose: 'patient-verification';
}

@Injectable()
export class PatientVerificationService {
  constructor(
    private readonly _patientService: PatientService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly _tenantContext: TenantContext,
    private readonly _appConfig: AppConfigService,
    private readonly _clinicalWebhooks: ClinicalWebhookPublisherService,
  ) {}

  async verify(data: VerifyPatientDto) {
    if (!data.dateOfBirth && !data.phoneLast4) {
      throw new BadRequestException('Provide dateOfBirth or phoneLast4 as a secondary identifier.');
    }

    const candidates = await this._patientService.findVerificationCandidates(data.fullName);
    const matches = candidates.filter((patient) => {
      if (data.dateOfBirth && patient.dateOfBirth !== data.dateOfBirth) return false;
      if (data.phoneLast4 && patient.phoneLast4 !== data.phoneLast4) return false;
      return true;
    });

    // Deliberately do not reveal whether the name or secondary identifier failed.
    if (matches.length !== 1) {
      throw new UnauthorizedException('Patient identity could not be verified.');
    }

    const tenantId = this._tenantContext.getTenantId();
    if (!tenantId) throw new UnauthorizedException('Tenant context is missing.');

    const patient = matches[0];
    const expiresInSeconds = this._tokenTtlSeconds();
    const verificationToken = await this._jwtService.signAsync(
      {
        patientId: patient._id.toString(),
        tenantId: tenantId.toString(),
        purpose: 'patient-verification',
      } satisfies PatientVerificationPayload,
      {
        secret: this._verificationSecret(),
        expiresIn: expiresInSeconds,
      },
    );

    const response = {
      patientId: patient._id.toString(),
      verificationToken,
      expiresInSeconds,
      verificationMethod: data.dateOfBirth
        ? PatientVerificationMethod.DATE_OF_BIRTH
        : PatientVerificationMethod.PHONE_LAST_4,
    };

    await this._clinicalWebhooks.publish(WebhookEvents.PATIENT_VERIFIED, {
      patientId: patient._id.toString(),
      verificationMethod: response.verificationMethod,
    });

    return response;
  }

  async assertVerified(patientId: Types.ObjectId, verificationToken?: string) {
    if (!verificationToken) {
      throw new UnauthorizedException('Patient verification token is required.');
    }

    let payload: PatientVerificationPayload;
    try {
      payload = await this._jwtService.verifyAsync<PatientVerificationPayload>(verificationToken, {
        secret: this._verificationSecret(),
      });
    } catch {
      throw new UnauthorizedException('Patient verification token is invalid or expired.');
    }

    const tenantId = this._tenantContext.getTenantId();
    if (
      payload.purpose !== 'patient-verification' ||
      payload.patientId !== patientId.toString() ||
      !tenantId ||
      payload.tenantId !== tenantId.toString()
    ) {
      throw new UnauthorizedException('Patient verification token does not match this request.');
    }
  }

  private _tokenTtlSeconds(): number {
    const configured = Number(
      this._appConfig.getKeyValue(SettingKeys.PATIENT_VERIFICATION_TOKEN_TTL_SECONDS),
    );
    return Number.isFinite(configured) && configured > 0 ? configured : 300;
  }

  private _verificationSecret(): string {
    const secret = this._configService.get<string>('PATIENT_VERIFICATION_JWT_SECRET');
    if (!secret) throw new Error('PATIENT_VERIFICATION_JWT_SECRET is not configured.');
    return secret;
  }
}
