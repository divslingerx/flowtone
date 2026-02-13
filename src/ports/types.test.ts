import { describe, it, expect } from "vitest";
import {
  createSinglePortConfig,
  createSourcePortConfig,
  createDestinationPortConfig,
  createMergePortConfig,
  createSplitPortConfig,
  createHandleId,
  parseHandleId,
  getPortByIndex,
  isValidPortConnection,
  type Port,
  type PortConfig,
} from "./types";
import { Position } from "@xyflow/react";

describe("Port Factory Functions", () => {
  describe("createSinglePortConfig", () => {
    it("creates config with one input and one output", () => {
      const config = createSinglePortConfig("audio");
      expect(config.inputs).toHaveLength(1);
      expect(config.outputs).toHaveLength(1);
    });

    it("uses audio signal type by default", () => {
      const config = createSinglePortConfig();
      expect(config.inputs[0]?.signalType).toBe("audio");
      expect(config.outputs[0]?.signalType).toBe("audio");
    });

    it("respects custom signal type", () => {
      const config = createSinglePortConfig("control");
      expect(config.inputs[0]?.signalType).toBe("control");
      expect(config.outputs[0]?.signalType).toBe("control");
    });
  });

  describe("createSourcePortConfig", () => {
    it("creates config with no inputs and one output", () => {
      const config = createSourcePortConfig("audio");
      expect(config.inputs).toHaveLength(0);
      expect(config.outputs).toHaveLength(1);
    });
  });

  describe("createDestinationPortConfig", () => {
    it("creates config with one input and no outputs", () => {
      const config = createDestinationPortConfig("audio");
      expect(config.inputs).toHaveLength(1);
      expect(config.outputs).toHaveLength(0);
    });
  });

  describe("createMergePortConfig", () => {
    it("creates config with N inputs and one stereo output", () => {
      const config = createMergePortConfig(4);
      expect(config.inputs).toHaveLength(4);
      expect(config.outputs).toHaveLength(1);
      expect(config.outputs[0]?.channelCount).toBe(2);
    });

    it("defaults to 2 channels", () => {
      const config = createMergePortConfig();
      expect(config.inputs).toHaveLength(2);
    });

    it("assigns channel indices correctly", () => {
      const config = createMergePortConfig(3);
      expect(config.inputs[0]?.channelIndex).toBe(0);
      expect(config.inputs[1]?.channelIndex).toBe(1);
      expect(config.inputs[2]?.channelIndex).toBe(2);
    });
  });

  describe("createSplitPortConfig", () => {
    it("creates config with one stereo input and N outputs", () => {
      const config = createSplitPortConfig(4);
      expect(config.inputs).toHaveLength(1);
      expect(config.inputs[0]?.channelCount).toBe(2);
      expect(config.outputs).toHaveLength(4);
    });
  });
});

describe("Handle ID Functions", () => {
  describe("createHandleId", () => {
    it("creates valid handle ID format", () => {
      const id = createHandleId("node-123", "out", 0);
      expect(id).toBe("node-123:out:0");
    });

    it("handles input direction", () => {
      const id = createHandleId("abc", "in", 2);
      expect(id).toBe("abc:in:2");
    });
  });

  describe("parseHandleId", () => {
    it("parses valid handle ID", () => {
      const parsed = parseHandleId("node-123:out:0");
      expect(parsed).toEqual({
        nodeId: "node-123",
        direction: "out",
        portIndex: 0,
      });
    });

    it("parses input handle ID", () => {
      const parsed = parseHandleId("abc:in:2");
      expect(parsed).toEqual({
        nodeId: "abc",
        direction: "in",
        portIndex: 2,
      });
    });

    it("throws on invalid format", () => {
      expect(() => parseHandleId("invalid")).toThrow("Invalid handle ID format");
    });

    it("throws on invalid direction", () => {
      expect(() => parseHandleId("node:invalid:0")).toThrow("Invalid direction");
    });
  });
});

describe("getPortByIndex", () => {
  const config: PortConfig = {
    inputs: [
      { id: "in-0", type: "input", signalType: "audio", position: Position.Top, channelIndex: 0 },
      { id: "in-1", type: "input", signalType: "control", position: Position.Top, channelIndex: 1 },
    ],
    outputs: [
      { id: "out-0", type: "output", signalType: "audio", position: Position.Bottom, channelIndex: 0 },
    ],
  };

  it("returns input port by index", () => {
    const port = getPortByIndex(config, "in", 0);
    expect(port?.id).toBe("in-0");
  });

  it("returns output port by index", () => {
    const port = getPortByIndex(config, "out", 0);
    expect(port?.id).toBe("out-0");
  });

  it("returns undefined for out of range index", () => {
    const port = getPortByIndex(config, "in", 10);
    expect(port).toBeUndefined();
  });
});

describe("isValidPortConnection", () => {
  const createPort = (type: "input" | "output", signalType: "audio" | "control" | "midi" | "trigger", channelCount: 1 | 2 = 1): Port => ({
    id: "test",
    type,
    signalType,
    position: Position.Top,
    channelIndex: 0,
    channelCount,
  });

  describe("direction validation", () => {
    it("rejects input to input", () => {
      const source = createPort("input", "audio");
      const target = createPort("input", "audio");
      const result = isValidPortConnection(source, target);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("output");
    });

    it("rejects output to output", () => {
      const source = createPort("output", "audio");
      const target = createPort("output", "audio");
      const result = isValidPortConnection(source, target);
      expect(result.valid).toBe(false);
    });

    it("accepts output to input", () => {
      const source = createPort("output", "audio");
      const target = createPort("input", "audio");
      const result = isValidPortConnection(source, target);
      expect(result.valid).toBe(true);
    });
  });

  describe("signal type validation", () => {
    it("accepts same signal types", () => {
      const source = createPort("output", "audio");
      const target = createPort("input", "audio");
      expect(isValidPortConnection(source, target).valid).toBe(true);
    });

    it("accepts audio to control (modulation)", () => {
      const source = createPort("output", "audio");
      const target = createPort("input", "control");
      expect(isValidPortConnection(source, target).valid).toBe(true);
    });

    it("rejects midi to audio", () => {
      const source = createPort("output", "midi");
      const target = createPort("input", "audio");
      const result = isValidPortConnection(source, target);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Signal type mismatch");
    });

    it("rejects control to midi", () => {
      const source = createPort("output", "control");
      const target = createPort("input", "midi");
      expect(isValidPortConnection(source, target).valid).toBe(false);
    });
  });

  describe("channel count validation", () => {
    it("accepts mono to mono", () => {
      const source = createPort("output", "audio", 1);
      const target = createPort("input", "audio", 1);
      expect(isValidPortConnection(source, target).valid).toBe(true);
    });

    it("accepts mono to stereo (upmix allowed)", () => {
      const source = createPort("output", "audio", 1);
      const target = createPort("input", "audio", 2);
      expect(isValidPortConnection(source, target).valid).toBe(true);
    });

    it("rejects stereo to mono (downmix not allowed)", () => {
      const source = createPort("output", "audio", 2);
      const target = createPort("input", "audio", 1);
      const result = isValidPortConnection(source, target);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Channel mismatch");
    });
  });
});
