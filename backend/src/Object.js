const { vec2, matrix2x2 } = require("./Math");

function Rect(x, y) {
    let vert = [];

    vert.push(
        {
            x: - x,
            y: - y
        },
        {
            x: - x,
            y: + y
        },
        {
            x: + x,
            y: - y
        },
        {
            x: - x,
            y: + y
        },
        {
            x: + x,
            y: - y
        },
        {
            x: + x,
            y: + y
        }
    );

    return vert;
}

function RotateFromVector(vertices, dir, center) {
    if(center === undefined)
    {
        center = new vec2(0, 0);
    }
    else
    {
        center = new vec2(center.x, center.y);
    }

    let matrix = new matrix2x2(
        new vec2(dir.x, dir.y),
        new vec2(-dir.y, dir.x)
    );

    for (let vertex of vertices) {
        let v = new vec2(vertex.x, vertex.y);
        
        v = v.sub(center);
        v = v.mult(matrix);
        v = v.add(center);

        vertex.x = v.x;
        vertex.y = v.y;
    }
}

function Rotate(vertices, angle) {
    for (let v of vertices) {

    }
}

function Move(vertices, offset)
{
    for(let v of vertices)
    {
        v.x += offset.x;
        v.y += offset.y;
    }
}


class Object {
    constructor() {
        this.pos = new vec2(0, 0);
        this.dir = new vec2(0, 1);
        this.speed = 0;
        this.rotationSpeed = 0;
    }
}


class Player extends Object {
    constructor() {
        super();

        this.aim = new vec2(0, 1);
        this.turretDir = new vec2(0, 1);
        this.turretRotationSpeed = 0;
    }

    Render() {
        let hull = Rect(0.015, 0.01);
        let turret = Rect(0.02, 0.003);
        Move(turret, new vec2(0.01, 0));

        RotateFromVector(hull, this.dir);
        RotateFromVector(turret, this.turretDir);


        let vertices = [...hull, ...turret];
        Move(vertices, this.pos);

        return vertices;
    }
}

class Bullet extends Object {
    Render(buffer) {
        const x = 0.01;
        const y = 0.005;

        let vertices = Rect(x, y);

        RotateFromVector(vertices, this.dir);

        Move(vertices, this.pos);

        buffer.push(...vertices);
        return vertices;
    }
}

module.exports = { Object, Bullet, Player }