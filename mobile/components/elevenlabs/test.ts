import { textToSpeech } from "./tts";
import { speechToText } from "./stt";
import fs from "fs";
import readline from "readline";

// Utility to prompt input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testTTS() {
  rl.question("Enter text to convert to speech: ", async (inputText) => {
    try {
      console.log("Generating TTS...");
      const audioPath = await textToSpeech(inputText);
      console.log("TTS audio saved at:", audioPath);
    } catch (err) {
      console.error("TTS error:", err);
    }

    testSTT(); // move on to STT test
  });
}

async function testSTT() {
  rl.question("Enter path to audio file to convert to text: ", async (audioPath) => {
    if (!fs.existsSync(audioPath)) {
      console.error("File does not exist.");
      rl.close();
      return;
    }

    try {
      console.log("Converting speech to text...");
      const text = await speechToText(audioPath);
      console.log("Transcribed text:", text);
    } catch (err) {
      console.error("STT error:", err);
    }

    rl.close();
  });
}

testTTS();