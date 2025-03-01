import { Logger, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class DtoValidator {
  private logger: Logger = new Logger(DtoValidator.name);

  async validate<T extends object>(payload: T, DtoClass: new () => T): Promise<T> {
    const dto = plainToClass(DtoClass, payload);
    this.logger.debug(`Validating DTO: ${JSON.stringify(dto)}`);

    try {
      const errors: ValidationError[] = await validate(dto);
      if (errors.length > 0) {
        const validationErrors = errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        }));
        this.logger.error(`Validation failed: ${JSON.stringify(validationErrors)}`);
        throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
      }
      return dto;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Validation exception: ${errorMessage}`);
      throw new Error(`Validation exception: ${errorMessage}`);
    }
  }
}
