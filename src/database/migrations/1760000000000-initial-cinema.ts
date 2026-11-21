import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialCinema1760000000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE TABLE films (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "duration_minutes" integer NOT NULL,
        "release_year" integer NOT NULL
      );
      CREATE TABLE halls (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "rows" integer NOT NULL,
        "seats_per_row" integer NOT NULL
      );
      CREATE TABLE showings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "film_id" uuid NOT NULL REFERENCES films(id),
        "hall_id" uuid NOT NULL REFERENCES halls(id),
        "starts_at" timestamptz NOT NULL,
        "price" integer NOT NULL
      );
      CREATE TABLE bookings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "showing_id" uuid NOT NULL REFERENCES showings(id),
        "total_price" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE booking_seats (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        "showing_id" uuid NOT NULL REFERENCES showings(id),
        "row" integer NOT NULL,
        "seat" integer NOT NULL
      );
      CREATE UNIQUE INDEX uq_booking_seats_showing_row_seat
        ON booking_seats (showing_id, "row", seat);
    `);
  }

  async down(runner: QueryRunner): Promise<void> {
    await runner.query(
      'DROP TABLE booking_seats, bookings, showings, halls, films',
    );
  }
}
