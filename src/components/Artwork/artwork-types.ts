export interface ArtworkFrame {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Seconds since the artwork started. */
  time: number;
  /** Seconds since the previous frame, clamped. */
  dt: number;
  /** 0..1 dissolve presence, used for transitions between modes. */
  presence: number;
  /** 0..1 — higher during breaks, so the art gets livelier when the room does. */
  energy: number;
  /** Scale unit relative to a 1000px reference, keeps line weights consistent. */
  unit: number;
  /** Pixel radius of the center title plate — draw outside this from the start. */
  innerClearance: number;
}

export interface ArtworkMode {
  id: string;
  /** Called on mount and whenever the canvas size changes. */
  layout?: (width: number, height: number) => void;
  draw: (frame: ArtworkFrame) => void;
}
