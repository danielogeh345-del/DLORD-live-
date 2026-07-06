export class PaginationDto {
  skip: number = 0;
  take: number = 20;
  page: number = 1;

  constructor(page: number = 1, limit: number = 20) {
    this.page = Math.max(1, page);
    this.take = Math.min(Math.max(1, limit), 100);
    this.skip = (this.page - 1) * this.take;
  }
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
