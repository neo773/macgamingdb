type TestGame = {
  id: string;
  slug: string;
  name: string;
  headerImage: string;
  developers: string[];
  publishers: string[];
  genres: string[];
  releaseYear: number;
  reviewCount: number;
};

export const createTestGame = (
  overrides: Partial<TestGame> = {},
): TestGame => ({
  id: 'game_hades',
  slug: 'hades',
  name: 'Hades',
  headerImage: 'https://images.test/hades.jpg',
  developers: ['Supergiant Games'],
  publishers: ['Supergiant Games'],
  genres: ['Action', 'Roguelike'],
  releaseYear: 2020,
  reviewCount: 0,
  ...overrides,
});
