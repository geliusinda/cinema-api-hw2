import 'reflect-metadata';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { databaseOptions, Environment, validateEnvironment } from './config.js';

export default new DataSource(
  databaseOptions(
    new ConfigService<Environment, true>(validateEnvironment(process.env)),
  ),
);
