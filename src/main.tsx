import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "@xyflow/react";

import App from "./App";
import { AudioEngine } from "./store/audioEngine";
import { AudioEngineContext } from "./store/audioContext";
import { useRFStore } from "./store/store";

import "./index.css";
import { MIDIProvider } from "@react-midi/hooks";

// Create the singleton AudioEngine instance
const audioEngine = new AudioEngine();

// Initialize the store with the AudioEngine
useRFStore.getState().setAudioEngine(audioEngine);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MIDIProvider>
      <AudioEngineContext.Provider value={audioEngine}>
        <div style={{ width: "100vw", height: "100vh" }}>
          <ReactFlowProvider>
            <App />
          </ReactFlowProvider>
        </div>
      </AudioEngineContext.Provider>
    </MIDIProvider>
  </React.StrictMode>
);
