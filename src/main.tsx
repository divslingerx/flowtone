import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";
import { MIDIProvider } from "@react-midi/hooks";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MIDIProvider>
      <App />
    </MIDIProvider>
  </React.StrictMode>
);
