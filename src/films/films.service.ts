import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFilmDto, UpdateFilmDto } from '../dto.js';
import { isPostgresError } from '../database/postgres-error.js';
import { Film } from './entities/film.entity.js';

@Injectable()
export class FilmsService {
  constructor(
    @InjectRepository(Film) private readonly items: Repository<Film>,
  ) {}

  all() {
    return this.items.find();
  }

  async get(id: string) {
    const item = await this.items.findOneBy({ id });
    if (!item) throw new NotFoundException('Film not found');
    return item;
  }

  create(data: CreateFilmDto) {
    return this.items.save(this.items.create(data));
  }

  async update(id: string, data: UpdateFilmDto) {
    if (
      Object.keys(data).some(
        (key) => data[key as keyof UpdateFilmDto] !== undefined,
      )
    ) {
      const result = await this.items.update(id, data);
      if (!result.affected) throw new NotFoundException('Film not found');
    }
    return this.get(id);
  }

  async remove(id: string) {
    try {
      const result = await this.items.delete(id);
      if (!result.affected) throw new NotFoundException('Film not found');
    } catch (error) {
      if (isPostgresError(error, '23503')) {
        throw new ConflictException('Record is referenced by a showing');
      }
      throw error;
    }
  }
}
