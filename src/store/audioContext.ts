import { createContext, useContext } from "react";
import { AudioEngine } from "./audioEngine";

export const AudioEngineContext = createContext<AudioEngine | null>(null);

/**
 * Hook to access the AudioEngine singleton from React components
 * @throws Error if used outside of AudioEngineContext.Provider
 */
export function useAudioEngine(): AudioEngine {
  const engine = useContext(AudioEngineContext);
  if (!engine) {
    throw new Error("useAudioEngine must be used within AudioEngineContext.Provider");
  }
  return engine;
}

/**
 * Hook to optionally access the AudioEngine (returns null if not available)
 * Useful for components that may render before the engine is ready
 */
export function useAudioEngineOptional(): AudioEngine | null {
  return useContext(AudioEngineContext);
}
