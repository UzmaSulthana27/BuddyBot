// src/components/auth/RobotCanvas.jsx
import React, { forwardRef } from "react";

/**
 * RobotCanvas
 * Simple wrapper that provides a ref container for the Robot3D component.
 * You can pass `className` or style to control size.
 */
const RobotCanvas = forwardRef(({ className = "w-full h-full", style = {} }, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    />
  );
});

export default RobotCanvas;
