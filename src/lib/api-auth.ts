import { verifyIdToken } from "./firebase-admin";

export async function requireAuth(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return { error: "缺少 Authorization 头信息。", status: 401 } as const;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { error: "Authorization 头格式不正确。", status: 401 } as const;
  }

  try {
    const decoded = await verifyIdToken(match[1]);
    return { uid: decoded.uid, claims: decoded } as const;
  } catch (error) {
    console.error("Failed to verify Firebase ID token:", error);
    return { error: "身份验证失败或令牌已过期。", status: 401 } as const;
  }
}
