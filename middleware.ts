import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

// 这个中间件是用于保护 admin 路由，确保只有有 admin 权限的用户可以访问
export async function middleware(req) {
  // 从 cookie 中提取 token（注意：Firebase 默认 token 放在 cookie 中）
  const token = req.cookies.get('token')?.value;

  // 如果没有 token，重定向到登录页
  if (!token) return NextResponse.redirect('/login');

  try {
    // 使用 Firebase Admin SDK 验证 token
    const decoded = await getAuth().verifyIdToken(token);

    // 检查用户角色是否为 'admin'
    if (decoded.role !== 'admin') {
      return NextResponse.redirect('/dashboard'); // 如果不是 admin，则重定向到用户控制台
    }

    // 如果验证通过，继续访问
    return NextResponse.next();
  } catch (error) {
    // 如果验证失败，重定向到登录页
    console.error("Firebase auth error:", error);
    return NextResponse.redirect('/login');
  }
}

// 只保护 '/admin' 路由下的所有页面
export const config = {
  matcher: ['/admin/:path*'],
};
