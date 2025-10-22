import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseApp } from "./firebase-client";
import { getFirestore } from "firebase/firestore";

const firestore = getFirestore(getFirebaseApp());

export type UserRole = "admin" | "user";

async function getRoleFromClaims(user: User): Promise<UserRole | null> {
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
    const snapshot = await getDoc(doc(firestore, "users", user.uid));
    const role = snapshot.data()?.role;
    if (role === "admin") return "admin";
    if (typeof role === "string") return "user";
  } catch (error) {
    console.warn("[resolve-dashboard] Failed to load profile role:", error);
  }
  return null;
}

export async function resolveDashboardRoute(user: User): Promise<string> {
  const claimRole = await getRoleFromClaims(user);
  const resolvedRole = claimRole ?? (await getRoleFromProfile(user)) ?? "user";
  return resolvedRole === "admin" ? "/admin" : "/dashboard";
}
