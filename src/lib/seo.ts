export function baseMeta({
  title,
  description,
  url,
  image
}: {title: string; description: string; url: string; image: string;}) {
  return [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ];
}

export function jsonLdFAQ(items: {q:string;a:string}[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(i => ({
      "@type": "Question",
      "name": i.q,
      "acceptedAnswer": { "@type": "Answer", "text": i.a }
    }))
  };
}

export function jsonLdProduct({
  name, description, brand, price, priceCurrency='CNY', url
}: {name:string;description:string;brand:string;price:number;priceCurrency?:string;url:string}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "brand": { "@type":"Brand", "name": brand },
    "offers": {
      "@type":"AggregateOffer",
      "priceCurrency": priceCurrency,
      "lowPrice": price,
      "highPrice": price*3,
      "offerCount": 3,
      "url": url,
      "availability":"https://schema.org/InStock"
    }
  };
}
