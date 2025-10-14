export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
}