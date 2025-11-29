import { Controller, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '@src/prisma/prisma.service';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  private readonly logger = new Logger(SetupController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Post('journey-time-config')
  @ApiOperation({ summary: 'Initialize Journey Time Configuration' })
  async initJourneyTimeConfig() {
    this.logger.log('Initializing Journey Time Configuration...');

    const currentYear = new Date().getFullYear();

    // Check if config exists
    const existing = await this.prisma.journeyTimeCalculationConfig.findFirst({
      where: { effectiveYear: currentYear },
    });

    if (existing) {
      this.logger.log(`Config already exists for year ${currentYear}`);
      return {
        success: true,
        message: 'Configuration already exists',
        data: existing,
      };
    }

    // Create default config
    const config = await this.prisma.journeyTimeCalculationConfig.create({
      data: {
        effectiveYear: currentYear,

        // Rangos de horas
        quarterTimeMinHours: 1,
        quarterTimeMaxHours: 5,
        halfTimeMinHours: 6,
        halfTimeMaxHours: 7,
        threeQuarterMinHours: 8,
        threeQuarterMaxHours: 11,
        fullTimeMinHours: 12,

        // Valores de tiempo de jornada
        quarterTimeValue: 0.25,
        halfTimeValue: 0.5,
        threeQuarterTimeValue: 0.75,
        fullTimeValue: 1.0,

        isActive: true,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`✅ Journey Time Config created: ${config.id}`);

    return {
      success: true,
      message: 'Configuration created successfully',
      data: config,
    };
  }
}
