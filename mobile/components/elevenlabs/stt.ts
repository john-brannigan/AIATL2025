import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

const ELEVENLABS_API_KEY = "sk_87f129a69d2948f1960f3724281e658cb6fd92facf603f27";

export async function speechToText(audioPath: string): Promise<string> {
  const audioBuffer = fs.readFileSync(audioPath);

  const form = new FormData();
  form.append("file", audioBuffer, "audio.wav"); // filename required

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      ...form.getHeaders(), // form-data sets correct content type
    },
    body: form as any, // TypeScript workaround
  });

  if (!response.ok) {
    throw new Error(`STT request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}