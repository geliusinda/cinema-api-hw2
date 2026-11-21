import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '../dto.js';
import { BookingsService } from './bookings.service.js';
@ApiTags('bookings')
@Controller()
export class BookingsController {
  constructor(private readonly service: BookingsService) {}
  @Get('bookings')
  @ApiResponse({ status: 200, description: 'All bookings' })
  all() {
    return this.service.all();
  }
  @Get('showings/:id/seats')
  @ApiResponse({ status: 200, description: 'Hall seats with isBooked' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Showing not found' })
  seats(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.seats(id);
  }
  @Get('showings/:id/bookings')
  @ApiResponse({ status: 200, description: 'Showing bookings' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Showing not found' })
  list(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.forShowing(id);
  }
  @Post('showings/:id/bookings')
  @ApiResponse({ status: 201, description: 'Booking created atomically' })
  @ApiResponse({
    status: 400,
    description: 'Invalid, duplicate or out-of-bounds seats',
  })
  @ApiResponse({ status: 404, description: 'Showing not found' })
  @ApiResponse({ status: 409, description: 'Seat already booked' })
  create(@Param('id', ParseUUIDPipe) id: string, @Body() d: CreateBookingDto) {
    return this.service.create(id, d.seats);
  }
  @Delete('bookings/:id')
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Cancelled; seats released' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
