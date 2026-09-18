import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { AppConfigRepository } from '../repositories/app-config.repository';
import APP_CONFIG from './app-config-seed.json';

@Injectable()
export class AppConfigSeed {
    constructor(
        private readonly _appConfigRepository: AppConfigRepository,
    ) { }

    private async createDefaultAppConfigs() {
        let existingConfig = await this._appConfigRepository.findOne({});
        let appConfigData: Record<string, { value: string, type: string }>;

        if (existingConfig) {
            appConfigData = { ...existingConfig.data };
        } else {
            appConfigData = {};
        }

        const jsonKeys = new Set(APP_CONFIG.map(config => config.key));

        Object.keys(appConfigData).forEach(key => {
            if (!jsonKeys.has(key)) {
                delete appConfigData[key];
            }
        });

        APP_CONFIG.forEach(config => {
            if (!(config.key in appConfigData)) {
                appConfigData[config.key] = {
                    value: config.value,
                    type: config.type
                };
            }
        });

        if (existingConfig) {
            await this._appConfigRepository.updateOne(
                { _id: existingConfig._id },
                { $set: { data: appConfigData } }
            );

        } else {
            await this._appConfigRepository.create({
                data: appConfigData
            });
        }
    }

    @Command({ command: 'seed:app-config' })
    async run() {
        try {
            await this.createDefaultAppConfigs();
            console.log('App configuration seed is done.');
        } catch (e) {
            console.error('Error running app config seed:', e);
        }
    }
}
