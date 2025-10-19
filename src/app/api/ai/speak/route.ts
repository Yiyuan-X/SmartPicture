import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { requireAuth } from "@/lib/api-auth";
import { getGoogleCredentials } from "@/lib/google-service";

type SpeakRequestBody = {
  text?: string;
  voice?: "standard" | "warm" | "bright";
  locale?: string;
};

let ttsClient: TextToSpeechClient | null = null;

function getTtsClient() {
  if (!ttsClient) {
    const credentials = getGoogleCredentials();
    ttsClient = new TextToSpeechClient({ credentials });
  }
  return ttsClient;
}

const VOICE_MAP: Record<string, { languageCode: string; name: string }> = {
  standard: { languageCode: "cmn-CN", name: "cmn-CN-Standard-A" },
  warm: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-B" },
  bright: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-C" },
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  let body: SpeakRequestBody;

  try {
    body = (await request.json()) as SpeakRequestBody;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "请求体需为 JSON 格式。" },
      { status: 400 }
    );
  }

  if (!body?.text || !body.text.trim()) {
    return NextResponse.json(
      { success: false, error: "请输入需要合成语音的文本。" },
      { status: 400 }
    );
  }

  const voicePreset = VOICE_MAP[body.voice ?? "standard"] ?? VOICE_MAP.standard;
  const languageCode = body.locale ?? voicePreset.languageCode;

  try {
    const client = getTtsClient();
    const [response] = await client.synthesizeSpeech({
      input: { text: body.text.slice(0, 5000) },
      voice: { languageCode, name: voicePreset.name },
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
    });

    if (!response.audioContent) {
      throw new Error("未收到语音输出。");
    }

    const audioBase64 = Buffer.from(response.audioContent).toString("base64");

    return NextResponse.json(
      {
        success: true,
        uid: authResult.uid,
        locale: languageCode,
        voice: body.voice ?? "standard",
        audio: {
          mimeType: "audio/mpeg",
          dataUrl: `data:audio/mpeg;base64,${audioBase64}`,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Text-to-Speech error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "语音合成失败，请稍后再试。",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
