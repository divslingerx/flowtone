import { ToneComponentKey, ToneNode } from "./nodes/types";
import * as Tone from "tone";

const context = new AudioContext();
const nodes = new Map();

const osc = context.createOscillator();
osc.frequency.value = 220;
osc.type = "square";
osc.start();

const amp = context.createGain();
amp.gain.value = 0.5;

const out = context.destination;

nodes.set("a", osc);
nodes.set("b", amp);
nodes.set("c", out);

export function updateAudioNode(id: string, data) {
  const node = nodes.get(id);

  for (const [key, val] of Object.entries(data)) {
    if (node[key] instanceof AudioParam) {
      node[key].value = val;
    } else {
      node[key] = val;
    }
  }
}

export function removeAudioNode(id: string) {
  const node = nodes.get(id);

  node.disconnect();
  node.stop?.();

  nodes.delete(id);
}

export function connect(sourceId: string, targetId: string) {
  const source = nodes.get(sourceId);
  const target = nodes.get(targetId);

  source.connect(target);
}

export function isRunning() {
  return context.state === "running";
}

export function toggleAudio() {
  return isRunning() ? context.suspend() : context.resume();
}

export function createAudioNode<T extends ToneNode>(
  id: string,
  type: ToneComponentKey,
  data: T["data"]["config"]
) {
  switch (type) {
    case "OmniOscillator": {
      const node = new Tone.OmniOscillator(data as Tone.OmniOscillatorOptions);
      node.type = data.type;
      node.start();

      nodes.set(id, node);
      break;
    }

    case "amp": {
      const node = context.createGain();
      node.gain.value = data.gain;

      nodes.set(id, node);
      break;
    }
  }
}

const s = createAudioNode("a", "OmniOscillator", {});
