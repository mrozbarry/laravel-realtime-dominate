import './bootstrap';
import {ClearCanvas, createElement as c, Properties, render, Stateful} from 'declarativas'
import * as vec from './vec2d.js'
import * as physics from './physics.js'
import * as rand from './random.js'
import {addParticles, createParticles, init, setNow, State} from './state.js';
import {Camera, Circle, Grid, Particle, Ship, ShipUi, Text} from "./components.js";
import {LineTo, MoveTo, Path, Rect, Translate} from "declarativas/src/lib/index.js";

const draw = (state, context2d) => {

    const { me, ...otherShips } = state.ships;
    const pointsOfInterest = Object.values(otherShips)
        .filter(s => vec.distance(s.p, me.p) > 50)
        .map(s => s.p);

    render(c(Stateful, {}, [
        c(Properties, {
            textAlign: 'left',
            textBaseline: 'alphabetic',
            font: '16px sans-serif'
        }),

        c(ClearCanvas),

        c(Camera, state.ships.me.p, [

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
                ...state.ships.me.p,
                lines: 10,
                size: 2000,
            }),

            state.particles.map(particle => c(Particle, particle)),
            Object.entries(state.ships).map(([id, ship]) => c(Ship, ship)),
            c(ShipUi, {
                ship: state.ships.me,
                pointsOfInterest,
            })

        ]),

        c(Stateful, {}, [
            c(Properties, {
                fillStyle: 'black',
                globalAlpha: 0.8,
            }),
            c(Path, { fill: true }, [
                c(Rect, {
                    x: 0, y: 0, w: 200, h: 32,
                }),
            ]),
            c(Properties, {
                globalAlpha: 1.0,
                textBaseline: 'top',
            }),
            c(Text, { fill: 'white', x: 8, y: 8 }, `p: ${vec.toString(state.ships.me.p)}, v: ${vec.toString(state.ships.me.v)}`),
        ]),



    ]), context2d);
}

const createNewThrustParticles = (ships) => {
    return Object.values(ships)
        .filter(ship => ship.thrust)
        .reduce((memo, ship) => {
            return memo.concat(createParticles(ship.p, ship.pp, 'thrust', 1));
        }, []);
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

const getMouseCanvasPosition = (e) => {
    return vec.make(
        e.clientX - canvasRect.left,
        e.clientY - canvasRect.top,
    );
}

canvas.addEventListener('mousemove', (e) => {
    const mouse = getMouseCanvasPosition(e)
    const half = vec.make(canvas.width / 2, canvas.height / 2);
    const angle = vec.angleBetween(half, mouse)

    state.update(state => {
        state.ships.me.angle = angle;
        return state;
    })
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

    state.update(state => {
        state.ships.me[action] = toggle;
        return state;
    })
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

requestAnimationFrame(tick(state, canvas.getContext('2d')));
