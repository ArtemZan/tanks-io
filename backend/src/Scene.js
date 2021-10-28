function UpdateObject(objectsBuffer, id, vertices, otherData)
{
    if(otherData instanceof Object)
    {
        objectsBuffer[id] = {v: vertices, ...otherData};
    }
    else
    {
        objectsBuffer[id] = {v: vertices};
    }
}

module.exports = {UpdateObject};