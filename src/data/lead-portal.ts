export const leadPortalConfig = {
  module: {
    id: "lead_portal",
    name: "用户报名与转化模块",
    type: "ui/section",
    position: "footer",
    visible: true,
    description:
      "三个转化按钮的扩展逻辑模块，用于收集潜在用户报名信息，支持微信二维码、邮箱自动通知与后台API提交。",
  },
  triggers: {
    buttons: [
      { label: "我也想学开发", action: "open_form", form_id: "form_learn", style: "primary" },
      { label: "咨询定制开发", action: "open_form", form_id: "form_custom", style: "secondary" },
      { label: "加入 AI 创作者计划", action: "open_form", form_id: "form_creator", style: "accent" },
    ],
  },
  forms: [
    {
      id: "form_learn",
      title: "AI工具开发实战营报名",
      description:
        "想从零打造属于自己的AI工具？立即加入AI工具开发实战营！\n🎁 组团报名立减200元 + 赠送完整项目源码\n🕓 报名截止：本周日23:59",
      fields: [
        { name: "name", label: "姓名", type: "text", required: true },
        { name: "wechat", label: "微信号 / 手机号", type: "text", required: true },
        { name: "email", label: "邮箱（选填）", type: "email" },
        {
          name: "interest",
          label: "学习方向",
          type: "select",
          options: ["AI工具", "自动化助手", "图像生成", "数据分析"],
        },
        { name: "note", label: "备注", type: "textarea" },
      ],
      submit: {
        api: "/api/lead/submit",
        payload: { type: "learn" as const },
        success_message: "🎉 报名成功！AI助教将尽快联系您。",
      },
      contact: {
        wechat_qr: "https://via.placeholder.com/150x150.png?text=WeChat+QR",
        email: "academy@fosintl.com",
      },
    },
    {
      id: "form_custom",
      title: "AI定制开发咨询",
      description:
        "想定制属于你自己的AI工具？无论是个人项目还是团队方案，我们都能为你量身打造高效解决方案。\n🎁 前50位咨询免费赠送《AI智能应用优化报告》",
      fields: [
        { name: "name", label: "姓名", type: "text", required: true },
        { name: "email", label: "邮箱", type: "email", required: true },
        { name: "wechat", label: "微信号 / 电话", type: "text", required: true },
        {
          name: "identity",
          label: "身份类型",
          type: "select",
          options: ["个人", "小团队", "企业客户"],
        },
        {
          name: "need",
          label: "需求类型",
          type: "multiselect",
          multiple: true,
          options: ["AI写作助手", "智能客服", "数据看板", "图像工具", "其他"],
        },
        { name: "note", label: "详细需求描述", type: "textarea" },
      ],
      submit: {
        api: "/api/lead/submit",
        payload: { type: "custom" as const },
        success_message: "🎉 感谢您的咨询！我们将尽快与您联系。",
      },
      contact: {
        wechat_qr: "https://via.placeholder.com/150x150.png?text=WeChat+QR",
        email: "dev@fosintl.com",
      },
    },
    {
      id: "form_creator",
      title: "AI创作者计划报名",
      description:
        "欢迎加入AI创作者计划！发布AI作品、教程或插件，赚取积分与推广奖励 💎 加入即送100积分。",
      fields: [
        { name: "name", label: "昵称 / 姓名", type: "text", required: true },
        { name: "email", label: "邮箱", type: "email", required: true },
        { name: "wechat", label: "微信号", type: "text", required: true },
        {
          name: "skills",
          label: "擅长方向",
          type: "multiselect",
          multiple: true,
          options: ["AI内容", "编程", "设计", "营销", "教育"],
        },
        { name: "intro", label: "作品或个人介绍", type: "textarea" },
        {
          name: "promo_support",
          label: "是否需要推广支持",
          type: "select",
          options: ["是", "否"],
        },
      ],
      submit: {
        api: "/api/lead/submit",
        payload: { type: "creator" as const },
        success_message: "🎉 欢迎加入AI创作者计划！积分已自动发放。",
      },
      contact: {
        wechat_qr: "https://via.placeholder.com/150x150.png?text=WeChat+QR",
        email: "creator@fosintlcom",
      },
    },
  ],
  backend: {
    api: "/api/lead/submit",
    method: "POST",
    storage: "PostgreSQL",
    notify_email: "support@fosintlcom",
    actions: ["send_email_notification", "store_to_database", "auto_reply"],
  },
};

export type LeadPortalConfig = typeof leadPortalConfig;
