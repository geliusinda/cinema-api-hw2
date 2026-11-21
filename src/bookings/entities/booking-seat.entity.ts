import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  type Relation,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity.js';
import { Showing } from '../../showings/entities/showing.entity.js';

@Entity('booking_seats')
@Index('uq_booking_seats_showing_row_seat', ['showingId', 'row', 'seat'], {
  unique: true,
})
export class BookingSeat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'booking_id' })
  bookingId!: string;

  @Column('uuid', { name: 'showing_id' })
  showingId!: string;

  @Column('integer')
  row!: number;

  @Column('integer')
  seat!: number;

  @ManyToOne(() => Booking, (item) => item.seats, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking!: Relation<Booking>;

  @ManyToOne(() => Showing, { nullable: false })
  @JoinColumn({ name: 'showing_id' })
  showing!: Relation<Showing>;
}
