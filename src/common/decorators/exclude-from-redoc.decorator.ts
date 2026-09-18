import { SetMetadata } from '@nestjs/common';

export const REDOC_EXCLUDE_CONTROLLER_KEY = 'redocExcludeController';
export const REDOC_EXCLUDE_ENDPOINT_KEY = 'redocExcludeEndpoint';

// Decorator to exclude an entire controller from Redoc
export const RedocExcludeController = () => SetMetadata(REDOC_EXCLUDE_CONTROLLER_KEY, true);

// Decorator to exclude a specific endpoint from Redoc
export const RedocExcludeEndpoint = () => SetMetadata(REDOC_EXCLUDE_ENDPOINT_KEY, true);
