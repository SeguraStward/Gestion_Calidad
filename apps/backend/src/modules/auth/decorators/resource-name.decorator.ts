import { SetMetadata } from '@nestjs/common';

export const RESOURCE_NAME_KEY = 'resourceName';
export const ResourceName = (name: string) => SetMetadata(RESOURCE_NAME_KEY, name);
