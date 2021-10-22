const scene = {
    obstacles: [],
    bullets: []
};

const objectsToBeUpdated = {};


function UpdateObject(id, vertices, other)
{
    if(other instanceof Object)
    {
        objectsToBeUpdated[id] = {i: id, v: vertices, ...other};
    }
    else
    {
        objectsToBeUpdated[id] = {i: id, v: vertices};
    }
}

module.exports = {scene, objectsToBeUpdated, UpdateObject};