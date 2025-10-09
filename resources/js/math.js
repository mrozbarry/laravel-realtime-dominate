export const degToRad = (deg) => deg * Math.PI / 180;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const isBetween = (v, min, max, inclusive = true) => inclusive
    ? (v >= min && v <= max)
    : (v > min && v < max);
