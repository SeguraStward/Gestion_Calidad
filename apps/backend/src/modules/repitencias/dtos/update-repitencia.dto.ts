import { PartialType } from '@nestjs/swagger';
import { CreateRepitenciaDto } from './create-repitencia.dto';

export class UpdateRepitenciaDto extends PartialType(CreateRepitenciaDto) {}
