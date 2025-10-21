import Head from "next/head";
import { baseMeta, jsonLdFAQ, jsonLdProduct } from "../lib/seo";

const title = "SmartPicture — 一句提示生成商业级视觉与内容";
const desc  = "创意工作室 / 内容助理 / 多媒体枢纽 / 知识库 / 智能洞察 / 截图标注。邀请裂变双方积分，砍一刀越砍越省。";
const url   = "https://cxktech.top/";
const img   = "https://cxktech.top/og-cover.jpg";

export default function Home() {
  const meta = baseMeta({ title, description: desc, url, image: img });
  const faq  = jsonLdFAQ([
    { q:"如何获得免费积分？", a:"注册即送100分，邀请双方各得50–160分，帮砍一刀再得5分。" },
    { q:"积分怎么用？", a:"生成图片5分/次、文章10分/篇、视频摘要20分/次、知识问答3分/次。" }
  ]);
  const product = jsonLdProduct({
    name:"SmartPicture VIP",
    description:"月/年/三年订阅，解锁高阶模型、批量生成、团队协作与版权保障。",
    brand:"SmartPicture",
    price:19,
    url
  });

  return (
    <>
      <Head>
        <title>{title}</title>
        {meta.map((m, i)=><meta key={i} {...m} />)}
        <link rel="canonical" href={url}/>
        <link rel="alternate" hrefLang="zh-CN" href={url}/>
        <link rel="alternate" hrefLang="en" href={`${url}en/`}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faq)}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(product)}} />
      </Head>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-gray-600">{desc}</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">创意工作室</h2>
            <p>一句提示生成商业级视觉，保持角色一致性。</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">内容助理</h2>
            <p>深度解析图片，自动产出文案/关键词/多渠道素材。</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">多媒体枢纽</h2>
            <p>长视频/音频一键摘要、精彩片段与高音质配音。</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold">知识库</h2>
            <p>上传 PDF/文档获得带引用的精准回答，企业级检索。</p>
          </div>
        </section>

        <section className="mt-10">
          <h3 className="font-semibold">联系我们（Geo 信任）</h3>
          <p>电话：+86-021-xxxx-xxxx · 服务时间（UTC+8） · 地址：上海·浦东新区</p>
        </section>
      </main>
    </>
  );
}
