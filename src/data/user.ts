export interface UserProfile {
  name: string;
  role?: string;
  email?: string;
  avatarUrl?: string;
}

export const mockUser: UserProfile = {
  name: "Jane Reviewer",
  role: "Document Analyst",
  email: "jane.reviewer@example.com",
  avatarUrl: undefined,
};

export const fetchMockUser = async (): Promise<UserProfile> => {
  // simulate a small network delay
  await new Promise((res) => setTimeout(res, 80));
  return mockUser;
};

export default fetchMockUser;
