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

    Render() {

    }
}


class Player {
    constructor() {
        this.pos = new vec2(0, 0);
        this.dir = new vec2(0, 1);
        this.speed = 0;
        this.rotationSpeed = 0;
    }

    Render() {
        const x = 0.015;
        const y = 0.01;

        let vertices = Rect(x, y);

        RotateFromVector(vertices, this.dir);

        Move(vertices, this.pos);

        return vertices;

        // for (let i = 0; i < 6; i++) {
        //     let cos = this.dir.x;
        //     let sin = this.dir.y;

        //     let v = buffer[buffer.length - 6 + i];
        //     console.log(v);
        //     v = new vec2(v.x, v.y);
        //     v = v.mult(new matrix2x2(
        //         new vec2(cos, sin),
        //         new vec2(-sin, cos)
        //     ))

        //     buffer[buffer.length - 6 + i].x = this.pos.x + v.x;
        //     buffer[buffer.length - 6 + i].y = this.pos.y + v.y;
        // }
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