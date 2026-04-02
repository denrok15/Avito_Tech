export type ItemCategory = 'auto' | 'real_estate' | 'electronics';

export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number | string;
  transmission?: 'automatic' | 'manual';
  mileage?: number | string;
  enginePower?: number | string;
};

export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number | string;
  floor?: number | string;
};

export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};

export type Item = {
  id: number;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision?: boolean;
} & (
  | {
      category: 'auto';
      params: AutoItemParams;
    }
  | {
      category: 'real_estate';
      params: RealEstateItemParams;
    }
  | {
      category: 'electronics';
      params: ElectronicsItemParams;
    }
);

export type ListItem = {
  id: number;
  category: ItemCategory;
  title: string;
  price: number | null;
  createdAt?: string;
  needsRevision: boolean;
};

export type ItemsGetOut = {
  items: ListItem[];
  total: number;
};

export type ItemsQuery = {
  q?: string;
  limit?: number;
  skip?: number;
  categories?: ItemCategory[];
  needsRevision?: boolean;
  sortColumn?: 'title' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};

export type ItemUpdateIn = {
  category: ItemCategory;
  title: string;
  description?: string;
  price: number;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

export type ApiErrorPayload = {
  success?: boolean;
  error?: string | { errors?: unknown[] } | Record<string, unknown>;
};
