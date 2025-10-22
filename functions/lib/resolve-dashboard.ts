import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth, db } from "./firebase";

export type UserRole = "admin" | "user";

async function getRoleFromCustomClaims(user: User): Promise<UserRole | null> {
  try {
    const token = await user.getIdTokenResult(true);
    const rawRole = token.claims.role;
    if (typeof rawRole === "string") {
      if (rawRole === "admin") return "admin";
      if (rawRole === "user" || rawRole === "customer") return "user";
    }
  } catch (error) {
    console.warn("[resolve-dashboard] Failed to read custom claims:", error);
  }
  return null;
}

async function getRoleFromProfile(user: User): Promise<UserRole | null> {
  try {
    const ref = doc(db, "users", user.uid);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    const value = snapshot.data()?.role;
    if (value === "admin") return "admin";
    if (typeof value === "string") return "user";
  } catch (error) {
    console.warn("[resolve-dashboard] Failed to read profile role:", error);
  }
  return null;
}

export async function resolveDashboardRoute(user: User): Promise<string> {
  const claimRole = await getRoleFromCustomClaims(user);
  const resolvedRole = claimRole ?? (await getRoleFromProfile(user)) ?? "user";
  return resolvedRole === "admin" ? "/admin" : "/dashboard";
}

export async function routeAfterLogin(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }
  return resolveDashboardRoute(currentUser);
}
