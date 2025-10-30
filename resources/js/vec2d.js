import * as rand from './random.js';

export const make = (x, y) => ({x, y});

export const mult = (vec, amount) => make(vec.x * amount, vec.y * amount);
export const div = (vec, amount) => make(vec.x / amount, vec.y / amount);

export const add = (a, b) => make(a.x + b.x, a.y + b.y);

export const delta = (a, b) => make(
    b.x - a.x,
    b.y - a.y,
);

export const magnitude = (vec) => Math.sqrt((vec.x * vec.x) + (vec.y * vec.y));

export const clampMagnitude = (vec, max) => {
    let v = vec;
    while (magnitude(v) > max) {
        v = mult(vec, 0.9);
    }
    return v;
}

export const angleBetween = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

export const distance = (a, b) => magnitude(delta(a, b));

export const distort = (vec, amount) => make(
    rand.near(vec.x, amount),
    rand.near(vec.y, amount),
)

export const fromAngleAndMagnitude = (radians, magnitude = 1) => make(
    Math.cos(radians) * magnitude,
    Math.sin(radians) * magnitude,
);

export const toString = (vec) => `${vec.x.toFixed(1)},${vec.y.toFixed(1)}`;

export const fix = (vec, decimalPlaces = 3) => make(
    Number(vec.x.toFixed(decimalPlaces)),
    Number(vec.y.toFixed(decimalPlaces)),
)
