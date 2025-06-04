import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger, ConflictException } from '@nestjs/common'; // Added ConflictException
import { Prisma } from '@una-gc/database/prisma/generated/client'; // Added Prisma

import { RegionalCenterDto } from './dtos/regional-center.dto';
import { RegionalCenter } from '@una-gc/database/prisma/generated/client';
import { RegionalCentersRepository } from './regional-centers.repository';

@Injectable()
export class RegionalCentersService extends GenericService<
  RegionalCenter,
  RegionalCenterDto,
  RegionalCenterDto // Assuming CreateDTO and UpdateDTO are both RegionalCenterDto
> {
  protected readonly logger = new Logger(RegionalCentersService.name);

  constructor(
    protected readonly regionalCentersRepository: RegionalCentersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(regionalCentersRepository, RegionalCenterDto);
  }

  // Override save to handle unique constraint violations
  async save(payload: RegionalCenterDto): Promise<RegionalCenterDto> {
    try {
      this.logger.log(`Creating entity with data: ${JSON.stringify(payload)}`);
      const result = await this.repository.save(payload as any); // Cast to any if types mismatch with generic repo
      // Assuming transformDto and dtoValidator are handled in the base or not strictly needed here for error handling focus
      this.logger.log(`Created entity: ${JSON.stringify(result)}`);
      return result as unknown as RegionalCenterDto; // Adjust DTO transformation as per your GenericService
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || ['unknown field'];
        const message = `A regional center with this ${target.join(', ')} already exists.`;
        this.logger.warn(message);
        throw new ConflictException(message);
      }
      this.logger.error(`Error saving entity: ${JSON.stringify(payload)}`, error);
      throw error;
    }
  }

  // Override update to handle unique constraint violations
  async update(id: string, payload: RegionalCenterDto): Promise<RegionalCenterDto> {
    try {
      this.logger.log(`Updating entity ${id} with data: ${JSON.stringify(payload)}`);
      const result = await this.repository.update(id, payload as any); // Cast to any if types mismatch
      // Assuming transformDto is handled in the base or not strictly needed here for error handling focus
      this.logger.log(`Updated entity ${id}: ${JSON.stringify(result)}`);
      return result as unknown as RegionalCenterDto; // Adjust DTO transformation as per your GenericService
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || ['unknown field'];
        const message = `A regional center with this ${target.join(', ')} already exists.`;
        this.logger.warn(message);
        throw new ConflictException(message);
      }
      this.logger.error(`Error updating entity ${id}: ${JSON.stringify(payload)}`, error);
      throw error;
    }
  }
}
