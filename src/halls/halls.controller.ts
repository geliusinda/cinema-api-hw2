import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateHallDto } from '../dto.js';
import { HallsService } from './halls.service.js';
@ApiTags('halls')
@Controller('halls')
export class HallsController {
  constructor(private readonly service: HallsService) {}
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Duplicate hall name' })
  create(@Body() data: CreateHallDto) {
    return this.service.create(data);
  }
  @Get() @ApiResponse({ status: 200, description: 'All records' }) all() {
    return this.service.all();
  }
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Record with generated seats' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const hall = await this.service.get(id);
    const { name, rows, seatsPerRow } = hall;
    return {
      id: hall.id,
      name,
      rows,
      seatsPerRow,
      seats: this.service.seats(hall),
    };
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Referenced by showing' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
