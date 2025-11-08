import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

const ELEVENLABS_API_KEY = "e5e887f82d89810f3e65a408cf6c16bb590a59b5be4f8fef35b46c4b38b4b1aa";

// Example: use ElevenLabs default speech-to-text model
const MODEL_ID = "scribe_v1";

export async function speechToText(audioPath: string): Promise<string> {
  if (!fs.existsSync(audioPath)) {
    throw new Error(`Audio file does not exist: ${audioPath}`);
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const form = new FormData();
  form.append("file", audioBuffer, "audio.wav");
  form.append("model_id", MODEL_ID);

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      ...form.getHeaders(),
    },
    body: form as any,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`STT request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.text;
}