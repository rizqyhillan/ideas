import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MataPelajaranController } from './mata-pelajaran.controller';
import { MataPelajaranService } from './mata-pelajaran.service';
import { MataPelajaran } from '../database/entities/entities/MataPelajaran';

@Module({
  imports: [TypeOrmModule.forFeature([MataPelajaran])],
  controllers: [MataPelajaranController],
  providers: [MataPelajaranService]
})
export class MataPelajaranModule {}