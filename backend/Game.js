const {vec2} = require("./Math")

let players = [];

class Player
{
    constructor()
    {
        this.pos = new vec2(0, 0);
        this.rot = 0;
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

function MovePlayer()
{
    
}

function PlayersCount()
{
    return players.length;
}

module.exports = {AddPlayer, RemovePlayer, PlayersCount};