const NON_WORD_REGEX = /[\s\W-]+/g;

export function slugify(input: string, options?: { maxLength?: number }) {
  const normalized = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const slug = normalized
    .toLowerCase()
    .trim()
    .replace(NON_WORD_REGEX, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  if (options?.maxLength && slug.length > options.maxLength) {
    return slug.slice(0, options.maxLength).replace(/-+$/g, "");
  }

  return slug || "article";
}
