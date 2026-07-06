export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponseData {
  user: AuthUser;
}

export type SystemUser = Required<AuthUser>;
