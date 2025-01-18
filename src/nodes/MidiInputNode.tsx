import { Handle, Position, type NodeProps } from "@xyflow/react";
import { type PositionLoggerNode } from "./types";
import { useMIDINote, useMIDIInputs } from "@react-midi/hooks";

export function MidiInputNode({ data }: NodeProps<PositionLoggerNode>) {
  const midiNote = useMIDINote();
  const devices = useMIDIInputs();

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default">
      {data.label && <div>{data.label}</div>}

      <div>
        <p>
          {" "}
          You're available devices{" "}
          {devices.inputs.map((device) => device.name).join(", ")}
        </p>

        {midiNote &&
          `Note ${midiNote.note} with velocity ${midiNote.velocity} received on channel ${midiNote.channel}`}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
