import { useState, useCallback, useEffect } from "react";

interface ParamKnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
  label?: string;
}

export function ParamKnob({
  value,
  min = 0,
  max = 1,
  onChange,
  size = 40,
  label,
}: ParamKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const knobSize = size;
  const radius = knobSize / 2;
  const angleRange = 270; // 270 degree rotation
  const startAngle = -135; // Starting at -135 degrees (left side)

  const normalizeValue = (val: number) => (val - min) / (max - min);
  const valueToAngle = (val: number) =>
    startAngle + normalizeValue(val) * angleRange;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const knobElement = e.currentTarget;
      const rect = knobElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = centerY - e.clientY; // Invert Y axis
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      let newAngle = angle - startAngle;
      newAngle = Math.max(0, Math.min(angleRange, newAngle));
      const newValue = min + (newAngle / angleRange) * (max - min);

      onChange(newValue);
    },
    [isDragging, min, max, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleMouseMove(e);
    },
    [handleMouseMove]
  );

  const currentAngle = valueToAngle(value);

  return (
    <div className="flex flex-col items-center gap-1 nodrag">
      <div
        style={{ width: knobSize, height: knobSize }}
        onMouseDown={handleMouseDown}
        className="knob-container cursor-pointer select-none"
      >
        <svg
          width={knobSize}
          height={knobSize}
          viewBox={`0 0 ${knobSize} ${knobSize}`}
        >
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="#e5e7eb"
            stroke="#d1d5db"
            strokeWidth={1}
          />

          {/* Value indicator */}
          <path
            d={`
              M ${radius} ${radius}
              L ${radius} 2
              A ${radius - 2} ${radius - 2} 0 ${currentAngle > 180 ? 1 : 0} 1
              ${radius + (radius - 2) * Math.cos((currentAngle * Math.PI) / 180)}
              ${radius - (radius - 2) * Math.sin((currentAngle * Math.PI) / 180)}
              Z
            `}
            fill="#4f46e5"
          />

          {/* Center dot */}
          <circle cx={radius} cy={radius} r={2} fill="#ffffff" />

          {/* Pointer */}
          <line
            x1={radius}
            y1={radius}
            x2={radius}
            y2={2}
            stroke="#ffffff"
            strokeWidth={1}
            transform={`rotate(${currentAngle} ${radius} ${radius})`}
          />
        </svg>
      </div>
      {label && <span className="text-xs text-gray-600">{label}</span>}
    </div>
  );
}
