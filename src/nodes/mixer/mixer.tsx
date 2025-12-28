import { nanoid } from "nanoid";

interface MixerProps {
  channels: number;
}

export const createMixer = ({ channels }: MixerProps) => ({
  id: nanoid(6),
  type: "Mixer",
  data: {
    channels: 12,
  },
});
