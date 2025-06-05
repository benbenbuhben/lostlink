const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.254.29:5001';

export interface Item {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function fetchItems(
  page: number,
  limit = 10,
  token?: string,
): Promise<PaginatedResponse<Item>> {
  const url = `${API_URL}/items?page=${page}&limit=${limit}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error('Error fetching items');
  }
  return res.json();
} 