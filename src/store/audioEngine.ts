import * as Tone from "tone";
import { ToneComponentKey } from "../nodes/types";
export interface MIDINoteEvent {
  note: number;
  velocity: number;
}

/**
 * AudioEngine handles all Tone.js audio node creation, connection,
 * and parameter management for the application.
 */
const CONTINUOUS_SOURCES = new Set([
  "Oscillator",
  "OmniOscillator",
  "AMOscillator",
  "FMOscillator",
  "FatOscillator",
  "PWMOscillator",
  "PulseOscillator",
  "LFO",
]);

export class AudioEngine {
  private nodes: Map<string, InstanceType<typeof Tone.ToneAudioNode>> =
    new Map();
  private connections: Map<string, string[]> = new Map();

  /**
   * Creates a new Tone.js audio node and stores it in the engine
   * @param id - Unique identifier for the node
   * @param type - Type of Tone.js node to create
   * @returns The created Tone.js node instance
   */
  createNode<T extends ToneComponentKey>(
    id: string,
    type: T
  ): InstanceType<(typeof Tone)[T]> {
    const ToneClass = Tone[type];
    if (!ToneClass || typeof ToneClass !== "function") {
      throw new Error(`Unknown or invalid Tone component type: ${type}`);
    }

    // Create instance with proper typing through unknown assertion
    const node = new (ToneClass as unknown as new (
      options?: ConstructorParameters<(typeof Tone)[T]>[0]
    ) => InstanceType<(typeof Tone)[T]>)();
    this.nodes.set(id, node);

    // Route Channel nodes to speakers
    if (type === "Channel") {
      (node as Tone.Channel).toDestination();
    }

    // Auto-start continuous sources
    if (CONTINUOUS_SOURCES.has(type)) {
      (node as unknown as { start(): void }).start();
    }

    return node;
  }

  /**
   * Connects two audio nodes
   * @param sourceId - ID of the source node
   * @param targetId - ID of the target node
   * @throws Error if either node ID is invalid
   */
  connectNodes(sourceId: string, targetId: string): void {
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);

    if (!source || !target) {
      throw new Error("Invalid node IDs for connection");
    }

    source.connect(target);

    // Track connections
    const existing = this.connections.get(sourceId) || [];
    this.connections.set(sourceId, [...existing, targetId]);
  }

  /**
   * Disconnects two audio nodes
   * @param sourceId - ID of the source node
   * @param targetId - ID of the target node
   */
  disconnectNodes(sourceId: string, targetId: string): void {
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);

    if (source && target) {
      source.disconnect(target);

      // Update connection tracking
      const existing = this.connections.get(sourceId);
      if (existing) {
        this.connections.set(
          sourceId,
          existing.filter((id) => id !== targetId)
        );
      }
    }
  }

  /**
   * Removes a node: disconnects all connections, disposes, and removes from maps
   */
  removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    // Disconnect outgoing connections (this node as source)
    const targets = this.connections.get(id);
    if (targets) {
      for (const targetId of targets) {
        const target = this.nodes.get(targetId);
        if (target) {
          try {
            node.disconnect(target);
          } catch {
            // Already disconnected
          }
        }
      }
      this.connections.delete(id);
    }

    // Disconnect incoming connections (this node as target)
    for (const [sourceId, sourceTargets] of this.connections) {
      if (sourceTargets.includes(id)) {
        const source = this.nodes.get(sourceId);
        if (source) {
          try {
            source.disconnect(node);
          } catch {
            // Already disconnected
          }
        }
        this.connections.set(
          sourceId,
          sourceTargets.filter((t) => t !== id)
        );
      }
    }

    node.dispose();
    this.nodes.delete(id);
  }

  /**
   * Updates parameters on an audio node
   * @param id - ID of the node to update
   * @param params - Object containing parameter updates
   */
  updateNodeParams<T extends Record<string, unknown>>(
    id: string,
    params: T
  ): void {
    const node = this.nodes.get(id);
    if (!node) return;

    Object.entries(params).forEach(([key, value]) => {
      const nodeAny = node as unknown as Record<string, unknown>;

      if (key in nodeAny) {
        const param = nodeAny[key];

        // If it's a Tone.Param, set its value
        if (param instanceof Tone.Param) {
          param.value = value as number;
        }
        // Otherwise, set the property directly if writable
        else {
          const descriptor = Object.getOwnPropertyDescriptor(nodeAny, key);
          if (descriptor && descriptor.writable) {
            nodeAny[key] = value;
          }
        }
      }
    });
  }

  /**
   * Gets a node by its ID
   * @param id - ID of the node to retrieve
   * @returns The Tone.js node or undefined if not found
   */
  getNode(id: string): Tone.ToneAudioNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Gets all current audio connections
   * @returns Map of source to target node connections
   */
  getConnections(): Map<string, string[]> {
    return new Map(this.connections);
  }

  /**
   * Triggers a note on an oscillator node
   * @param id - ID of the oscillator node
   * @param midiNote - Optional MIDI note data
   */
  triggerNote(id: string, midiNote?: { note: number; velocity: number }): void {
    const node = this.nodes.get(id);
    if (!node) return;

    // Check if node is an oscillator type
    if (
      node instanceof Tone.Oscillator ||
      node instanceof Tone.OmniOscillator
    ) {
      // Stop any existing sound
      node.stop();

      // Set frequency if MIDI note provided
      if (midiNote) {
        const freq = Tone.Frequency(midiNote.note, "midi").toFrequency();
        node.frequency.value = freq;
      }

      // Start the oscillator with current parameters
      node.start();

      // Schedule stop after 1 second
      Tone.Transport.scheduleOnce(() => {
        node.stop();
      }, "+1");
    }
  }

  /**
   * Handles MIDI note events
   * @param id - ID of the target node
   * @param midiNote - MIDI note data
   */
  handleMIDINote(
    id: string,
    midiNote: { note: number; velocity: number }
  ): void {
    const node = this.nodes.get(id);
    if (!node) return;

    // Convert MIDI note to frequency
    const freq = Tone.Frequency(midiNote.note, "midi").toFrequency();

    if (
      node instanceof Tone.Oscillator ||
      node instanceof Tone.OmniOscillator
    ) {
      // Update frequency and trigger note
      node.frequency.value = freq;
      this.triggerNote(id, midiNote);
    } else if (node instanceof Tone.Filter) {
      // Update filter frequency
      node.frequency.value = freq;
    }
  }
}
