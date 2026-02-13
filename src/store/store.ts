import { createWithEqualityFn } from "zustand/traditional";
import { AudioEngine } from "./audioEngine";
import { initialNodes } from "../nodes";
import { initialEdges } from "../edges";

import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";

import { AppNode, ToneComponentKey } from "../nodes/types";
import { devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import * as Tone from "tone";

export interface RFStore {
  nodes: AppNode[];
  edges: Edge[];
  audioEngine: AudioEngine | null;
  getNode: (id: string) => AppNode;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: <T extends AppNode>(
    id: string,
    data: Partial<T["data"]>
  ) => void;
  addEdge: (data: Omit<Edge, "id">) => void;
  createNode: (type: ToneComponentKey) => void;
  // New: Initialize store with external AudioEngine
  setAudioEngine: (engine: AudioEngine) => void;
}

export const useRFStore = createWithEqualityFn(
  devtools<RFStore>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    audioEngine: null, // Will be set via setAudioEngine

    setAudioEngine: (engine: AudioEngine) => {
      set({ audioEngine: engine });
    },

    getNode: (id: string) => {
      const node = get().nodes.find((n) => n.id === id);
      if (!node) throw new Error(`Node with id ${id} not found`);
      return node;
    },

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      const { audioEngine, edges } = get();

      // Handle edge deletions - disconnect audio
      if (audioEngine) {
        for (const change of changes) {
          if (change.type === "remove") {
            const edge = edges.find((e) => e.id === change.id);
            if (edge) {
              try {
                audioEngine.disconnectNodes(edge.source, edge.target);
              } catch (error) {
                console.warn(`Failed to disconnect audio for edge ${change.id}:`, error);
              }
            }
          }
        }
      }

      set({
        edges: applyEdgeChanges(changes, edges),
      });
    },

    setNodes: (nodes) => {
      set({ nodes });
    },

    setEdges: (edges) => {
      set({ edges });
    },

    addEdge: (data) => {
      const id = nanoid(6);
      const edge = { id, ...data };
      set({ edges: [edge, ...get().edges] });
    },

    createNode<T extends ToneComponentKey>(type: T) {
      const { audioEngine } = get();
      if (!audioEngine) {
        console.error("Cannot create node: AudioEngine not initialized");
        return;
      }

      const id = nanoid();

      // Create audio node through AudioEngine
      const node = audioEngine.createNode(id, type);

      // Get default parameters from the created node
      const data = Object.fromEntries(
        Object.entries(node).filter(
          ([, value]) =>
            value instanceof Tone.Param ||
            typeof value === "number" ||
            typeof value === "string"
        )
      );

      const position = { x: 400, y: 0 };

      set({
        nodes: [
          ...get().nodes,
          {
            id,
            type,
            data: { ...data, label: type },
            position,
          },
        ] as AppNode[],
      });

      console.log(`Created node: ${type}`, { id, data, position });
    },

    updateNodeData: <NodeType extends AppNode>(
      id: string,
      data: Partial<NodeType["data"]>
    ) => {
      const { audioEngine } = get();

      try {
        // Update audio parameters through AudioEngine
        if (audioEngine) {
          audioEngine.updateNodeParams(id, data);
        }

        // Update store state
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? ({ ...node, data: { ...node.data, ...data } } as NodeType)
              : node
          ),
        });
      } catch (error) {
        console.error(`Failed to update node ${id}:`, error);
        throw error;
      }
    },

    onConnect: (connection) => {
      const { audioEngine } = get();

      try {
        // Create audio connection
        if (audioEngine && connection.source && connection.target) {
          audioEngine.connectNodes(connection.source, connection.target);
        }

        // Update store state
        set({
          edges: addEdge(connection, get().edges),
        });
      } catch (error) {
        console.error("Failed to connect nodes:", error);
        throw error;
      }
    },
  }))
);
