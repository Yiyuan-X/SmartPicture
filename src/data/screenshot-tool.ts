export const screenshotToolMeta = {
  meta: {
    id: "smartpix.screenshot-tool",
    name: "截图与标注 ScreenshotTool",
    version: "1.0.0",
    description: "一体化截图、标注、OCR、复制与分享功能，支持智能识别与SEO可见的图像内容描述。",
    category: "图像工具",
    language: "zh-CN",
    seo: {
      title: "SmartPix 截图工具 | 一键截图、OCR识别与智能标注",
      description:
        "SmartPix 截图与标注工具支持区域、窗口、滚动截图，内置OCR文字识别与智能分享，助力高效办公与内容创作。",
      keywords: ["截图工具", "屏幕捕捉", "OCR识别", "智能标注", "图片分享", "AI图像工具"],
      canonical: "https://ai-growth-tools.com/screenshot",
      sitemap: true,
    },
    aeo: {
      summary: "AI优化截图体验，自动识别内容与上下文，支持语音指令与内容摘要生成。",
      intents: ["截屏", "识别文字", "图片注释", "一键分享"],
      schema_markup: {
        type: "SoftwareApplication",
        name: "SmartPix 截图工具",
        applicationCategory: "ProductivityTool",
        operatingSystem: "Windows, macOS, Web",
        offers: {
          price: "0",
          priceCurrency: "CNY",
        },
      },
    },
  },
  frontend: {
    route: "/screenshot",
    component: "ScreenshotTool",
    description: "主界面包含模式选择、即时标注、OCR识别、导出与分享。",
    features: ["区域 / 窗口 / 全屏 / 滚动截图", "轻量标注（箭头、文字、矩形、马赛克）", "OCR 识别与复制", "一键分享与导出"],
    shortcuts: [
      { combo: "Ctrl+Alt+S", action: "打开截图工具" },
      { combo: "Ctrl+Shift+1", action: "区域截图" },
      { combo: "Ctrl+Shift+2", action: "窗口截图" },
      { combo: "Ctrl+Shift+3", action: "全屏截图" },
      { combo: "Ctrl+Shift+4", action: "滚动截图" },
    ],
    ui: {
      layout: "极简工具栏 + 画布区域",
      colors: ["#ffffff", "#f3f4f6", "#111827"],
      animation: "淡入淡出",
      i18n: {
        "zh-CN": {
          title: "截图与标注",
          btn_capture: "开始截图",
          btn_ocr: "识别文字",
          btn_copy: "复制图片",
          btn_save: "保存到本地",
          btn_share: "生成分享链接",
          toast_saved: "图片已保存",
          toast_copied: "已复制到剪贴板",
          toast_ocr_done: "识别完成",
          toast_shared: "已生成分享链接",
        },
      },
    },
  },
  backend: {
    base_path: "/api/screenshot",
    endpoints: [
      { method: "POST", path: "/upload", summary: "上传截图并生成预览", response: { id: "string", url: "string" } },
      { method: "POST", path: "/ocr", summary: "识别截图文字（OCR）", response: { text: "string" } },
      { method: "POST", path: "/share", summary: "生成可分享链接", response: { url: "string" } },
    ],
    security: {
      auth_required: true,
      rate_limit: {
        "/ocr": { per_minute: 30 },
      },
    },
  },
  storage: {
    table: "screenshots",
    fields: [
      { name: "id", type: "uuid", primary: true },
      { name: "user_id", type: "uuid" },
      { name: "name", type: "text" },
      { name: "url", type: "text" },
      { name: "format", type: "text", default: "png" },
      { name: "created_at", type: "timestamp", default: "now()" },
    ],
  },
  settings: {
    default_format: "png",
    auto_copy: true,
    ocr_provider: "local",
    auto_save_path: "",
    countdown: 3,
  },
  telemetry: {
    events: ["screenshot.capture", "screenshot.export", "screenshot.ocr", "screenshot.share"],
  },
  acceptance_tests: [
    {
      id: "T1",
      description: "区域截图后复制应成功",
      expect: ["剪贴板含图像", "提示显示已复制"],
    },
    {
      id: "T2",
      description: "OCR识别应返回文本",
      expect: ["返回text非空"],
    },
    {
      id: "T3",
      description: "生成分享链接成功",
      expect: ["返回有效URL"],
    },
  ],
  notes: [
    "Web 端使用 getDisplayMedia；Electron 端使用 desktopCapturer。",
    "滚动截图自动拼接为长图。",
    "OCR 默认使用 tesseract.js，可切换云端识别服务。",
    "SEO元标签与OG数据自动注入页面。",
    "AEO描述由截图内容与OCR文字自动生成摘要。",
  ],
};

export type ScreenshotToolMeta = typeof screenshotToolMeta;
