import * as vec from "./vec2d.js";
import * as random from "./random.js";
import * as arrays from './arrays.js'

export class State {
    value = null;

    constructor(initialState) {
        this.value = initialState;
        console.log('init', {...initialState})
        this.effect = this.effect.bind(this);
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
        this.value = fn(this.value, this.effect);
        return this;
    }

    effect(fn) {
        requestIdleCallback(fn);
    }
}

export const makeShip = (p, v = vec.make(0, 0), angle = 0) => ({
    p,
    pp: p,
    v,
    angle,
    inputs: {
        thrust: false,
        break: false
    },
});

export const init = () => {
    return new State({
        frameStep: Math.round(1000 / 30),
        now: null,
        timeBuffer: 0,

        myShipId: null,

        ships: {},

        particles: [],
        thrustStreams: {},
    });
}

export const newShip = (message) => (state) => ({
    ...state,
    myShipId: message.you,
    ships: {
        ...state.ships,
        [message.you]: message.ship
    }
});

export const updateOtherShip = (message) => (state) => {
    state.ships[message.id] = message.ship;
    return state;
}

export const updateInputs = (partial, ws) => (state, fx) => {
    const ship = state.ships[state.myShipId];
    if (!ship) {
        return state;
    }

    state.ships[state.myShipId] = {
        ...ship,
        ...partial,
        inputs: {
            ...ship.inputs,
            ...(partial.inputs || {}),
        }
    };


    fx(() => {
        ws?.send(JSON.stringify({
            type: 'move',
            ...state.ships[state.myShipId],
        }))
    })

    return state;
};

export const setNow = (now) => (state) => {
    state.now = now;
    return state;
}

export const tickThrustStream = (id, delta) => (state) => {
    state.thrustStreams[id] = (state.thrustStreams[id] || [])
        .map(stream => {
            stream.ttl -= delta;
            return stream;
        })
        .filter(stream => stream.ttl < stream.totalTtl)

    return state;
}

export const prependThrustStream = (id, color = 'red', ttl = 5000) => (state) => {
    const ship = state.ships[id];
    state.thrustStreams[id] ||= [];
    if (state.thrustStreams[id].length === 0 || vec.distance(state.thrustStreams[0].p, ship.p) > 5) {
        state.thrustStreams[id].unshift({p: ship.p, color, ttl, totalTtl: ttl});
    }
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
