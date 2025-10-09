import * as vec from "./vec2d.js";
import * as rand from "./random.js";
import {isBetween} from "./math.js";
import * as arrays from "./arrays.js";
import {
    Arc,
    createElement as c,
    createMutator,
    LineTo,
    MoveTo,
    Path,
    Properties,
    render,
    Rotate,
    Stateful,
    Translate,
} from 'declarativas'

export const Circle = ({radius, x = 0, y = 0}) => c(Arc, {
    x,
    y,
    radius,
    startAngle: 0,
    endAngle: Math.PI * 2,
});

export const Text = (props, text) => c(Stateful, {}, [
    props.fill && c(Properties, {fillStyle: props.fill}),
    createMutator(ctx => ctx.fillText(text, props.x || 0, props.y || 0, props.maxWidth))
]);

const InternalShip = ({p, angle, color, alpha}) => c(Stateful, {}, [
    c(Properties, {
        lineCap: 'round',
        lineJoin: 'round',
        lineWidth: 3,
        strokeStyle: color || 'white',
        globalAlpha: alpha >= 0 ? alpha : 1.0,
        shadowBlur: rand.near(10, 3),
        shadowColor: 'white',
    }),
    c(Translate, p),
    c(Rotate, {angle}),
    c(Path, {isClosed: true, stroke: true}, [
        c(MoveTo, {x: 20, y: 0}),
        c(LineTo, {x: -10, y: 10}),
        c(LineTo, {x: -5, y: 0}),
        c(LineTo, {x: -10, y: -10}),
    ])
]);


export const Ship = ({p, v, angle, color, dist = 2}) => {
    const distortionAmount = dist + (vec.magnitude(v))
    return [
        // c(InternalShip, {p: vec.distort(p, distortionAmount), angle, color, alpha: 0.2}),
        // c(InternalShip, {p: vec.distort(p, distortionAmount), angle, color, alpha: 0.2}),
        c(InternalShip, {p, angle, color, alpha: rand.near(0.9, 0.1)}),
    ]
}

const InternalParticle = ({a, b, color, thickness, alpha}) => c(Stateful, {}, [
    c(Properties, {
        lineCap: 'round',
        // lineJoin: 'round',
        lineWidth: 2,
        strokeStyle: color,
        globalAlpha: alpha,
        shadowBlur: rand.near(30 + thickness, 6),
        shadowColor: 'red',
    }),
    c(Path, {isClosed: false, stroke: true}, [
        c(MoveTo, a),
        c(LineTo, b),
    ])
]);

export const Particle = ({a, b, color, radius, distortion, ttl, totalTtl}) => {
    const maxAlpha = (ttl / totalTtl);
    const r = radius * maxAlpha
    return c(Stateful, {}, [
        c(InternalParticle, {a, b, thickness: r, color, alpha: 0.7 * maxAlpha}),
    ]);
}

export const Camera = ({x, y}, children) => c(Stateful, {}, [
    createMutator((context) => {
        render([
            c(Translate, {
                x: -x + (context.canvas.width / 2),
                y: -y + (context.canvas.height / 2),
            }),
            children,
        ], context)
    })
]);

export const ShipUi = ({ship, pointsOfInterest}) => [
    ...pointsOfInterest.map((poi) => {
        const angle = vec.angleBetween(ship.p, poi);
        const distance = vec.distance(ship.p, poi);
        const minLength = 10;
        const buffer = 30;
        let length = minLength;
        let lineWidth = 3;
        let fillStyle = '#2323FF';
        if (isBetween(distance, 500, 800)) {
            const total = 300;
            const value = distance - 500;
            length = distance * (1 - (value / total));
            lineWidth = 3;
        } else if (distance < 500) {
            length = distance - (buffer * 2);
            lineWidth = 2;
            fillStyle = '#2323FF';
        } else if (distance > 2000) {
            return [];
        }
        const a = vec.add(ship.p, vec.fromAngleAndMagnitude(angle, buffer));
        const b = vec.add(ship.p, vec.fromAngleAndMagnitude(angle, buffer + Math.max(minLength, length)));

        return c(Stateful, {}, [
            c(Properties, {
                lineWidth,
                strokeStyle: 'white',
                fillStyle,
                globalAlpha: 0.3,
                shadowBlur: rand.near(30, 20),
                shadowColor: '#2323FF',
            }),

            c(Path, {stroke: true, fill: true, isClosed: false}, [
                c(MoveTo, a),
                c(LineTo, b),
            ])
        ]);
    }),
];


export const Grid = ({x, y, lines, size}) => {
    const left = (size / -2);
    const top = (size / -2);


    let count = 50;
    const gap = size / count;

    return c(Stateful, {}, [
        c(Properties, {
            lineCap: 'round',
            lineJoin: 'round',
            lineWidth: 1,
            strokeStyle: 'white',
            globalAlpha: 0.2,
        }),
        c(Translate, {x: Math.floor(x / gap) * gap, y: Math.floor(y / gap) * gap}),
        c(Path, {isClosed: false, stroke: true}, [
            ...arrays.iterate(count, (_, index) => [
                c(MoveTo, {x: left + (index * gap), y: top}),
                c(LineTo, {x: left + (index * gap), y: top + size})
            ]),

            ...arrays.iterate(count, (_, index) => [
                c(MoveTo, {x: left, y: top + (index * gap)}),
                c(LineTo, {x: left + size, y: top + (index * gap)})
            ])
        ])
    ])
}
