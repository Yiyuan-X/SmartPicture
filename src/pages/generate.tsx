import { useState } from "react";
import Head from "next/head";
import { generateImage, generateText } from "@/app/utils/api";

export default function Generate() {
  const [prompt, setPrompt] = useState("");
  const [img, setImg] = useState<string|undefined>();
  const [text, setText] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);

  const doImage = async () => {
    setLoading(true);
    try { const r = await generateImage(prompt); setImg(r.image); }
    finally { setLoading(false); }
  };

  const doText = async () => {
    setLoading(true);
    try { const r = await generateText(prompt); setText(r.generated_text); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head><title>AI 生成 | SmartPicture</title></Head>
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">AI 生成</h1>
        <input className="w-full border p-2 mt-4" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="输入你的提示词..." />
        <div className="flex gap-3 mt-3">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={doImage} disabled={loading}>生成图片（-5分）</button>
          <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={doText} disabled={loading}>生成文案（-10分）</button>
        </div>
        {img && <img src={img} alt="gen" className="mt-6 rounded" />}
        {text && <pre className="mt-6 p-3 bg-gray-50 rounded whitespace-pre-wrap">{text}</pre>}
      </main>
    </>
  );
}
