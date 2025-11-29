import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SetupController],
})
export class SetupModule {}
