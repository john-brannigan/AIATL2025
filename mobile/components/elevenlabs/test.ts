import readline from "readline";
import fs from "fs";
import { textToSpeech } from "./tts.ts";
import { speechToText } from "./stt.ts";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt utility
function questionAsync(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    // Test TTS
    const text = await questionAsync("Enter text to convert to speech: ");
    console.log("Generating TTS audio...");
    const ttsFile = await textToSpeech(text);
    console.log(`TTS audio saved as: ${ttsFile}`);

    // Test STT
    const audioPath = await questionAsync("Enter path to audio file for STT: ");
    if (!fs.existsSync(audioPath)) {
      console.error("Audio file does not exist. Exiting.");
      rl.close();
      return;
    }

    console.log("Converting audio to text...");
    const transcribedText = await speechToText(audioPath);
    console.log("Transcribed text:", transcribedText);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    rl.close();
  }
}

// Run the test
main();