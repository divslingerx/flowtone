import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createSlice, configureStore } from "@reduxjs/toolkit";

interface AudioState {
  connections: Array<{ source: string; target: string }>;
  nodes: Record<string, { type: string; params?: Record<string, unknown> }>;
}

const initialState: AudioState = {
  connections: [],
  nodes: {},
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    addConnection(state, action) {
      state.connections.push(action.payload);
    },
    removeConnection(state, action) {
      state.connections = state.connections.filter(
        (conn) =>
          conn.source !== action.payload.source ||
          conn.target !== action.payload.target
      );
    },
    addNode(state, action) {
      state.nodes[action.payload.id] = action.payload;
    },
    removeNode(state, action) {
      delete state.nodes[action.payload.id];
    },
  },
});

const store = configureStore({
  reducer: audioSlice.reducer,
});

export const useAudioStore = create(
  devtools(
    immer(() => ({
      ...store.getState(),
      dispatch: store.dispatch,
      undo: () => store.dispatch({ type: "UNDO" }),
      redo: () => store.dispatch({ type: "REDO" }),
      ...audioSlice.actions,
    }))
  )
);

export const { addConnection, removeConnection, addNode, removeNode } =
  audioSlice.actions;
