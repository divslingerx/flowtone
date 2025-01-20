import { Donut } from "react-dial-knob";

export interface DonutTheme {
  donutColor?: string;
  bgrColor?: string;
  maxedBgrColor?: string;
  centerColor?: string;
  centerFocusedColor?: string;
  donutThickness?: number;
  value: number;
  label: string;
  onChange: (v: number) => void;
}

export function Knob({ value, onChange, label }: DonutTheme) {
  return (
    <span className="nodrag">
      <Donut
        diameter={80}
        min={0}
        max={100}
        step={1}
        value={value}
        style={{ textAlign: "center", display: "grid", placeItems: "center" }}
        theme={{
          donutColor: "blue",
          donutThickness: 13,
        }}
        onValueChange={onChange}
        ariaLabelledBy={"my-label"}
      >
        <label id={"my-label"}>{label}</label>
      </Donut>
    </span>
  );
}
