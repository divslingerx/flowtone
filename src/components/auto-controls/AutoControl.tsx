/**
 * AutoControl - Renders the appropriate control based on parameter metadata
 *
 * Automatically selects and renders the correct UI control (knob, slider, dropdown, toggle)
 * based on the parameter's metadata.
 */

import type { ParameterMetadata } from "~/lib/parameters/metadata";
import { KnobFrequency } from "~/components/knob/knob-frequency";
import {
  KnobTime,
  KnobNormalized,
  KnobQ,
  KnobDetune,
  KnobRatio,
  KnobGain,
} from "~/components/knob/knob-variants";

// ============================================================================
// AUTO CONTROL COMPONENT
// ============================================================================

export interface AutoControlProps {
  paramName: string;
  metadata: ParameterMetadata;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

/**
 * Renders the appropriate control type based on metadata
 */
export function AutoControl({
  paramName,
  metadata,
  value,
  onChange,
  className = "",
}: AutoControlProps) {
  const label = metadata.displayName || paramName;

  // Ensure value is a number
  const numericValue = typeof value === 'number' ? value : (metadata.defaultValue ?? 0);

  console.log(`[AutoControl] ${paramName}:`, { value, numericValue, metadata });

  switch (metadata.controlType) {
    case "knob-frequency":
      return (
        <div className={className}>
          <KnobFrequency
            label={label}
            value={numericValue || 440}
            onChange={onChange}
            theme="green"
          />
        </div>
      );

    case "knob-time":
      return (
        <div className={className}>
          <KnobTime
            label={label}
            value={numericValue || 0.1}
            onChange={onChange}
            min={metadata.min}
            max={metadata.max}
            theme="blue"
          />
        </div>
      );

    case "knob-normalized":
      return (
        <div className={className}>
          <KnobNormalized
            label={label}
            value={numericValue ?? 0.5}
            onChange={onChange}
            theme="purple"
          />
        </div>
      );

    case "knob-q":
      return (
        <div className={className}>
          <KnobQ
            label={label}
            value={numericValue || 1}
            onChange={onChange}
            theme="orange"
          />
        </div>
      );

    case "knob-detune":
      return (
        <div className={className}>
          <KnobDetune
            label={label}
            value={value ?? metadata.defaultValue ?? 0}
            onChange={onChange}
            theme="stone"
          />
        </div>
      );

    case "knob-ratio":
      return (
        <div className={className}>
          <KnobRatio
            label={label}
            value={value ?? metadata.defaultValue ?? 4}
            onChange={onChange}
            theme="red"
          />
        </div>
      );

    case "knob-gain":
      return (
        <div className={className}>
          <KnobGain
            label={label}
            value={value ?? metadata.defaultValue ?? 1}
            onChange={onChange}
            theme="green"
          />
        </div>
      );

    case "slider-db":
      return (
        <div className={`nodrag ${className}`}>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            {label} {metadata.unit && <span className="text-gray-500">({metadata.unit})</span>}
          </label>
          <input
            type="range"
            min={metadata.min ?? -60}
            max={metadata.max ?? 6}
            step={metadata.step ?? 0.1}
            value={value ?? metadata.defaultValue ?? 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="text-[10px] text-gray-600 dark:text-gray-400 text-center">
            {(value ?? metadata.defaultValue ?? 0).toFixed(1)} {metadata.unit}
          </div>
        </div>
      );

    case "dropdown":
      return (
        <div className={`nodrag ${className}`}>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <select
            value={value ?? metadata.defaultValue ?? metadata.options?.[0]}
            onChange={(e) => onChange(e.target.value)}
            className="
              w-full px-2 py-1 text-xs rounded
              bg-white/50 dark:bg-gray-800/50
              border border-gray-300/50 dark:border-gray-600/50
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            "
          >
            {metadata.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "toggle":
      return (
        <div className={`nodrag flex items-center gap-2 ${className}`}>
          <input
            type="checkbox"
            checked={value ?? metadata.defaultValue ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-blue-500"
          />
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        </div>
      );

    default:
      // Fallback: simple number input
      return (
        <div className={`nodrag ${className}`}>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <input
            type="number"
            value={value ?? metadata.defaultValue ?? 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={metadata.min}
            max={metadata.max}
            step={metadata.step ?? 0.01}
            className="
              w-full px-2 py-1 text-xs rounded
              bg-white/50 dark:bg-gray-800/50
              border border-gray-300/50 dark:border-gray-600/50
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
            "
          />
        </div>
      );
  }
}
