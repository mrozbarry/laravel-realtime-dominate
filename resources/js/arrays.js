export const iterate = (times, fn = () => null) => Array.from({ length: times }, fn)
