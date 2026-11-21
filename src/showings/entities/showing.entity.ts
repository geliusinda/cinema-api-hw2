import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Relation,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Film } from '../../films/entities/film.entity.js';
import { Hall } from '../../halls/entities/hall.entity.js';
import { Booking } from '../../bookings/entities/booking.entity.js';

@Entity('showings')
export class Showing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'film_id' })
  filmId!: string;

  @Column('uuid', { name: 'hall_id' })
  hallId!: string;

  @Column('timestamptz', { name: 'starts_at' })
  startsAt!: Date;

  @Column('integer')
  price!: number;

  @ManyToOne(() => Film, (item) => item.showings, { nullable: false })
  @JoinColumn({ name: 'film_id' })
  film!: Relation<Film>;

  @ManyToOne(() => Hall, (item) => item.showings, { nullable: false })
  @JoinColumn({ name: 'hall_id' })
  hall!: Relation<Hall>;

  @OneToMany(() => Booking, (item) => item.showing)
  bookings!: Relation<Booking[]>;
}
