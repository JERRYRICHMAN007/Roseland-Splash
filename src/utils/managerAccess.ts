import type { UserRole } from "@/contexts/AuthContext";

export function isStoreManagerRole(role?: UserRole | null): boolean {
  return role === "owner" || role === "admin";
}
