import { useCallback, useEffect } from "react";
import { MIDIProvider, useMIDIInputs } from "@react-midi/hooks";
import { useAudioStore } from "./store/audioStore";
import * as Tone from "tone";
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

  const synth = new Tone.Synth().toDestination();
  const { input, inputs, selectInput, selectedInputId } = useMIDIInputs();

  // Setup MIDI input when available
  if (input) {
    input.onmidimessage = (message) => {
      const [command, note] = message.data;
      if (command === 144) {
        // Note on
        synth.triggerAttack(Tone.Frequency(note, "midi").toFrequency());
      } else if (command === 128) {
        // Note off
        synth.triggerRelease();
      }
    };
  }

  // Add nodes to the flow
  useEffect(() => {
    addNode({ id: "synth", type: "synth" });
    addNode({ id: "midi", type: "midi" });
    addConnection({ source: "midi", target: "synth" });

    return () => {
      synth.dispose();
      removeNode("synth");
      removeNode("midi");
      removeConnection({ source: "midi", target: "synth" });
    };
  }, [addConnection, addNode, removeConnection, removeNode, synth]);

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
