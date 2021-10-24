const scene = {
    obstacles: [],
    bullets: []
};



function UpdateObject(objectsBuffer, id, vertices, otherData)
{
    if(otherData instanceof Object)
    {
        objectsBuffer[id] = {i: id, v: vertices, ...otherData};
    }
    else
    {
        objectsBuffer[id] = {i: id, v: vertices};
    }
}

module.exports = {scene, UpdateObject};