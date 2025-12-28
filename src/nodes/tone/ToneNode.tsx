import { NodeProps } from "@xyflow/react";
import { AppNode, OmniOscillatorNode, ToneNode } from "../types";
import { useEffect, useRef } from "react";
import * as Tone from "tone";

export const ToneNode = <T extends ToneNode<unknown>>({
  type,
  data,
}: NodeProps<T>) => {
  const compRef = useRef<(typeof Tone)[type]>();
  useEffect(() => {
    compRef.current = new Tone[type](data.config);
    return () => {};
  });
  return <div></div>;
};
