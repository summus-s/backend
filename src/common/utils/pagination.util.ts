import { PaginationDto } from '../dto/pagination.dto';

export function getPagination(paginationDto: PaginationDto) {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}