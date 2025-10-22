import * as admin from "firebase-admin"
if (!admin.apps.length) admin.initializeApp();

// frontend/pages/register.tsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">注册账户</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full border rounded p-2"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full border rounded p-2"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">注册</button>
        </form>

        <div className="text-center text-sm text-gray-500 my-4">或</div>

        <button onClick={handleGoogleLogin} className="w-full border py-2 rounded flex items-center justify-center">
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
          使用 Google 登录
        </button>

        <p className="text-center text-sm mt-4">
          已有账户？ <a href="/login" className="text-blue-600 underline">去登录</a>
        </p>
      </div>
    </div>
  );
}
