const { io, GetSocket, GetSocketsIds } = require("../Connection/Connection");
const { DetectCollision } = require("../Math/Math");
const { GetPlayers } = require("../Rooms/Players");
const { rooms, Room } = require("../Rooms/Room");
const { Bullet, Player } = require("./Object");

function UpdateGame(room, timer) {
    //Get change of time since last update
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    //Buffer for all objects that must update
    let updatedObjects = {};



    const scene = rooms[room].scene;


    updatedObjects = { ...updatedObjects, ...UpdatePlayers(room, dTime) };

    updatedObjects = { ...updatedObjects, ...UpdateBullets(room, dTime) };

    //console.log("Updated object: ", updatedObjects);

    updatedObjects = { ...updatedObjects, ...UpdateCollisions(room, dTime, updatedObjects) };

    return updatedObjects;
}


//Emits 'killed' event
async function KillPlayer(room_id, killed_player_id, killer_id) {
    console.log("Someone died");

    const ids = GetSocketsIds(room_id); //io.sockets.adapter.rooms.get(room);

    for (let socketId of ids) {
        let info = {};
        if (socketId === killed_player_id) {
            info.info = { score: 0 }; // for now always 0
        }

        let assists = {};
        if (socketId === killer_id) {
            assists.assists = [];
        }


        GetSocket(socketId).emit("killed", {
            id: socketId,
            killed: killed_player_id,
            killer: killer_id,
            playersRemain: Object.keys(GetPlayers(room_id)).length - 1,
            ...info,
            ...assists
        }); //No assists for now
    }
}

function CalculateDamage(player, bullet, is_hit_direct) {
    let damage = 0;

    let dist = bullet.pos.sub(player.pos).magnitude();

    if (dist < 0.2) {
        if (is_hit_direct) {
            damage += 2;
        }

        //Players near the explosion are also damaged
        damage += (0.2 - (dist < 0.1 ? 0.1 : dist)) * 5;
    }

    return damage;
}


function Explosion(room_id, bullet, hit_player_id) {
    console.log("Explosion: ", bullet.playerId, hit_player_id);

    const players = GetPlayers(room_id);

    let killed = [];

    for (let player_id in players) {
        let player = players[player_id];

        player.hp -= CalculateDamage(player, bullet, hit_player_id === player_id);

        if (player.hp <= 0) {
            KillPlayer(room_id, player_id, bullet.playerId);

            killed.push(player_id);
        }
    }

    return killed;
}

function HandleCollision(room_id, obj1, obj2, collision) {
    let update = {};

    const scene = rooms[room_id].scene;

    let killedPlayers = [];

    let bullet = null;
    let player = null;

    if (obj1 instanceof Bullet) {
        bullet = obj1;
    }
    else if (obj2 instanceof Bullet) {
        bullet = obj2;
    }

    if (obj1 instanceof Player) {
        player = obj1;
    }
    else {
        player = obj2;
    }

    if (bullet && player && player.id !== bullet.playerId) {
        killedPlayers = Explosion(room_id, bullet, player.id);

        update[bullet.id] = {v: []};
        scene.bullets = scene.bullets.filter(b => b.id !== bullet.id);
    }

    for (let killed_player_id of killedPlayers) {

        update[killed_player_id] = { v: [] };
    }

    //console.log("Collision handled: ", update);

    return update;
}

function UpdateCollisions(room_id, d_time, updated) {
    let update = {};

    const room = rooms[room_id];

    if (!(room instanceof Room)) {
        console.error("Invalid 'room_id' given to 'UpdateCollisions'");
        return;
    }

    const scene = room.scene;
    const objects = scene.ToMap();

    for (let object1_id in updated) {
        const obj1 = objects[object1_id];

        if (!(obj1 instanceof Object)) {
            continue;
            console.log("'obj1' is not of type 'Object': ", object1_id, objects);
        }

        //console.log(obj1);

        for (let object2_id in objects) {
            if (object1_id === object2_id) {
                continue;
            }

            const obj2 = objects[object2_id];

            if (!(obj2 instanceof Object)) {
                continue;
                console.log("'obj2' is not of type 'Object': ", object2_id, objects);
            }

            let collision = DetectCollision(obj1.GetVertices(), obj2.GetVertices());

            if (collision) {
                update = { ...update, ...HandleCollision(room_id, obj1, obj2, collision) };
            }
        }
    }

    //console.log("Collisions update: ", update);

    return update;
}

function UpdatePlayers(room_id, d_time) {
    let updatedObjects = {};

    const players = rooms[room_id].scene.players;

    for (let player_id in players) {
        const player = players[player_id];

        const updated = player.Update(d_time);

        if (updated) {
            updatedObjects[player.id] = {
                v: player.vertices,
                pos: player.pos,
                dir: player.dir,
                hp: player.hp
            }
        }
    }

    return updatedObjects;
}

function UpdateBullets(room, d_time) {
    let updatedObjects = {};

    const bullets = rooms[room].scene.bullets;

    for (let bullet_i in bullets) {
        let bullet = bullets[bullet_i];

        const updated = bullet.Update(d_time);

        if (updated) {
            updatedObjects[bullet.id] = { v: bullet.GetVertices() };
        }
        else {
            updatedObjects[bullet.id] = { v: [] };
            delete bullets[bullet_i];
        }
    }

    rooms[room].scene.bullets = bullets.filter(el => el);

    return updatedObjects;
}

module.exports = { UpdateGame }