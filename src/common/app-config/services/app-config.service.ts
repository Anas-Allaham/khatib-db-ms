import { Injectable } from '@nestjs/common';
import { SynAppConfigService } from './sync-app-config.service';
import { SettingKeys } from '../enums/settings-keys.enum';

@Injectable()
export class AppConfigService {
    constructor(
        private readonly _syncService: SynAppConfigService,
    ) { }


    getKeyValue(key: keyof typeof SettingKeys): string | null {
        const configCache = this._syncService.getConfigCache();

        if (configCache.has(key)) {
            return configCache.get(key);
        }

        return null;
    }
}
