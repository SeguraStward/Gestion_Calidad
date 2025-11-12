import { Module } from '@nestjs/common';
import { ExternalProvidersController } from './external-providers.controller';
import { ExternalProvidersService } from './external-providers.service';
import { ExternalProvidersRepository } from './external-providers.repository';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExternalProvidersController],
  providers: [ExternalProvidersService, ExternalProvidersRepository],
  exports: [ExternalProvidersService],
})
export class ExternalProvidersModule {}
