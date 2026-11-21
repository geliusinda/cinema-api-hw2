import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Relation,
  OneToMany,
} from 'typeorm';
import { Showing } from '../../showings/entities/showing.entity.js';

@Entity('halls')
export class Hall {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { unique: true })
  name!: string;

  @Column('integer')
  rows!: number;

  @Column('integer', { name: 'seats_per_row' })
  seatsPerRow!: number;

  @OneToMany(() => Showing, (item) => item.hall)
  showings!: Relation<Showing[]>;
}
