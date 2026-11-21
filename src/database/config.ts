import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Matches,
  Min,
  Max,
  validateSync,
} from 'class-validator';
import type { ConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import { Film } from '../films/entities/film.entity.js';
import { Hall } from '../halls/entities/hall.entity.js';
import { Showing } from '../showings/entities/showing.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { BookingSeat } from '../bookings/entities/booking-seat.entity.js';
import { InitialCinema1760000000000 } from './migrations/1760000000000-initial-cinema.js';

export class Environment {
  @Type(() => Number) @IsInt() @Min(1) @Max(65535) PORT = 3000;
  @IsString() @Matches(/\S/) DB_HOST!: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(65535) DB_PORT!: number;
  @IsString() @Matches(/\S/) DB_USER!: string;
  @IsString() @Matches(/\S/) DB_PASSWORD!: string;
  @IsString() @Matches(/\S/) DB_NAME!: string;
}

export function validateEnvironment(
  input: Record<string, unknown>,
): Environment {
  const config = plainToInstance(Environment, input);
  const errors = validateSync(config);
  if (errors.length) {
    throw new Error(
      'Invalid configuration: ' +
        errors.map((error) => error.property).join(', '),
    );
  }
  return config;
}

export function databaseOptions(
  config: ConfigService<Environment, true>,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.get('DB_HOST', { infer: true }),
    port: config.get('DB_PORT', { infer: true }),
    username: config.get('DB_USER', { infer: true }),
    password: config.get('DB_PASSWORD', { infer: true }),
    database: config.get('DB_NAME', { infer: true }),
    uuidExtension: 'pgcrypto',
    synchronize: false,
    entities: [Film, Hall, Showing, Booking, BookingSeat],
    migrations: [InitialCinema1760000000000],
  };
}
