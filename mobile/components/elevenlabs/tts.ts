import { Audio } from "expo-av";
import * as Speech from "expo-speech";
// Use legacy writeAsStringAsync to avoid deprecation warnings
import * as FileSystem from "expo-file-system/legacy";

const ELEVENLABS_MODEL = "eleven_turbo_v2";
const VOICE_ID = "iP95p4xoKVk53GoZ742B";

// Safe environment variable handling
const rawApiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
if (!rawApiKey) {
  throw new Error("ELEVENLABS_API_KEY is not defined in environment variables.");
}
const ELEVENLABS_API_KEY: string = rawApiKey; // TypeScript now knows it's a string

const getCacheDirectory = (): string =>
  FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";

export async function textToSpeech(text: string): Promise<string> {
  try {
    const fileUri = await textToSpeechElevenLabs(text);
    return fileUri;
  } catch (error) {
    console.warn("⚠️ ElevenLabs failed, falling back to native:", error);
    await textToSpeechNative(text);
    return "native";
  }
}

async function textToSpeechElevenLabs(text: string): Promise<string> {
  // Type-safe headers
  const headers: HeadersInit = {
    Accept: "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": ELEVENLABS_API_KEY, // guaranteed string
  };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const buffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(new Uint8Array(buffer)).toString("base64");

  const fileName = `temp-audio-${Date.now()}.mp3`;
  const fileUri = getCacheDirectory() + fileName;

  await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
    encoding: "base64",
  });

  // Play audio
  const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
  await sound.playAsync();

  return fileUri;
}

async function textToSpeechNative(text: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, { onDone: resolve, language: "en" });
  });
}