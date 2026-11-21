import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Relation,
  OneToMany,
} from 'typeorm';
import { Showing } from '../../showings/entities/showing.entity.js';

@Entity('films')
export class Film {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  title!: string;

  @Column('integer', { name: 'duration_minutes' })
  durationMinutes!: number;

  @Column('integer', { name: 'release_year' })
  releaseYear!: number;

  @OneToMany(() => Showing, (item) => item.film)
  showings!: Relation<Showing[]>;
}
