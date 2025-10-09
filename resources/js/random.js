export const near = (v, dist) => v + ((Math.random() * dist * 2) - dist);
export const element = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const between = (min, max) => (Math.random() * Math.abs(max - min)) + Math.min(max, min);
