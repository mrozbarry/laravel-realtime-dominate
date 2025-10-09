import * as vec from "./vec2d.js";
import * as random from "./random.js";
import * as arrays from './arrays.js'

export class State {
    value = null;

    constructor(initialState) {
        this.value = initialState;
        console.log('init', {...initialState})
    }

    #dig(value, keys, fallback) {
        if (keys.length === 0) {
            return value;
        }
        const [key, ...otherKeys] = keys;
        if (key in value) {
            return this.#dig(value[key], otherKeys, fallback)
        }
        return fallback;
    }

    get(path, fallback) {
        return this.#dig(this.value, path.split('.'), fallback);
    }

    update(fn) {
        this.value = fn(this.value);
    }
}

export const makeShip = (p, v = vec.make(0, 0), angle = 0) => ({
    p,
    pp: p,
    v,
    angle,
    thrust: false,
    break: false
});

export const init = () => new State({
    frameStep: Math.round(1000 / 30),
    now: null,
    timeBuffer: 0,

    ships: {
        me: makeShip(vec.make(0, 0)),
        ...arrays.iterate(100).reduce((ships, _) => {
            const id = Math.random().toString(36).slice(2);
            ships[id] = makeShip(vec.make(random.between(-10000, 10000), random.between(-10000, 10000)));
            return ships;
        }, {}),
    },

    particles: [],
});

export const setNow = (now) => (state) => {
    state.now = now;
    return state;
}

const particleTypes = {
    thrust: {
        a: vec.make(0, 0),
        b: vec.make(0, 0),
        // color: '#26619c',
        color: 'white',
        radius: 6,
        distortion: 2,
        ttl: 5000,
        totalTtl: 5000,
    }
}

export const createParticles = (a, b, type, count = 1) => {
    return Array.from({length: count}, () => ({
        ...particleTypes[type],
        a,
        b,
    }));
}

export const addParticles = (a, b, type, count = 1) => (state) => ({
    ...state,
    particles: state.particles.concat(createParticles(p, type, count))
});
