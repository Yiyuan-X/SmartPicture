"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  getRedirectResult,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase-client";

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string, displayName?: string) {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
}

export async function logout() {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export async function getAvailableSignInMethods(email: string) {
  const auth = getFirebaseAuth();
  return fetchSignInMethodsForEmail(auth, email);
}

export async function getCurrentIdToken(forceRefresh = false) {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(forceRefresh);
}

export type AuthSuccessPayload = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  idToken: string;
};

export async function toAuthSuccessPayload(credential: UserCredential): Promise<AuthSuccessPayload> {
  const idToken = await credential.user.getIdToken(true);
  return {
    uid: credential.user.uid,
    email: credential.user.email,
    displayName: credential.user.displayName,
    idToken,
  };
}

export async function sendResetEmail(email: string) {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

export async function consumePendingRedirect() {
  const auth = getFirebaseAuth();
  try {
    await getRedirectResult(auth);
  } catch (error) {
    // swallow redirect errors; they usually mean there was no pending result
    console.warn("[auth] consumePendingRedirect failed", error);
  }
}
