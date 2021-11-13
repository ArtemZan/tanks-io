const { vec2, matrix2x2 } = require("../Math/Math");
const rooms = require("../Rooms");

function Rect(x, y, color) {
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
    if (center === undefined) {
        center = new vec2(0, 0);
    }
    else {
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

function Move(vertices, offset) {
    for (let v of vertices) {
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
        return [];
    }
}

class Player extends Object {
    constructor(room, id) {
        super();

        this.hp = 10;

        this.rotationSpeed = 0;

        this.aim = new vec2(0, 1);
        this.turretDir = new vec2(0, 1);
        this.turretRotationSpeed = 0;

        this.room = room;
        this.id = id;
    }

    StartMoving(ahead) {
        this.speed = (ahead ? 1 : -1) * 0.0002;
    }

    StopMoving() {
        this.speed = 0;
    }

    StartRotating(clockwise) {
        this.rotationSpeed = (clockwise ? -1 : 1) * 0.002;
    }

    StopRotating() {
        this.rotationSpeed = 0;
    }

    CalculateTurretRotationSpeed() {
        const rotSpeedK = 0.003;
        let rotSpeed = 0;
    
        let angleDif = this.aim.sub(this.turretDir).magnitude();
    
        let dir = 1;
        if (this.aim.cross(this.turretDir).z > 0) {
            dir = -1;
        }
    
        if (angleDif < 5e-2) {
            if (angleDif > 1e-3) {
                rotSpeed = angleDif * dir * rotSpeedK;
            }
        }
        else {
            rotSpeed = dir * rotSpeedK;
        }
    
        return rotSpeed;
    }

    StartRotatingTurret(dir) {
        this.aim = new vec2(dir.x, dir.y).normalize();
    }

    StopRotatingTurret() {
        this.turretRotationSpeed = 0;
    }

    Shoot() {
        let bullet = new Bullet(this.id);

        bullet.dir = this.turretDir;
        bullet.pos = this.pos;
        bullet.speed = 0.001;

        rooms[this.room].scene.bullets.push(bullet);

        //console.log(bullet);
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
    constructor(player_id) {
        super();

        this.playerId = player_id;
    }


    Render() {
        const x = 0.01;
        const y = 0.005;

        let vertices = Rect(x, y);

        RotateFromVector(vertices, this.dir);

        Move(vertices, this.pos);

        return vertices;
    }
}

module.exports = { Object, Bullet, Player }