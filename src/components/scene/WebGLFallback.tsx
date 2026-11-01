import { Component, type ReactNode } from "react";

/** One-time check that the browser can actually create a WebGL context. */
export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface CanvasBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

/** Catches WebGL context-creation failures thrown while the Canvas mounts. */
export class CanvasBoundary extends Component<CanvasBoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
