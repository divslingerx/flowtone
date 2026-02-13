/**
 * Port system type definitions and utilities
 *
 * Re-exports port types from types3.ts and provides additional utilities
 * for working with the port system.
 */

import { Position } from "@xyflow/react";

// Re-export core port types from types3.ts
export type {
  Port,
  PortConfig,
  SignalType,
  ChannelCount,
} from "~/nodes/types3";

import type { Port, PortConfig, SignalType } from "~/nodes/types3";

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Handle ID format: nodeId:direction:portIndex
 * Example: "osc-123:out:0"
 */
export type HandleId = `${string}:${"in" | "out"}:${number}`;

/**
 * Parsed handle ID components
 */
export interface ParsedHandleId {
  nodeId: string;
  direction: "in" | "out";
  portIndex: number;
}

/**
 * Connection information with port indices
 */
export interface PortConnection {
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortIndex: number;
  targetPortIndex: number;
  sourcePortId?: string;
  targetPortId?: string;
}

// ============================================================================
// PORT FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a simple single-port configuration
 * Used for most basic Tone.js nodes
 */
export function createSinglePortConfig(
  signalType: SignalType = "audio"
): PortConfig {
  return {
    inputs: [
      {
        id: "input",
        type: "input",
        signalType,
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [
      {
        id: "output",
        type: "output",
        signalType,
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  };
}

/**
 * Create a source node configuration (no inputs)
 */
export function createSourcePortConfig(
  signalType: SignalType = "audio"
): PortConfig {
  return {
    inputs: [],
    outputs: [
      {
        id: "output",
        type: "output",
        signalType,
        position: Position.Bottom,
        channelIndex: 0,
      },
    ],
  };
}

/**
 * Create a destination node configuration (no outputs)
 */
export function createDestinationPortConfig(
  signalType: SignalType = "audio"
): PortConfig {
  return {
    inputs: [
      {
        id: "input",
        type: "input",
        signalType,
        position: Position.Top,
        channelIndex: 0,
      },
    ],
    outputs: [],
  };
}

/**
 * Create a stereo merge configuration (2 mono inputs → 1 stereo output)
 */
export function createMergePortConfig(channels: number = 2): PortConfig {
  const inputs: Port[] = [];
  const spacing = channels > 1 ? 40 / (channels - 1) : 0;

  for (let i = 0; i < channels; i++) {
    inputs.push({
      id: `input-${i}`,
      type: "input",
      label: `Ch ${i + 1}`,
      signalType: "audio",
      position: Position.Top,
      positionOffset: {
        x: (i - (channels - 1) / 2) * spacing,
        y: 0,
      },
      channelIndex: i,
      channelCount: 1,
    });
  }

  return {
    inputs,
    outputs: [
      {
        id: "output",
        type: "output",
        label: "Stereo",
        signalType: "audio",
        position: Position.Bottom,
        channelIndex: 0,
        channelCount: 2,
      },
    ],
  };
}

/**
 * Create a stereo split configuration (1 stereo input → N mono outputs)
 */
export function createSplitPortConfig(channels: number = 2): PortConfig {
  const outputs: Port[] = [];
  const spacing = channels > 1 ? 40 / (channels - 1) : 0;

  for (let i = 0; i < channels; i++) {
    outputs.push({
      id: `output-${i}`,
      type: "output",
      label: `Ch ${i + 1}`,
      signalType: "audio",
      position: Position.Bottom,
      positionOffset: {
        x: (i - (channels - 1) / 2) * spacing,
        y: 0,
      },
      channelIndex: i,
      channelCount: 1,
    });
  }

  return {
    inputs: [
      {
        id: "input",
        type: "input",
        label: "Stereo",
        signalType: "audio",
        position: Position.Top,
        channelIndex: 0,
        channelCount: 2,
      },
    ],
    outputs,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a handle ID from components
 */
export function createHandleId(
  nodeId: string,
  direction: "in" | "out",
  portIndex: number
): HandleId {
  return `${nodeId}:${direction}:${portIndex}`;
}

/**
 * Parse a handle ID into its components
 */
export function parseHandleId(handleId: string): ParsedHandleId {
  const parts = handleId.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid handle ID format: ${handleId}`);
  }

  const nodeId = parts[0];
  const direction = parts[1];
  const portIndexStr = parts[2];

  if (!nodeId || !direction || !portIndexStr) {
    throw new Error(`Invalid handle ID format: ${handleId}`);
  }

  if (direction !== "in" && direction !== "out") {
    throw new Error(`Invalid direction in handle ID: ${direction}`);
  }

  return {
    nodeId,
    direction: direction as "in" | "out",
    portIndex: parseInt(portIndexStr, 10),
  };
}

/**
 * Get port from config by index
 */
export function getPortByIndex(
  config: PortConfig,
  direction: "in" | "out",
  index: number
): Port | undefined {
  const ports = direction === "in" ? config.inputs : config.outputs;
  return ports[index];
}

/**
 * Get port from config by ID
 */
export function getPortById(
  config: PortConfig,
  portId: string
): Port | undefined {
  const allPorts = [...config.inputs, ...config.outputs];
  return allPorts.find((p) => p.id === portId);
}

/**
 * Find port index by ID
 */
export function getPortIndexById(
  config: PortConfig,
  portId: string
): { direction: "in" | "out"; index: number } | undefined {
  const inputIndex = config.inputs.findIndex((p) => p.id === portId);
  if (inputIndex !== -1) {
    return { direction: "in", index: inputIndex };
  }

  const outputIndex = config.outputs.findIndex((p) => p.id === portId);
  if (outputIndex !== -1) {
    return { direction: "out", index: outputIndex };
  }

  return undefined;
}

/**
 * Get handle style based on signal type
 */
export function getHandleStyle(signalType: SignalType): {
  backgroundColor: string;
  width: number;
  height: number;
} {
  const styles = {
    audio: { backgroundColor: "#4CAF50", width: 14, height: 14 },
    control: { backgroundColor: "#2196F3", width: 10, height: 10 },
    midi: { backgroundColor: "#9C27B0", width: 12, height: 12 },
    trigger: { backgroundColor: "#FF9800", width: 8, height: 8 },
  };

  return styles[signalType] || styles.audio;
}

/**
 * Validate connection between two ports
 */
export function isValidPortConnection(
  sourcePort: Port,
  targetPort: Port
): { valid: boolean; reason?: string } {
  // Direction check
  if (sourcePort.type !== "output" || targetPort.type !== "input") {
    return {
      valid: false,
      reason: "Source must be output, target must be input",
    };
  }

  // Signal type matching
  if (sourcePort.signalType !== targetPort.signalType) {
    // Allow audio → control (modulation)
    if (sourcePort.signalType === "audio" && targetPort.signalType === "control") {
      return { valid: true };
    }

    return {
      valid: false,
      reason: `Signal type mismatch: ${sourcePort.signalType} → ${targetPort.signalType}`,
    };
  }

  // Channel count compatibility (for audio)
  if (sourcePort.signalType === "audio" && targetPort.signalType === "audio") {
    const sourceChannels = sourcePort.channelCount || 1;
    const targetChannels = targetPort.channelCount || 1;

    if (sourceChannels > targetChannels) {
      return {
        valid: false,
        reason: `Channel mismatch: ${sourceChannels} → ${targetChannels}`,
      };
    }
  }

  return { valid: true };
}
