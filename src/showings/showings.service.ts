import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isPostgresError } from '../database/postgres-error.js';
import { CreateShowingDto, ShowingQueryDto } from '../dto.js';
import { HallsService } from '../halls/halls.service.js';
import { Showing } from './entities/showing.entity.js';

@Injectable()
export class ShowingsService {
  constructor(
    @InjectRepository(Showing) private readonly showings: Repository<Showing>,
    private readonly halls: HallsService,
  ) {}

  async create(data: CreateShowingDto) {
    const startsAt = new Date(data.startsAt);
    if (startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('startsAt must be in the future');
    }
    try {
      return await this.showings.save(
        this.showings.create({
          filmId: data.filmId,
          hallId: data.hallId,
          price: data.price,
          startsAt,
        }),
      );
    } catch (error) {
      if (isPostgresError(error, '23503', 'showings_film_id_fkey')) {
        throw new BadRequestException('filmId: film not found');
      }
      if (isPostgresError(error, '23503', 'showings_hall_id_fkey')) {
        throw new BadRequestException('hallId: hall not found');
      }
      throw error;
    }
  }

  async getRaw(id: string) {
    const showing = await this.showings.findOne({
      where: { id },
      relations: { hall: true, film: true },
    });
    if (!showing) throw new NotFoundException('Showing not found');
    return showing;
  }

  private present(showing: Showing) {
    return {
      id: showing.id,
      filmTitle: showing.film.title,
      hallName: showing.hall.name,
      startsAt: showing.startsAt.toISOString(),
      price: showing.price,
    };
  }

  async get(id: string) {
    return this.present(await this.getRaw(id));
  }

  async all({
    filmId,
    date,
    page = 1,
    limit = 20,
    sort = 'asc',
  }: ShowingQueryDto) {
    const query = this.showings
      .createQueryBuilder('showing')
      .innerJoinAndSelect('showing.film', 'film')
      .innerJoinAndSelect('showing.hall', 'hall')
      .orderBy('showing.startsAt', sort === 'desc' ? 'DESC' : 'ASC')
      .addOrderBy('showing.id', 'ASC');
    if (filmId) query.andWhere('showing.filmId = :filmId', { filmId });
    if (date) {
      const start = new Date(date + 'T00:00:00Z');
      const end = new Date(start.getTime() + 86_400_000);
      query.andWhere('showing.startsAt >= :start AND showing.startsAt < :end', {
        start,
        end,
      });
    }
    const offset = Math.min((page - 1) * limit, Number.MAX_SAFE_INTEGER);
    const [showings, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    return {
      items: showings.map((showing) => this.present(showing)),
      total,
      page,
      limit,
    };
  }

  async seats(id: string) {
    return this.halls.seats((await this.getRaw(id)).hall);
  }
}
