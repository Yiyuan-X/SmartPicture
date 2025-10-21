import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SlashPage() {
  const router = useRouter();
  const { id } = router.query; // slashId
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSlash() {
    setLoading(true);
    try {
      const res = await fetch(
        "https://no-code-architects-toolkit-83180674409.us-central1.run.app/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slashId: id,
            helperId: "user_" + Math.random().toString(36).substring(7), // 临时模拟用户ID
          }),
        }
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("砍价失败:", err);
      setResult({ error: "网络错误，请稍后再试" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      handleSlash();
    }
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🎉 帮好友砍一刀</h1>

      {loading && <p className="text-gray-500">正在砍价中...</p>}

      {result && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p className="text-lg text-gray-700">{result.message}</p>
              <p className="text-xl font-semibold text-green-600 mt-2">
                💰 当前价格：{result.currentPrice} 元
              </p>
              <p className="text-gray-500 mt-2">
                🪓 本次帮砍：{result.cutAmount} 元
              </p>
              <p className="text-blue-500 mt-4">
                获得积分：{result.helperPoints} ✨
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
