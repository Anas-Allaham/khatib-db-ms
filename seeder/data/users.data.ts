export interface SeedUser {
  ownerId: string;
}

export const SEED_USERS: SeedUser[] = Array.from({ length: 40 }, (_, index) => ({
  ownerId: `seed-user-${String(index + 1).padStart(3, '0')}`,
}));
