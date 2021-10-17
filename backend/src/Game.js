const io = require("./Connection");
const { vec2, DetectCollision } = require("./Math");
const { Bullet } = require("./Object");
const { players, PlayersCount, GetPlayer } = require("./Player");
const { scene } = require("./Scene");


let objectsToBeUpdated = [];


let intervalId;

function StartGame() {
    let timer = new Date();

    intervalId = setInterval(GameLoop.bind(null, timer), 10);

    let i = 0;

    for (let player_id in players) {
        let v = players[player_id].Render();
        objectsToBeUpdated.push({ i, v });

        i++;
    }

    EmitUpdate();
}

function StopGame() {
    clearInterval(intervalId);
}

function Explosion(bullet, hit_player_id)
{
    console.log("Player died");

    let index = 0;

    for(let player_id in players)
    {
        let player = players[player_id];

        let dist = bullet.pos.sub(player.pos).magnitude();

        if(dist < 0.2)
        {

            //Player near the explosion is also damaged
            player.hp -= (0.2 - (dist < 0.1 ? 0.1 : dist)) * 5;
            if(player_id === hit_player_id)
            {
                player.hp -= 2;
            }

            if(player.hp <= 0)
            {
                KillPlayer(player_id);
                objectsToBeUpdated.push({i: index, v: []});
            }
            else
            {
                objectsToBeUpdated.push({i: index});
            }
        }

        index++;
    }
}

async function KillPlayer(player_id)
{
    const sockets = await io.fetchSockets();

    let socket;

    for(let s of sockets)
    {
        if(s.id === player_id)
        {
            socket = s;
            break;
        }
    }

    if(!socket)
    {
        console.log("Failed to kill player: socket with given id doesn't exist");
        return;
    }

    socket.emit("lose", {score: 0});
}


function GameLoop(timer) {
    objectsToBeUpdated = [];

    UpdatePosition(timer);

    EmitUpdate();

    timer.setTime((new Date).getTime())
    //io.emit("update", { vertices: [{ x: -0.5, y: -0.5 }, { x: 0.5, y: -0.5 }, { x: 0.0, y: 0.7 }] })
}

async function EmitUpdate() {

    if (objectsToBeUpdated.length === 0) {
        return;
    }

    const sockets = await io.fetchSockets();

    let index = 0;
    for (let socket of sockets) {
        let update = {
            id: index,
            obj: [...objectsToBeUpdated]
        }

        update.obj[index] = {...update.obj[index]};

        update.obj[index].pos = players[socket.id].pos;
        update.obj[index].dir = players[socket.id].dir;
        update.obj[index].hp = players[socket.id].hp;

        socket.emit("update", update);
    }

}

function UpdatePosition(timer) {
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();

    let playersVert = [];

    let index = 0;
    for (let player_id in players) {
        let player = players[player_id];

        playersVert.push(player.Render());

        if (Math.abs(player.speed) >= 1e-6 || Math.abs(player.rotationSpeed) >= 1e-6 || player.aim.sub(player.turretDir).magnitude() > 1e-2) {
            player.pos = player.pos.add(player.dir.scale(player.speed * dTime));
            player.dir = player.dir.rotate(player.rotationSpeed * dTime);

            let rot_speed = 0;
            if (player.aim.sub(player.turretDir).magnitude() > 1e-2) {
                if (player.aim.cross(player.turretDir).z > 0) {
                    rot_speed = -0.003;
                }
                else {
                    rot_speed = 0.003;
                }
            }

            player.turretDir = player.turretDir.rotate((rot_speed + player.rotationSpeed) * dTime);


            objectsToBeUpdated.push({ i: index, v: playersVert[index] });
        }

        index++;
    }

    let playerIds = Object.keys(players);

    for (let bullet_i in scene.bullets) {
        let bullet = scene.bullets[bullet_i];


        bullet.pos = bullet.pos.add(bullet.dir.scale(bullet.speed * dTime));
        let vertices = [];

        if (bullet.pos.magnitude() < 10) {
            vertices = bullet.Render();

            let playerInd = 0;
            for (let playerVert of playersVert) {
                if (playerIds[playerInd] != bullet.playerId) {
                    let collision = DetectCollision(playerVert, vertices);
                    
                    if (collision) {
                        console.log("Hit");

                        Explosion(bullet, playerIds[playerInd]);

                        delete scene.bullets[bullet_i];
                        vertices = [];
                    }
                }

                playerInd++;
            }
        }
        else {
            delete scene.bullets[bullet_i];
        }

        objectsToBeUpdated.push({ i: index, v: vertices });

        index++;
    }

    scene.bullets = scene.bullets.filter(el => el);


    //console.log(objectsToBeUpdated);

}

module.exports = { StartGame, StopGame }