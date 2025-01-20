import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "@xyflow/react";

import App from "./App";

import "./index.css";
import { MIDIProvider } from "@react-midi/hooks";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MIDIProvider>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlowProvider>
          <App />
        </ReactFlowProvider>
      </div>
    </MIDIProvider>
  </React.StrictMode>
);
