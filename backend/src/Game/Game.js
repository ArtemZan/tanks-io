const io = require("../Connection/Connection");
const { DetectCollision } = require("../Math/Math");
const { GetPlayers, EmitUpdate, rooms, GetIndexOfPlayerInRoom } = require("../Room");



let intervalId;
let timer;

function StartGame() {
    timer = new Date();

    intervalId = setInterval(UpdateGames.bind(null, timer), 30);
}

StopGame();
StartGame();

function StopGame() {
    intervalId !== undefined && clearInterval(intervalId);
}

//The game loop
function UpdateGames(timer) {
    for (let roomId in rooms) {
        const updatedObjects = UpdateGame(roomId, timer);

        EmitUpdate(roomId, updatedObjects);
    }

    timer.setTime((new Date).getTime());
}


//Emits 'killed' event
async function KillPlayer(room, killed_player_ind, killer_ind) {

    const ids = io.sockets.adapter.rooms.get(room);

    let index = 0;

    for (let socketId of ids) {
        let info = {};
        if (index === killed_player_ind) {
            info.info = { score: 0 }; // for now always 0
        }

        let assists = {};
        if (index === killer_ind) {
            assists.assists = [];
        }

        console.log("Someone died");

        io.sockets.sockets.get(socketId).emit("killed", {
            id: index,
            killed: killed_player_ind,
            killer: killer_ind,
            playersRemain: Object.keys(GetPlayers(room)).length - 1,
            ...info,
            ...assists
        }); //No assists for now

        index++;
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

function Explosion(room, bullet, hit_player_id) {
    let index = 0;

    const players = GetPlayers(room);

    let killed = [];

    for (let player_id in players) {
        let player = players[player_id];


        player.hp -= CalculateDamage(player, bullet, hit_player_id === player.id);

        if (player.hp <= 0) {
            KillPlayer(room, index, GetIndexOfPlayerInRoom(room, bullet.playerId));

            killed.push(index);
        }

        index++;
    }

    return killed;
}

function RenderObjects(objects) {
    let res = [];

    for (let object of objects) {
        res.push(object.Render());
    }

    return res;
}

function CalculateTurretRotationSpeed(player) {
    const rotSpeedK = 0.003;
    let rotSpeed = 0;

    let angleDif = player.aim.sub(player.turretDir).magnitude();

    let dir = 1;
    if (player.aim.cross(player.turretDir).z > 0) {
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

//Returns whether the player was updated
function UpdatePlayer(player, d_time) {
    if (Math.abs(player.speed) >= 1e-6 || Math.abs(player.rotationSpeed) >= 1e-6 || player.aim.sub(player.turretDir).magnitude() > 1e-2) {
        player.pos = player.pos.add(player.dir.scale(player.speed * d_time));
        player.dir = player.dir.rotate(player.rotationSpeed * d_time);

        const turretRotSpeed = CalculateTurretRotationSpeed(player);

        player.turretDir = player.turretDir.rotate((turretRotSpeed + player.rotationSpeed) * d_time);


        return true;
    }

    return false;
}

function UpdatePlayers(players_vertices, players, d_time) {
    let updatedObjects = {};
    let index = 0;

    for (let player of players) {
        const shouldUpdate = UpdatePlayer(player, d_time);
        if (shouldUpdate) {
            updatedObjects[index] = { v: players_vertices[index], pos: player.pos, dir: player.dir, hp: player.hp }
        }

        index++;
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

    let playerInd = 0;

    for (let player_id in players) {
        if (player_id !== bullet.playerId) {
            let collision = DetectCollision(players_vertices[playerInd], vertices);

            if (collision) {
                exploded = true;

                console.log("Hit");

                const killed = Explosion(room, bullet, player_id);

                killedPlayers = [...killedPlayers, ...killed];
            }
        }

        playerInd++;
    }


    if (exploded) {
        return { killedPlayers: [...new Set(killedPlayers)] };
    }

    return { vertices };
}

function UpdateBullets(room, players_vertices, d_time) {
    let updatedObjects = {};

    const bullets = rooms[room].scene.bullets;

    let bulletInd = players_vertices.length;

    for (let bullet_i in bullets) {
        let bullet = bullets[bullet_i];

        const update = UpdateBullet(room, players_vertices, bullet, d_time);

        if (!update || update.killedPlayers) {
            updatedObjects[bulletInd] = { v: [] };
            delete bullets[bullet_i];

            if (update && update.killedPlayers) {
                let players = rooms[room].scene.players;
                let playersIds = Object.keys(players);

                for (let killed of update.killedPlayers) {
                    updatedObjects[killed] = { v: [] };
                    delete players[playersIds[killed]];
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

function UpdateGame(room, timer) {
    //Get change of time since last update
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    //Buffer for all objects that must update
    let updatedObjects = {};


    const players = Object.values(rooms[room].scene.players);

    const playersVert = RenderObjects(players);

    const updatedPlayers = UpdatePlayers(playersVert, players, dTime);

    updatedObjects = { ...updatedObjects, ...updatedPlayers };


    const updatedBullets = UpdateBullets(room, playersVert, dTime);

    updatedObjects = { ...updatedObjects, ...updatedBullets };


    return updatedObjects;
}

module.exports = { StartGame, StopGame }