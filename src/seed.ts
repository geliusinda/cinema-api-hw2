import dataSource from './database/data-source.js';
import { Film } from './films/entities/film.entity.js';
import { Hall } from './halls/entities/hall.entity.js';
import { Showing } from './showings/entities/showing.entity.js';
import { Booking } from './bookings/entities/booking.entity.js';
import { BookingSeat } from './bookings/entities/booking-seat.entity.js';

async function seed() {
  const ids = Array.from(
    { length: 10 },
    (_, index) =>
      'a17b0000-0000-4000-8000-' + String(index + 1).padStart(12, '0'),
  );
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .insert()
        .into(Film)
        .values([
          {
            id: ids[0],
            title: 'Interstellar',
            durationMinutes: 169,
            releaseYear: 2014,
          },
          {
            id: ids[1],
            title: 'Arrival',
            durationMinutes: 116,
            releaseYear: 2016,
          },
        ])
        .orIgnore()
        .execute();
      const hallRepository = manager.getRepository(Hall);
      const halls = [
        { id: ids[2], name: 'Seed Blue', rows: 4, seatsPerRow: 6 },
        { id: ids[3], name: 'Seed Gold', rows: 6, seatsPerRow: 8 },
      ];
      await manager
        .createQueryBuilder()
        .insert()
        .into(Hall)
        .values(halls)
        .orIgnore()
        .execute();
      const [blue, gold] = await Promise.all(
        halls.map(({ name }) => hallRepository.findOneByOrFail({ name })),
      );
      const price = 15000;
      await manager
        .createQueryBuilder()
        .insert()
        .into(Showing)
        .values(
          [1, 2, 3, 4].map((day, index) => ({
            id: ids[4 + index],
            filmId: ids[index % 2],
            hallId: index % 2 ? gold.id : blue.id,
            startsAt: new Date(Date.UTC(2099, 6, day, 18)),
            price,
          })),
        )
        .orIgnore()
        .execute();

      const booking = await manager
        .createQueryBuilder()
        .insert()
        .into(Booking)
        .values({ id: ids[8], showingId: ids[4], totalPrice: price })
        .onConflict('("id") DO NOTHING')
        .returning('id')
        .execute();
      if (booking.raw.length) {
        const seat = await manager
          .createQueryBuilder()
          .insert()
          .into(BookingSeat)
          .values({
            id: ids[9],
            bookingId: ids[8],
            showingId: ids[4],
            row: 1,
            seat: 1,
          })
          .onConflict('("showing_id", "row", "seat") DO NOTHING')
          .returning('id')
          .execute();
        if (!seat.raw.length) await manager.delete(Booking, ids[8]);
      }
    });
    console.log('Cinema seed complete.');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
