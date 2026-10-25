import { apiClient } from './apiClient';
import type { SeedUserResponse } from '../types/seedData';

// Development-only; delete before production — see code-structure.md
// "Seed Data Endpoint — Development Only".
export const seedDataService = {
  async getSeedUsers(): Promise<SeedUserResponse[]> {
    const response = await apiClient.get<SeedUserResponse[]>('/seeddata/users');
    return response.data;
  },
};
