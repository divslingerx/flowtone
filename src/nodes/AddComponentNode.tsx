import { useRFStore } from "../store/store";
import { ToneComponentKey } from "./types";

const ComponentButton = ({
  type,
  label,
  onClick,
}: {
  type: ToneComponentKey;
  label?: string;
  onClick: (type: ToneComponentKey) => void;
}) => {
  const handleButtonClick = () => {
    onClick(type);
  };

  return (
    <button
      onClick={handleButtonClick}
      className="relative h-12 overflow-hidden rounded bg-neutral-950 px-5 py-2.5 text-white transition-all duration-300 hover:bg-neutral-800 hover:ring-2 hover:ring-neutral-800 hover:ring-offset-2"
    >
      <span className="relative">{label ?? type}</span>
    </button>
  );
};

export function AddComponentNode() {
  const { createNode } = useRFStore();
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default flex flex-col gap-4">
      <ComponentButton type="OmniOscillator" onClick={createNode} />
      <ComponentButton type="Filter" onClick={createNode} />
      <ComponentButton type="Panner" onClick={createNode} />
      <ComponentButton
        type="FrequencyEnvelope"
        onClick={createNode}
        label="Freq Env"
      />
    </div>
  );
}
