import { Handle, Position, type NodeProps } from "@xyflow/react";
import { type MidiInputNode } from "./types";
import { useMIDINote, useMIDIInputs } from "@react-midi/hooks";

export function MidiInputNode({ data }: NodeProps<MidiInputNode>) {
  const midiNote = useMIDINote();
  const devices = useMIDIInputs();

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default bg-white p-4 rounded-lg shadow-md border border-gray-200">
      {data.label && (
        <div className="text-lg font-semibold mb-2">{data.label}</div>
      )}

      <div className="space-y-2">
        <p className="text-gray-600">
          Available devices:{" "}
          <span className="font-medium text-gray-800">
            {devices.inputs.map((device) => device.name).join(", ")}
          </span>
        </p>

        {midiNote && (
          <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 text-justify">
            <div>
              {" "}
              Note: <span className="font-medium">{midiNote.note}</span>
            </div>
            <div>
              velocity <span className="font-medium">{midiNote.velocity}</span>
            </div>{" "}
            <div>
              channel <span className="font-medium">{midiNote.channel}</span>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
