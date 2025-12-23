export type UserRole = "ADMIN" | "CUSTOMER" | "MANAGER";

export interface User {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
}
