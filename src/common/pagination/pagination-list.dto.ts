export class PaginationListDto<T> {
  total!: number;
  data!: T[];

  constructor(data: T[], total: number) {
    this.total = total;
    this.data = data;
  }
}
