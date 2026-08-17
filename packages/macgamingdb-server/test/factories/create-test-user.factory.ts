type TestUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
};

export const createTestUser = (
  overrides: Partial<TestUser> = {},
): TestUser => ({
  id: 'user_reviewer',
  email: 'reviewer@macgamingdb.test',
  name: 'Reviewer',
  emailVerified: true,
  ...overrides,
});
