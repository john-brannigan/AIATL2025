import fs from "fs";

const ELEVENLABS_API_KEY = "sk_87f129a69d2948f1960f3724281e658cb6fd92facf603f27";

export async function textToSpeech(text: string, voice = "Rachel"): Promise<string> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error(`TTS request failed: ${response.statusText}`);

  const arrayBuffer = await response.arrayBuffer();
  const fileName = `tts_${Date.now()}.mp3`;
  fs.writeFileSync(fileName, Buffer.from(arrayBuffer));
  return fileName;
}