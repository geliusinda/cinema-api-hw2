import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateFilmDto, UpdateFilmDto } from '../dto.js';
import { FilmsService } from './films.service.js';
@ApiTags('films')
@Controller('films')
export class FilmsController {
  constructor(private readonly service: FilmsService) {}
  @Post()
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() data: CreateFilmDto) {
    return this.service.create(data);
  }
  @Get() @ApiResponse({ status: 200, description: 'All records' }) all() {
    return this.service.all();
  }
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Record' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }
  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Updated film' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateFilmDto) {
    return this.service.update(id, data);
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
