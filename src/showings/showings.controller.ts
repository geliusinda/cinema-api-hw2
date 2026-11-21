import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateShowingDto, ShowingQueryDto } from '../dto.js';
import { ShowingPageDto } from './showing-page.dto.js';
import { ShowingsService } from './showings.service.js';
@ApiTags('showings')
@Controller('showings')
export class ShowingsController {
  constructor(private readonly service: ShowingsService) {}
  @Post()
  @ApiResponse({ status: 201, description: 'Created showing' })
  @ApiResponse({
    status: 400,
    description: 'Invalid field, missing film/hall or past start',
  })
  create(@Body() d: CreateShowingDto) {
    return this.service.create(d);
  }
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Filtered schedule with filmTitle and hallName',
    type: ShowingPageDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid filmId, date, page, limit or sort',
  })
  all(@Query() q: ShowingQueryDto) {
    return this.service.all(q);
  }
  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Showing with filmTitle and hallName',
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Showing not found' })
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(id);
  }
}
