const {vec2} = require("./Math")

let players = [];

class Player
{
    constructor()
    {
        this.pos = new vec2(0, 0);
        this.dir = new vec2(0, 1);
        this.speed = 0;
    }

    Render(buffer)
    {
        let x = this.pos.x + this.dir.rotate(-Math.PI / 4).x * 0.01;
        let y = this.pos.y + this.dir.rotate(-Math.PI / 4).y * 0.015
        buffer.push(
            {
                x: -x, 
                y: -y
            },
            {
                x: -x, 
                y: y
            },
            {
                x: x, 
                y: -y
            },
            {
                x: -x, 
                y: y
            },
            {
                x: x, 
                y: -y
            },
            {
                x: x, 
                y: y
            }
        );
    }
}

function AddPlayer()
{
    players.push(new Player());
}

function RemovePlayer(id)
{
    players.splice(id, 1);
}

function GetPlayer(id)
{
    return players[id];
}

function PlayersCount()
{
    return players.length;
}

module.exports = {AddPlayer, RemovePlayer, PlayersCount, GetPlayer};