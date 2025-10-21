import Head from "next/head";
import { baseMeta } from "../../lib/seo";

export default function ShareItem() {
  const item = {
    title: "品牌视觉作品示例",
    description: "由 SmartPicture AI 生成，稳定角色一致性，适配多渠道投放。",
    url: "https://cxktech.top/share/123",
    image: "https://cxktech.top/samples/123.jpg",
  };
  const meta = baseMeta(item);
  const ld = {
    "@context":"https://schema.org",
    "@type":"CreativeWork",
    "name": item.title,
    "description": item.description,
    "image": item.image,
    "url": item.url
  };

  return (
    <>
      <Head>
        <title>{item.title}</title>
        {meta.map((m,i)=><meta key={i} {...m}/>)}
        <link rel="canonical" href={item.url}/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(ld)}} />
      </Head>
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <p className="mt-2">{item.description}</p>
        <img src={item.image} className="mt-6 rounded" alt={item.title}/>
      </main>
    </>
  );
}
