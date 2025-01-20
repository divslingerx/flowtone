import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useContext, useState } from "react";
import { AudioEngineContext } from "~/store/audioContext";
import { useMIDIOutput } from "@react-midi/hooks";
import type { Node } from "./types";

const OCTAVE_RANGE = 3; // Default octave range
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface MidiPianoNodeData extends Record<string, unknown> {
  label?: string;
  connections?: Array<{ target: string }>;
  [key: string]: unknown;
}

interface MidiPianoNodeType extends Node<MidiPianoNodeData> {
  type: "MidiPiano";
}

type MidiPianoNodeProps = NodeProps<MidiPianoNodeType>;

export function MidiPianoNode({ data }: MidiPianoNodeProps) {
  const [octave, setOctave] = useState(3); // Middle C is C4
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const audioEngine = useContext(AudioEngineContext);
  if (!audioEngine) {
    throw new Error("AudioEngineContext is not available");
  }
  const { noteOn, noteOff } = useMIDIOutput();

  const handleNoteOn = (midiNumber: number) => {
    setActiveNotes((prev) => new Set(prev).add(midiNumber));
    if (audioEngine) {
      const connectedNodes = data.connections?.map((edge) => edge.target) || [];
      connectedNodes.forEach((nodeId) => {
        audioEngine.handleMIDINote(nodeId, {
          note: midiNumber,
          velocity: 127, // Max velocity
        });
      });
    }
    noteOn?.(midiNumber, { velocity: 127, channel: 1 });
  };

  const handleNoteOff = (midiNumber: number) => {
    setActiveNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(midiNumber);
      return newSet;
    });
    noteOff?.(midiNumber, { channel: 1 });
  };

  /**
   * Converts note name and octave to MIDI note number
   * @param note - Note name (e.g. "C#")
   * @param octave - Octave number
   * @returns MIDI note number
   */
  const getMidiNumber = (note: string, octave: number) => {
    const noteIndex = NOTES.indexOf(note.replace(/\d+/g, ""));
    return 12 + octave * 12 + noteIndex;
  };

  const renderPianoKeys = () => {
    const keys: JSX.Element[] = [];
    const startOctave = octave - Math.floor(OCTAVE_RANGE / 2);
    const endOctave = startOctave + OCTAVE_RANGE;

    for (let oct = startOctave; oct < endOctave; oct++) {
      NOTES.forEach((note) => {
        const midiNumber = getMidiNumber(note, oct);
        const isBlackKey = note.includes("#");
        const isActive = activeNotes.has(midiNumber);
        const isHovered = hoveredNote === `${note}${oct}`;

        keys.push(
          <div
            key={`${note}${oct}`}
            className={`relative ${
              isBlackKey
                ? "bg-black text-white z-10 h-2/3 w-8 -ml-4 -mr-4   border border-gray-800"
                : "bg-white text-black border h-full w-10"
            } ${
              isActive
                ? "bg-blue-500"
                : isHovered
                  ? "bg-gray-300"
                  : "hover:bg-gray-200"
            }`}
            onMouseEnter={() => {
              console.log(`Hovering ${note}${oct}`, { isBlackKey });
              setHoveredNote(`${note}${oct}`);
            }}
            onMouseLeave={() => {
              console.log(`Leaving ${note}${oct}`);
              setHoveredNote(null);
            }}
            onMouseDown={() => handleNoteOn(midiNumber)}
            onMouseUp={() => handleNoteOff(midiNumber)}
          >
            {(isHovered || isActive) && (
              <div
                className={`absolute ${
                  isBlackKey ? "-top-4" : "-top-6"
                } left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                  isBlackKey ? "text-white" : "text-black"
                }`}
              >
                {note}
                {oct}
              </div>
            )}
          </div>
        );
      });
    }

    return (
      <div
        className="grid grid-flow-col relative mt-2 gap-0"
        style={{ height: "100px", width: "600px" }}
      >
        {keys}
      </div>
    );
  };

  return (
    <div className="react-flow__node-default bg-white p-4 rounded-lg shadow-md border border-gray-200 w-[875px]">
      {data.label && (
        <div className="text-lg font-semibold mb-2">{data.label}</div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setOctave((prev) => Math.max(0, prev - 1))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm">Octave: {octave}</span>
        <button
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setOctave((prev) => Math.min(8, prev + 1))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {renderPianoKeys()}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
