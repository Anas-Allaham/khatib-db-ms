import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateAppConfigDto } from './dto/update-app-config.dto';
import { SynAppConfigService } from 'src/common/app-config/services/sync-app-config.service';
import { AppConfigRepository } from './data/repositories/app-config.repository';

@Injectable()
export class AppConfigApiDashboardService {
  constructor(
    private readonly _syncService: SynAppConfigService,
    private readonly _appConfigRepository: AppConfigRepository
  ) { }

  async findOne() {
    const resp = await this._appConfigRepository.findOne({});
    if (!resp) throw new Error('App Config not found');
    return resp.data;
  }

  async update(data: UpdateAppConfigDto) {
    const currentConfig = await this._appConfigRepository.findOne({});
    if (!currentConfig) {
      throw new Error('App Config not found');
    }

    const existingConfig = currentConfig.data[data.key];
    if (!(existingConfig)) {
      throw new InternalServerErrorException(`Key "${data.key}" does not exist in app config`);
    }

    const updateData = {
      $set: {
        [`data.${data.key}`]: {
          value: data.value,
          type: existingConfig.type
        }
      }
    };

    return this._appConfigRepository.updateOne({}, updateData)
      .then((raw) => {
        this._syncService.reloadCache();
        return raw?.data;
      });
  }

}
