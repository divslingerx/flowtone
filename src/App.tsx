import { useCallback, useEffect } from "react";
import { MIDIProvider, useMIDIInputs } from "@react-midi/hooks";
import { useAudioStore } from "./store/audioStore";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { initialNodes, nodeTypes } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";

function MIDIApp() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { addConnection, removeConnection, addNode, removeNode } =
    useAudioStore();

  const { initializeAudio, setupMidi, cleanupAudio } = useAudioStore();
  const { input, inputs } = useMIDIInputs();

  // Initialize audio and setup MIDI
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAudio();
        // Setup MIDI with either the current input or first available
        const midiInput = input || (inputs[0] as globalThis.WebMidi.MIDIInput);
        if (midiInput) {
          setupMidi(midiInput);
        }
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    };

    init();

    return () => {
      cleanupAudio();
    };
  }, [initializeAudio, setupMidi, cleanupAudio, input, inputs]);

  // Add nodes to the flow
  useEffect(() => {
    addNode({ id: "synth", type: "synth" });
    addNode({ id: "midi", type: "midi" });
    addConnection({ source: "midi", target: "synth" });

    return () => {
      cleanupAudio();
      removeNode("synth");
      removeNode("midi");
      removeConnection({ source: "midi", target: "synth" });
    };
  }, [addConnection, addNode, removeConnection, removeNode, cleanupAudio]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}

export default function App() {
  return (
    <MIDIProvider>
      <div className="w-full h-screen">
        <MIDIApp />
      </div>
    </MIDIProvider>
  );
}
