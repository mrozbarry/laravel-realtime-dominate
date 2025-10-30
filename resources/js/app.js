import './bootstrap';
import {ClearCanvas, createElement as c, Properties, render, Stateful} from 'declarativas'
import * as vec from './vec2d.js'
import * as physics from './physics.js'
import * as rand from './random.js'
import * as throttler from './throttle.js'
import {
    addParticles,
    createParticles,
    init, newShip,
    prependThrustStream,
    setNow,
    State,
    tickThrustStream,
    updateInputs, updateOtherShip
} from './state.js';
import {Camera, Circle, Grid, Particle, Ship, ShipUi, Text} from "./components.js";
import {FillRect, LineTo, MoveTo, Path, Rect, Translate} from "declarativas/src/lib/index.js";

const draw = (state, context2d) => {

    const { [state.myShipId]: me, ...otherShips } = state.ships;
    const pointsOfInterest = me ? Object.values(otherShips)
        .filter(s => vec.distance(s.p, me.p) > 50)
        .map(s => s.p)
    : [];

    const myPosition = me ? me.p : vec.make(0,0);

    render(c(Stateful, {}, [
        c(Properties, {
            textAlign: 'left',
            textBaseline: 'alphabetic',
            font: '16px sans-serif',
            fillStyle: 'black',
        }),

        c(FillRect, {
            x: 0,
            y: 0,
            w: context2d.canvas.width,
            h: context2d.canvas.height,
        }),
        // c(ClearCanvas),

        c(Camera, myPosition, [

            c(Stateful, {}, [
                c(Properties, {
                    strokeStyle: '#faed27',
                    fillStyle: '#faed27',
                    shadowBlur: rand.near(20, 5),
                    shadowColor: '#faed27',
                    lineWidth: 3
                }),
                c(Path, { stroke: true, isClosed: false }, [
                    c(MoveTo, { x: -100, y: -100 }),
                    c(LineTo, { x: -70, y: -100 }),
                ]),
            ]),


            c(Stateful, {}, [
                c(Properties, { fillStyle: 'orange', strokeStyle: 'white' }),
                c(Path, { stroke: true, fill: true }, [
                    c(Circle, {
                        x: 1000,
                        y: 1000,
                        radius: 1000,
                    })
                ])
            ]),

            c(Grid, {
                ...myPosition,
                lines: 10,
                size: 2000,
            }),

            state.particles.map(particle => c(Particle, particle)),
            Object.entries(state.ships).map(([id, ship]) => c(Ship, ship)),
            me && c(ShipUi, {
                ship: me,
                pointsOfInterest,
            })

        ]),

        me && c(Stateful, {}, [
            c(Properties, {
                fillStyle: 'black',
                globalAlpha: 0.8,
            }),
            c(FillRect, {
                x: 0, y: 0, w: 200, h: 32,

            }),
            // c(Path, { fill: true }, [
            //     c(Rect, {
            //         x: 0, y: 0, w: 200, h: 32,
            //     }),
            // ]),
            c(Properties, {
                globalAlpha: 1.0,
                textBaseline: 'top',
            }),
            c(Text, {
                fill: 'white', x: 8, y: 8,
            }, `p: ${vec.toString(me.p)}, v: ${vec.toString(me.v)}`),
        ]),



    ]), context2d);
}

const createNewThrustParticles = (ships) => {
    return Object.values(ships)
        .filter(ship => ship.inputs?.thrust)
        .reduce((memo, ship) => {
            return memo.concat(createParticles(ship.p, ship.pp, 'thrust', 1));
        }, []);
}

const updateThrustStreams = (delta, ships, thrustStreams) => {
    Object.entries(thrustStreams)
        .filter(([id, stream]) => ships[id].inputs?.thrust)
        .reduce((updates, [id, stream]) => {
            return updates.concat([
                tickThrustStream(id, delta),
                prependThrustStream(id),
            ])
        }, [])
}

/**
 *
 * @param {State} state
 * @param {CanvasRenderingContext2D} context2d
 * @returns {(function(*): void)|*}
 */
const tick = (state, context2d) => now => {
    const delta = now - state.get('now', now);
    state.update(setNow(now))

    if (delta > 0) {

        const frameStep = state.get('frameStep');
        let timeBuffer = state.get('timeBuffer');
        let ships = state.get('ships', {});
        let particles = state.get('particles', []);
        timeBuffer += delta;
        while (timeBuffer > frameStep) {
            timeBuffer -= frameStep;

            ships = physics.simulateShips(frameStep, ships);
            particles = physics.simulateParticles(
                frameStep,
                particles.concat(
                    createNewThrustParticles(ships)
                ),
            );
        }

        state.update(state => ({...state, timeBuffer, ships, particles}));

    }

    draw(state.value, context2d);

    requestAnimationFrame(tick(state, context2d));
}

const canvas = document.querySelector('canvas');
let canvasRect = canvas.getBoundingClientRect();

window.addEventListener('resize', () => {
    canvasRect = canvas.getBoundingClientRect();
})

const state = init();

const websocket = new WebSocket('ws://localhost:8081')
websocket.addEventListener('open', () => {
    console.info('connected');
})


const getMouseCanvasPosition = (e) => {
    return vec.make(
        e.clientX - canvasRect.left,
        e.clientY - canvasRect.top,
    );
}


const angleWebsocketThrottler = throttler.make(250);

canvas.addEventListener('mousemove', (e) => {
    const mouse = getMouseCanvasPosition(e)
    const half = vec.make(canvas.width / 2, canvas.height / 2);
    const angle = vec.angleBetween(half, mouse);

    state.update(updateInputs({
        angle,
    }, angleWebsocketThrottler(websocket)));
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})

const bindings = {
    mouse: {
        primary: null,
        middle: null,
        secondary: 'thrust',
    },
    keyboard: {
        Space: 'break',
    }
}

const makeEventListener = (type, eventKeyDecoder, toggle) => (e) => {
    const eventKey = eventKeyDecoder(e);
    const action = bindings[type][eventKey];
    if (!action) {
        return;
    }

    state.update(updateInputs({
        inputs: { [action]: toggle },
    }, websocket));
}

const buttonNames = ['primary', 'middle', 'secondary'];
canvas.addEventListener(
    'mousedown',
    makeEventListener('mouse', (e) => buttonNames[e.button], true),
);
canvas.addEventListener(
    'mouseup',
    makeEventListener('mouse', (e) => buttonNames[e.button], false),
);
window.addEventListener(
    'keydown',
    makeEventListener('keyboard', (e) => e.code, true),

);
window.addEventListener(
    'keyup',
    makeEventListener('keyboard', (e) => e.code, false),
);

const messageHandlers = {
    connected: (message) => {
        state.update(newShip(message));
    },
    ship: (message) => {
        state.update(updateOtherShip(message))
    }
}

websocket.addEventListener('message', (e) => {
    console.info('>>', e.data);
    const json = JSON.parse(e.data);
    const handler = messageHandlers[json.type];
    if (!handler) {
        console.info('unhandled message', json);
        return;
    }
    handler(json);
})
websocket.addEventListener('close', () => {
    console.info('disconnected');
})

requestAnimationFrame(tick(state, canvas.getContext('2d', {
    desynchronized: true,
    willReadFrequently: false,
})));
