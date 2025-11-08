import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

let recording: Audio.Recording | null = null;

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function startRecording(
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      onError("Microphone permission not granted");
      return;
    }

    console.log("Starting audio recording...");
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    
    console.log("Recording started");

  } catch (error) {
    console.error("Error starting recording:", error);
    onError(String(error));
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      console.log("No recording to stop");
      return null;
    }

    console.log("Stopping recording...");
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    
    console.log("Recording saved to:", uri);
    return uri;

  } catch (error) {
    console.error("Error stopping recording:", error);
    return null;
  }
}

// Dummy hook for compatibility
export function useSpeechRecognitionEvent(event: string, callback: (data: any) => void) {
  // This is a placeholder - real speech recognition requires native module
  console.log("Speech recognition event listener:", event);
}