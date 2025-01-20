import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "@xyflow/react";

import App from "./App";
import { AudioEngine } from "./store/audioEngine";
import { AudioEngineContext } from "./store/audioContext";

import "./index.css";
import { MIDIProvider } from "@react-midi/hooks";

const audioEngine = new AudioEngine();

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
