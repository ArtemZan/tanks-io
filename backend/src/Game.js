const io = require("./Connection");
const { vec2 } = require("./Math");
const { Bullet } = require("./Object");
const { players, PlayersCount, GetPlayer } = require("./Player");
const {scene} = require("./Scene");


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

    for (let socket of sockets) {
        socket.emit("update", {
            objects: objectsToBeUpdated,
            pos: players[socket.id].pos,
            dir: players[socket.id].dir
        });
    }

}

function UpdatePosition(timer) {
    let date = new Date();
    let dTime = date.getTime() - timer.getTime();


    let index = 0;
    for (let player_id in players) {
        let player = players[player_id];

        if (Math.abs(player.speed) >= 1e-6 || Math.abs(player.rotationSpeed) >= 1e-6 || player.aim.sub(player.turretDir).magnitude() > 1e-2) {
            player.pos = player.pos.add(player.dir.scale(player.speed * dTime));
            player.dir = player.dir.rotate(player.rotationSpeed * dTime);

            let rot_speed = 0;
            if(player.aim.sub(player.turretDir).magnitude() > 1e-2)
            {
                if(player.aim.cross(player.turretDir).z > 0)
                {
                    rot_speed = -0.003;
                }
                else
                {
                    rot_speed = 0.003;
                }
            }

            player.turretDir = player.turretDir.rotate((rot_speed + player.rotationSpeed) * dTime);



            let vertices = player.Render();
            objectsToBeUpdated.push({ i: index, v: vertices });
        }

        index++;
    }


    for (let bullet_i in scene.bullets) {
        let bullet = scene.bullets[bullet_i];
        bullet.pos = bullet.pos.add(bullet.dir.scale(bullet.speed * dTime));
        let vertices = [];

        if (bullet.pos.magnitude() < 10) {
            bullet.Render(vertices);
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

module.exports = {StartGame, StopGame}