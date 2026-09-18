import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppConfigRepository } from 'src/modules/app-config/data/repositories/app-config.repository';

@Injectable()
export class SynAppConfigService implements OnModuleInit {
    private configCache = new Map<string, any>();

    constructor(private readonly _appConfigRepository: AppConfigRepository) { }

    async onModuleInit() {
        await this.populateCache();
    }

    clearCache() {
        this.configCache.clear();
    }

    async reloadCache() {
        this.clearCache();
        await this.populateCache();
    }

    async populateCache() {
        try {
            const configEntry = await this._appConfigRepository.findOne({});
            if (configEntry?.data) {
                Object.keys(configEntry.data).forEach((key) => {
                    this.configCache.set(key, configEntry.data[key].value);
                });
            }
        } catch (error) {
            console.log('Error while populate cache');
        }
    }

    getConfigCache(): Map<string, any> {
        return this.configCache;
    }
}
