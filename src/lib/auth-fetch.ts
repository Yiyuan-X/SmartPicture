"use client";

import { getCurrentIdToken } from "./auth-client";

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const idToken = await getCurrentIdToken();
  if (!idToken) {
    throw new Error("请先登录再执行此操作。");
  }

  const headers = new Headers(init?.headers ?? {});
  headers.set("Authorization", `Bearer ${idToken}`);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  return fetch(input, {
    ...init,
    headers,
  });
}
