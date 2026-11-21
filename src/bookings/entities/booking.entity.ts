import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Relation,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Showing } from '../../showings/entities/showing.entity.js';
import { BookingSeat } from '../../bookings/entities/booking-seat.entity.js';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'showing_id' })
  showingId!: string;

  @Column('integer', { name: 'total_price' })
  totalPrice!: number;

  @Column('timestamptz', { name: 'created_at', default: () => 'now()' })
  createdAt!: Date;

  @ManyToOne(() => Showing, (item) => item.bookings, { nullable: false })
  @JoinColumn({ name: 'showing_id' })
  showing!: Relation<Showing>;

  @OneToMany(() => BookingSeat, (item) => item.booking)
  seats!: Relation<BookingSeat[]>;
}
