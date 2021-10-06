const {vec2, matrix2x2} = require("./Math")

let players = [];

class Player
{
    constructor()
    {
        this.pos = new vec2(0, 0);
        this.dir = new vec2(0, 1);
        this.speed = 0;
        this.rotationSpeed = 0;
    }

    Render(buffer)
    {
        let x = 0.015;
        let y = 0.01;

        buffer.push(
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

        for(let i = 0; i < 6; i++)
        {
            let cos = this.dir.x;
            let sin = this.dir.y;

            let v = buffer[buffer.length - 6 + i];
            v = new vec2(v.x, v.y);
            v = v.mult(new matrix2x2(
                new vec2(cos, sin),
                new vec2(-sin, cos)
            ))

            buffer[buffer.length - 6 + i].x = this.pos.x + v.x;
            buffer[buffer.length - 6 + i].y = this.pos.y + v.y;
        }
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