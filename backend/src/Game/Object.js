const { vec2, matrix2x2 } = require("../Math/Math");
//const { GetPlayerById } = require("../Room");
const rooms = require("../Rooms/Rooms");

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

    return vert.map(v => new vec2(v.x, v.y));
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

// to do
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


class GameObject {
    constructor(index_in_room) {
        this.id = null;
        this.SetId(index_in_room);

        this.pos = new vec2(0, 0);
        this.rotation = 0;
        this.speed = 0;
        this.rotationSpeed = 0;

        this.vertices = [];

        this.Render();

        //console.log(this.vertices);
    }

    UpdatePos(new_pos) {
        if (!(new_pos instanceof vec2)) {
            console.error("Position of 'Object' must be of type 'vec2'");
            return;
        }

        for (let vi in this.vertices) {
            let v = this.vertices[vi];

            if (v instanceof vec2) {
                this.vertices[vi] = v.add(new_pos).sub(this.pos);
            }
        }

        this.pos = new vec2(new_pos.x, new_pos.y);
    }

    UpdateRotation(new_rotation) {
        for (let vi in this.vertices) {
            let v = this.vertices[vi];

            if (v instanceof vec2) {
                this.vertices[vi] = v.sub(this.pos).rotate(new_rotation - this.rotation).add(this.pos);
            }
            else {
                console.warn(`Vertices of an object must be of type 'vec2', but found '${v}'`);
            }
        }

        this.rotation = new_rotation;
    }

    //Returns whether something was updated
    Update(d_time) {
        if (Math.abs(this.speed) >= 1e-6 || Math.abs(this.rotationSpeed) >= 1e-6) {
            const dir = new vec2(Math.cos(this.rotation), Math.sin(this.rotation));

            this.UpdatePos(this.pos.add(dir.scale(this.speed * d_time)));
            this.UpdateRotation(this.rotation + this.rotationSpeed * d_time);

            return true;
        }

        return false;
    }

    GetVertices() {
        return this.vertices;
    }

    SetId(index_in_room)
    {
        this.id = index_in_room;
    }

    Render() {
        this.vertices = [];
    }
}

class Player extends GameObject {
    constructor(room, id) {
        super();

        this.hp = 10;

        this.rotationSpeed = 0;

        this.aim = new vec2(0, 1);
        this.turretRotation = 0;
        this.turretRotationSpeed = 0;

        this.room = room;
        this.id = id;

        delete this.SetId;
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

    TurretRotationSpeed() {
        const rotSpeedK = 0.003;
        let rotSpeed = 0;

        const turretDir = new vec2(Math.cos(this.turretRotation), Math.sin(this.turretRotation));

        let angleDif = this.aim.sub(turretDir).magnitude();

        let dir = 1;
        if (this.aim.cross(turretDir).z > 0) {
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
        const scene = rooms[this.room].scene;

        let bullet = new Bullet(Object.keys(scene.bullets).length, this.id);

        bullet.UpdateRotation(this.turretRotation);

        bullet.UpdatePos(this.pos);
        bullet.speed = 0.001;

        scene.bullets.push(bullet);
    }

    UpdateTurretRotation(new_rotation) {
        let currentDir = new vec2(Math.cos(this.turretRotation), Math.sin(this.turretRotation));


        if (this.aim.sub(currentDir).magnitude() > 1e-2) {

            for (let vi = 6; vi < 12; vi++) {
                let v = this.vertices[vi];
                if (v instanceof vec2) {
                    this.vertices[vi] = v.sub(this.pos).rotate(new_rotation - this.turretRotation).add(this.pos);
                }
            }

            this.turretRotation = new_rotation;

            return true;
        }

        return false;

    }

    UpdateHullRotation(new_rotation) {
        for (let vi = 0; vi < 6; vi++) {
            let v = this.vertices[vi];

            if (v instanceof vec2) {
                this.vertices[vi] = v.sub(this.pos).rotate(new_rotation - this.rotation).add(this.pos);
            }
            else {
                console.warn(`Vertices of an object must be of type 'vec2', but found '${v}'`);
            }
        }

        this.rotation = new_rotation;
    }

    UpdateRotation(new_rotation) {
        this.UpdateHullRotation(new_rotation);
    }

    Update(d_time) {
        const updated = super.Update(d_time);

        //console.log(this.turretRotation, this.TurretRotationSpeed(), this.rotationSpeed, d_time);

        const turretUpdated = this.UpdateTurretRotation(this.turretRotation + (this.TurretRotationSpeed() + this.rotationSpeed) * d_time);


        return updated || turretUpdated;
    }

    Render() {
        let hull = Rect(0.015, 0.01);
        let turret = Rect(0.02, 0.003);
        Move(turret, new vec2(0.01, 0));

        //RotateFromVector(hull, this.dir);
        //RotateFromVector(turret, this.turretDir);


        this.vertices = [...hull, ...turret];
        Move(this.vertices, this.pos);
    }
}

class Bullet extends GameObject {
    constructor(id, player_id) {
        super(id);

        this.playerId = player_id;
    }

    Update(d_time) {
        if (this.pos.magnitude() > 10) {
            return null;
        }

        
        // let killedPlayers = [];

        // let exploded = false;

        // console.log(GetPlayerById);

        // const roomId = GetPlayerById(this.playerId).room;
        // const players = rooms[roomId].scene.players;

        // for (let player_id in players) {
        //     if (player_id !== bullet.playerId) {
        //         let collision = DetectCollision(players_vertices[player_id], this.vertices);

        //         if (collision) {
        //             exploded = true;

        //             console.log("Hit");

        //             const killed = Explosion(room, bullet, player_id);

        //             killedPlayers.push(killed);
        //         }
        //     }
        // }


        // if (exploded) {
        //     return { killedPlayers: [...new Set(killedPlayers)] };
        // }

        // return { vertices: this.vertices };

        super.Update(d_time);

        return true;
    }

    Render() {
        const x = 0.01;
        const y = 0.005;

        this.vertices = Rect(x, y);

        this.pos = new vec2(0, 0);
        this.rotation = 0;

        this.UpdateRotation(this.rotation);

        this.UpdatePos(this.pos);
    }

    SetId(index_in_room)
    {
        this.id = index_in_room + "b";
    }
}

class Box extends GameObject {
    constructor(id) {
        super(id);
    }

    GetVertices() {

    }
}

/* function RenderObjects(objects) {
    let res = {};

    for (let objectId in objects) {
        let object = objects[objectId];

        if (object instanceof Object) {
            res[objectId] = object.GetVertices();
        }
        else {
            console.error("'RenderObjects' must receive an iterable of objects of type 'Object'");
        }
    }

    return res;
} */

module.exports = { Object: GameObject, Bullet, Player }