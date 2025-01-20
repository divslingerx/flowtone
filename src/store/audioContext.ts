import { createContext } from "react";
import { AudioEngine } from "./audioEngine";

export const AudioEngineContext = createContext<AudioEngine | null>(null);
