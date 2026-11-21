import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHallDto } from '../dto.js';
import { isPostgresError } from '../database/postgres-error.js';
import { Hall } from './entities/hall.entity.js';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall) private readonly items: Repository<Hall>,
  ) {}

  all() {
    return this.items.find();
  }

  async get(id: string) {
    const item = await this.items.findOneBy({ id });
    if (!item) throw new NotFoundException('Hall not found');
    return item;
  }

  async create(data: CreateHallDto) {
    try {
      return await this.items.save(this.items.create(data));
    } catch (error) {
      if (isPostgresError(error, '23505', 'halls_name_key')) {
        throw new ConflictException('Hall name already exists');
      }
      throw error;
    }
  }

  seats(hall: Hall) {
    return Array.from({ length: hall.rows }, (_, row) =>
      Array.from({ length: hall.seatsPerRow }, (_, seat) => ({
        row: row + 1,
        seat: seat + 1,
      })),
    ).flat();
  }

  async remove(id: string) {
    try {
      const result = await this.items.delete(id);
      if (!result.affected) throw new NotFoundException('Hall not found');
    } catch (error) {
      if (isPostgresError(error, '23503')) {
        throw new ConflictException('Record is referenced by a showing');
      }
      throw error;
    }
  }
}
