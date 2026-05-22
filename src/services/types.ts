export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PartnerFilters {
  search?: string;
  tier?: string[];
  status?: string[];
  type?: string[];
  region?: string[];
}

export interface DealFilters {
  search?: string;
  status?: string[];
  region?: string[];
  partnerId?: string;
}
