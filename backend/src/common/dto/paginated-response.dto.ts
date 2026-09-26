import { ApiProperty } from '@nestjs/swagger';

import { DEFAULT_PAGE_SIZE } from './pagination-query.dto.js';

/** Page metadata returned alongside every paginated collection. */
export class PaginationMetaDto {
  @ApiProperty({ example: 42, description: 'Total number of records matching the filters.' })
  total!: number;

  @ApiProperty({ example: 2, description: 'Current page (1-based).' })
  page!: number;

  @ApiProperty({ example: DEFAULT_PAGE_SIZE, description: 'Number of records per page.' })
  pageSize!: number;

  @ApiProperty({ example: 5, description: 'Total number of pages.' })
  totalPages!: number;

  @ApiProperty({ example: true, description: 'True when a further page exists.' })
  hasNextPage!: boolean;

  @ApiProperty({ example: true, description: 'True when a previous page exists.' })
  hasPreviousPage!: boolean;
}

/** Standard envelope: `data` holds the rows, `meta` holds the page metadata. */
export class PaginatedResponseDto<T> {
  data!: T[];
  meta!: PaginationMetaDto;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  const safePageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(total / safePageSize);

  const meta: PaginationMetaDto = {
    total,
    page,
    pageSize: safePageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && total > 0,
  };

  return { data, meta };
}
