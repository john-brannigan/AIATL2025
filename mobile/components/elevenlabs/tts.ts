import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { ELEVENLABS_API_KEY } from "@env";
import { File, Paths, Directory } from "expo-file-system/next";

const ELEVENLABS_MODEL = "eleven_turbo_v2";
const VOICE_ID = "iP95p4xoKVk53GoZ742B";

// Get cache directory as a Directory object
const getCacheDirectory = (): Directory => new Directory(Paths.cache);

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
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content‑Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
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

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const directory = getCacheDirectory();
  await directory.create({ intermediates: true });

  const fileName = `temp-audio-${Date.now()}.mp3`;
  // Construct the file in that directory
  const file = new File(directory, fileName);

  await file.create();                // create the file
  await file.write(uint8Array);       // write binary data

  const fileUri = file.uri;

  // Play the audio
  const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
  await sound.playAsync();

  return fileUri;
}

async function textToSpeechNative(text: string): Promise<void> {
  return new Promise((resolve) => {
    Speech.speak(text, { onDone: resolve, language: "en" });
  });
}