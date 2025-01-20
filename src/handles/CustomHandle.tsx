import { Handle, HandleProps } from "@xyflow/react";

interface CustomHandleProps extends HandleProps {
  label: string;
}

export const CustomHandle = ({ id, position }: CustomHandleProps) => {
  return (
    <Handle
      id={id}
      type="source" // or "target" depending on your use case
      position={position}
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: "#ff69b4",
      }}
      color="#ff69b4"
    />
  );
};
