import { VertexAI } from "@google-cloud/vertexai";
import { getGoogleCredentials, getGoogleProjectId } from "./google-service";

const DEFAULT_LOCATION = process.env.VERTEX_LOCATION ?? "us-central1";

type ModelOptions = {
  model: string;
};

let cachedVertex: VertexAI | null = null;

export function getVertexInstance() {
  if (!cachedVertex) {
    const project = getGoogleProjectId();
    const credentials = getGoogleCredentials();
    cachedVertex = new VertexAI({
      project,
      location: DEFAULT_LOCATION,
      googleAuthOptions: { credentials },
    });
  }
  return cachedVertex;
}

export function getGenerativeModel(options: ModelOptions) {
  return getVertexInstance().preview.getGenerativeModel({ model: options.model });
}
