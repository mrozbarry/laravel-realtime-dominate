import * as vec from "./vec2d.js";

const simulateShip = (delta, ship) => {
    if (ship.inputs?.thrust) {
        const force = vec.fromAngleAndMagnitude(
            ship.angle,
            0.01 * delta,
        )
        ship.v = vec.fix(vec.add(ship.v, force));
    }
    if (ship.inputs?.break) {
        ship.v = vec.mult(ship.v, 0.9)
        if (vec.magnitude(ship.v) < 0.05) {
            ship.v = vec.make(0, 0);
        }
    }
    ship.pp = ship.p;
    ship.p = vec.fix(vec.add(ship.p, ship.v))
}

export const simulateShips = (delta, ships) => {
    for (let key in ships) {
        simulateShip(delta, ships[key]);
    }
    return ships;
}

export const simulateParticles = (delta, particles) => {
    return particles
        .map((particle) => {
            particle.ttl -= (delta);
            return particle;
        })
        .filter(particle => particle.ttl > 0)
}
