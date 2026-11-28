import { screenSize } from "@/lib/landing-laptop-screen";

export const BODY_WIDTH = 31.3;
export const BODY_DEPTH = 22.1;
export const BASE_HEIGHT = 1.2;
export const LID_HEIGHT = 21.5;
export const LID_THICKNESS = 0.42;
export const BEVEL = 0.12;
export const HINGE_Z = -BODY_DEPTH / 2 + 0.55;
export const HINGE_Y = BASE_HEIGHT + 0.26;
export const DISPLAY_WIDTH = 30;
export const DISPLAY_HEIGHT =
  DISPLAY_WIDTH * (screenSize.height / screenSize.width);
export const DISPLAY_BOTTOM = 1.6;
export const DISPLAY_CENTER_Y = DISPLAY_BOTTOM + DISPLAY_HEIGHT / 2;
export const FIELD_OF_VIEW = 28;
