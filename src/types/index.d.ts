interface PageType {
  pageNumber: number;
  pageSize: number;
}

interface ResultPageType<T> {
  total: number;
  result: Array<T>;
}

interface IdType {
  id: string | number;
}
