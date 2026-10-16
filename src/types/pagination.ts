export type PaginationMeta = {
  page_number: number;
  page_size: number;
  total_count: number;
  prev_page: number | null;
  next_page: number | null;
  last_page: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};
