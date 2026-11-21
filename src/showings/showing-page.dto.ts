import { ApiProperty } from '@nestjs/swagger';

export class ShowingItemDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() filmTitle!: string;
  @ApiProperty() hallName!: string;
  @ApiProperty({ format: 'date-time' }) startsAt!: string;
  @ApiProperty({ description: 'Price in kopecks' }) price!: number;
}

export class ShowingPageDto {
  @ApiProperty({ type: [ShowingItemDto] }) items!: ShowingItemDto[];
  @ApiProperty({ minimum: 0 }) total!: number;
  @ApiProperty({ minimum: 1 }) page!: number;
  @ApiProperty({ minimum: 1, maximum: 100 }) limit!: number;
}
