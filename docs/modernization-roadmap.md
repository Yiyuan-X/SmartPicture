# SmartPicture Modernization Roadmap

## 当前进展
- 建立 `src/config/site.ts` 统一站点配置、导航、关键词与基础元数据。
- 新增 `src/lib/metadata.ts`、`src/components/seo/json-ld.tsx`、`src/lib/icon-registry.tsx` 与 `src/data/*` 模块，实现首页、创意工作室、内容助理等页面的按需数据加载与结构化数据输出。
- 首页、创意工作室、内容助理、知识库、多媒体枢纽、截图工具、愿望池及自动生文等路由现在通过 `createMetadata` 输出 SEO/AEO 所需的 canonical、OG、Twitter 信息，并在服务端注入 JSON-LD。
- 交互型页面（内容助理、知识库、多媒体枢纽、自动生文、愿望池）拆分为服务端壳组件 + 客户端交互组件，避免 `use client` 阻塞元数据声明，为后续按需加载和渐进式渲染打下基础。
- 清理未引用的数据文件（例如旧版 `screenshot-tool` 配置），降低打包体积。

## 推荐的下一步
1. **其余功能页面迁移**  
   - 为 `insights/[slug]`、`creative-suite` 内子模块、`generate-article` 产出详情等继续补齐 `createMetadata` 与 JSON-LD。  
   - 将重复的数据块（优势列表、流程步骤、API 说明等）抽取到 `src/data` 中，维持可复用性。

2. **组件级按需加载**  
   - 对交互体量大或依赖 Firebase 的组件（例如 `TryEditor`、`InspirationGallery`、文档上传器）采用 `next/dynamic` 懒加载。  
   - 将异步 API 调用逻辑下沉至 `src/features/<module>/services`，并配合 SWR/React Query 做缓存。

3. **性能与可访问性**  
   - 为每个页面补充 `<Link prefetch={false}>` 或滚动锚点优化，确保 FMP 不被大组件阻塞。  
   - 审视图片体积与 `Image` 组件占位符，结合 `next/image` 的 `placeholder="blur"` 减少布局抖动。  
   - 引入 `@next/third-parties/google`（或自建）输出结构化 FAQ/HowTo 以强化 AEO。

4. **内容与配置解耦**  
   - 将营销文案放入 `src/content` 或 CMS（例如 Notion、Sanity）接口，通过 `async` 数据函数按需请求，避免构建时打包过多静态文本。  
   - 用 `zod` 为数据模块建立校验，保证新增内容时不会破坏页面结构。

5. **流水线与质量控制**  
   - 将 `bunx` 改为 `npx` 或在 CI 中安装 Bun，确保 `pnpm lint` 可执行。  
   - 增设 Playwright/RTL 冒烟测试，覆盖主要交互流程与 API 错误提示。

## 监测指标建议
- 构建体积：使用 `next build --debug` 比对重构前后各路由 bundle 大小。
- FCP/TTI：通过 Lighthouse 或 Web Vitals 自定义上报，验证懒加载效果。
- 结构化数据：借助 Google Rich Results Test / Bing Content Analyzer 校验 JSON-LD 与 AEO 命中率。
