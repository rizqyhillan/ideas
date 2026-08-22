import { PartialType } from '@nestjs/mapped-types';
import { CreateTahunAjaranDto } from './create-tahun-ajaran.dto';

export class UpdateTahunAjaranDto extends PartialType(CreateTahunAjaranDto) {}
