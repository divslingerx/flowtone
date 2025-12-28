import {
  ToneNodeKey,
  ExtractToneComponentDefaults,
  ToneNodeConstructor,
} from "~/nodes/types";
import { useEffect, useRef } from "react";
import * as Tone from "tone";

export const useToneNode = <T extends ToneNodeKey>(
  nodeType: T,
  config: Partial<ExtractToneComponentDefaults<(typeof Tone)[T]>>
) => {
  const nodeRef = useRef<InstanceType<(typeof Tone)[T]>>();

  useEffect(() => {
    if (!(nodeType in Tone)) {
      console.error(`Tone.js node type not found: ${nodeType}`);
      return;
    }

    const ToneClass = Tone[nodeType] as unknown as ToneNodeConstructor<T>;

    try {
      nodeRef.current = new ToneClass(config);
    } catch (error) {
      console.error(`Error creating ${nodeType}:`, error);
      return;
    }

    return () => {
      if (nodeRef.current) {
        nodeRef.current.dispose();
        nodeRef.current = undefined;
      }
    };
  }, [nodeType, config]);

  return nodeRef.current as InstanceType<(typeof Tone)[T]> | undefined;
};
