import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { isPostgresError } from '../database/postgres-error.js';
import type { Seat } from '../models.js';
import { ShowingsService } from '../showings/showings.service.js';
import { Booking } from './entities/booking.entity.js';
import { BookingSeat } from './entities/booking-seat.entity.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(BookingSeat)
    private readonly bookedSeats: Repository<BookingSeat>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly showings: ShowingsService,
  ) {}

  private present({ id, showingId, totalPrice, seats }: Booking) {
    return {
      id,
      showingId,
      totalPrice,
      seats: seats.map(({ row, seat }) => ({ row, seat })),
    };
  }

  async all() {
    const bookings = await this.bookings.find({
      relations: { seats: true },
      order: { createdAt: 'ASC' },
    });
    return bookings.map((booking) => this.present(booking));
  }

  async forShowing(showingId: string) {
    await this.showings.getRaw(showingId);
    const bookings = await this.bookings.find({
      where: { showingId },
      relations: { seats: true },
      order: { createdAt: 'ASC' },
    });
    return bookings.map((booking) => this.present(booking));
  }

  async seats(showingId: string) {
    const layout = await this.showings.seats(showingId);
    const occupied = new Set(
      (await this.bookedSeats.findBy({ showingId })).map(
        ({ row, seat }) => row + ':' + seat,
      ),
    );
    return layout.map((place) => ({
      ...place,
      isBooked: occupied.has(place.row + ':' + place.seat),
    }));
  }

  async create(showingId: string, seats: Seat[]) {
    const showing = await this.showings.getRaw(showingId);
    if (
      seats.some(
        ({ row, seat }) =>
          row > showing.hall.rows || seat > showing.hall.seatsPerRow,
      )
    ) {
      throw new BadRequestException('Seat is outside hall layout');
    }
    const totalPrice = showing.price * seats.length;
    if (totalPrice > 2_147_483_647) {
      throw new BadRequestException('totalPrice exceeds integer range');
    }
    // A consistent insert order prevents competing bookings from locking seats in reverse order.
    const ordered = [...seats].sort((a, b) => a.row - b.row || a.seat - b.seat);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const booking = await manager.save(Booking, { showingId, totalPrice });
        await manager.insert(
          BookingSeat,
          ordered.map(({ row, seat }) => ({
            bookingId: booking.id,
            showingId,
            row,
            seat,
          })),
        );
        return { id: booking.id, showingId, totalPrice, seats };
      });
    } catch (error) {
      if (
        isPostgresError(error, '23505', 'uq_booking_seats_showing_row_seat')
      ) {
        throw new ConflictException('One or more seats are already booked');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const result = await this.bookings.delete(id);
    if (!result.affected) throw new NotFoundException('Booking not found');
  }
}
