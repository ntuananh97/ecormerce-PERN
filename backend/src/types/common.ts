export interface IPaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface IPaginatedParams {
    page: number;
    limit: number;
    sort: string;
    sortOrder: 'asc' | 'desc';
  }
  