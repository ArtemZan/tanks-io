const {io, GetSocket, GetSocketsIds} = require("../Connection/Connection");
const { DetectCollision } = require("../Math/Math");
const { GetPlayers, rooms } = require("../Room");
const { RenderObjects } = require("./Object");

function UpdateGame(room, timer) {
    //Get change of time since last update
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    //Buffer for all objects that must update
    let updatedObjects = {};


    const players = rooms[room].scene.players;

    const playersVert = RenderObjects(Object.values(players));
    const playersVertMap = Object.keys(players).reduce((res, id, index) => {
        res[id] = playersVert[index]; 
        return res
    }, {});

    const updatedPlayers = UpdatePlayers(playersVertMap, players, dTime);

    updatedObjects = { ...updatedObjects, ...updatedPlayers };


    const updatedBullets = UpdateBullets(room, playersVertMap, dTime);

    updatedObjects = { ...updatedObjects, ...updatedBullets };


    return updatedObjects;
}


//Emits 'killed' event
async function KillPlayer(room_id, killed_player_id, killer_id) {

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

        console.log("Someone died");

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

//Returns whether the player was updated
function UpdatePlayer(player, d_time) {
    if (Math.abs(player.speed) >= 1e-6 || Math.abs(player.rotationSpeed) >= 1e-6 || player.aim.sub(player.turretDir).magnitude() > 1e-2) {
        player.pos = player.pos.add(player.dir.scale(player.speed * d_time));
        player.dir = player.dir.rotate(player.rotationSpeed * d_time);

        const turretRotSpeed = player.CalculateTurretRotationSpeed();

        player.turretDir = player.turretDir.rotate((turretRotSpeed + player.rotationSpeed) * d_time);


        return true;
    }

    return false;
}

function UpdatePlayers(players_vertices, players, d_time) {
    let updatedObjects = {};

    for (let player_id in players) {
        const player = players[player_id]

        const shouldUpdate = UpdatePlayer(player, d_time);
        if (shouldUpdate) {
            updatedObjects[player.id] = { v: players_vertices[player.id], pos: player.pos, dir: player.dir, hp: player.hp }
        }
    }

    return updatedObjects;
}

//Possible returned values: null, {vertices: Vector2[]} or {killedPlayers: Number[]}
function UpdateBullet(room, players_vertices, bullet, d_time) {
    if (bullet.pos.magnitude() > 10) {
        return null;
    }

    bullet.pos = bullet.pos.add(bullet.dir.scale(bullet.speed * d_time));
    const vertices = bullet.Render();

    let killedPlayers = [];

    let exploded = false;

    const players = rooms[room].scene.players;

    for (let player_id in players) {
        if (player_id !== bullet.playerId) {
            let collision = DetectCollision(players_vertices[player_id], vertices);

            if (collision) {
                exploded = true;

                console.log("Hit");

                const killed = Explosion(room, bullet, player_id);

                killedPlayers.push(killed);
            }
        }
    }


    if (exploded) {
        return { killedPlayers: [...new Set(killedPlayers)] };
    }

    return { vertices };
}

function UpdateBullets(room, players_vertices, d_time) {
    let updatedObjects = {};

    const bullets = rooms[room].scene.bullets;

    let bulletInd = 0;//players_vertices.length;

    for (let bullet_i in bullets) {
        let bullet = bullets[bullet_i];

        const update = UpdateBullet(room, players_vertices, bullet, d_time);

        if (!update || update.killedPlayers) {
            updatedObjects[bulletInd] = { v: [] };
            delete bullets[bullet_i];

            if (update && update.killedPlayers) {
                let players = rooms[room].scene.players;

                for (let killed of update.killedPlayers) {
                    updatedObjects[killed] = { v: [] };
                    delete players[killed];
                }
            }
        }
        else if (update.vertices) {
            updatedObjects[bulletInd] = { v: update.vertices };
        }

        bulletInd++;
    }

    rooms[room].scene.bullets = bullets.filter(el => el);

    return updatedObjects;
}

module.exports = { UpdateGame }