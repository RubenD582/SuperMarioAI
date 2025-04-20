// physicsConstants.jsx
// — all of these are in the raw hexadecimal SMB units straight out of the guide
//   (blocks·pixels·subpixels·subsubpixels·subsubsubpixels), we will multiply
//   by our 1/60s fixed‑tick to turn them into subpixels/frame.

export const SCALE = 2;

export const MIN_WALK    = 4.453125;
export const ACC_WALK    = 113.59375;
export const ACC_RUN     = 200.390625;
export const DEC_REL     = 110.8125;
export const DEC_SKID    = 165.625;

export const MAX_WALK    = 150.75;
export const MAX_RUN     = 183.75;

// vertical / gravity
export const STOP_FALL   = 1575;
export const WALK_FALL   = 1800;
export const RUN_FALL    = 2025;

export const STOP_FALL_A = 450;
export const WALK_FALL_A = 421.875;
export const RUN_FALL_A  = 562.5;

export const MAX_FALL    = 270;
