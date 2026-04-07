import type { UserRole } from "@/contexts/AuthContext";

export function isStoreManagerRole(role?: UserRole | string): boolean {
  return role === "owner" || role === "admin";
}
