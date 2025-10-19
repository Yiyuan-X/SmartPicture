type GoogleCredentials = {
  project_id?: string;
  [key: string]: unknown;
};

let cachedCredentials: GoogleCredentials | null = null;

export function getGoogleCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  const source = process.env.GOOGLE_JSON ?? process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!source) {
    throw new Error("缺少 Google 服务账号配置，请设置 GOOGLE_JSON 或 GOOGLE_APPLICATION_CREDENTIALS_JSON。");
  }

  try {
    cachedCredentials = JSON.parse(source) as GoogleCredentials;
    return cachedCredentials;
  } catch (error) {
    throw new Error(`服务账号 JSON 解析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function getGoogleProjectId() {
  const credentials = getGoogleCredentials();
  const projectId = credentials.project_id ?? process.env.GOOGLE_PROJECT_ID;
  if (!projectId) {
    throw new Error("未找到 Google Project ID，请在服务账号或环境变量中提供。");
  }
  return projectId;
}
