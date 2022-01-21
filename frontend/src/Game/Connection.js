import io from "socket.io-client"

var socket = null;

const URL = "http://localhost";
const port = 1234;

function Connect()
{
    console.trace();
    socket = io(URL + ":" + port, { transports: ['websocket'] });
}

Connect();


function Disconnect()
{
    socket = null;
}

function Emit(eventName, data)
{
    if(!IsConnected())
    {
        console.warn("Trying to emit message when not connected");
        return;
    }

    socket.emit(eventName, data);
}


const eventListenners = {}

function AddEventListenner(eventName, callback)
{
    if(!IsConnected())
    {
        console.warn("Trying to add event listenner when not connected");
        return;
    }

    if(eventListenners[eventName] === undefined)
    {
        eventListenners[eventName] = [callback];
    }
    else
    {
        eventListenners[eventName].push(callback);
    }

    socket.on(eventName, OnEvent.bind(null, eventName))
}

function OnEvent(eventName, data)
{
    
    let listenners = eventListenners[eventName];
    
    if(listenners)
    {
        for(let callback of listenners)
        {
            callback(data);
        }
    }
}

function IsConnected()
{
    return socket !== null;
}

export {Connect, Disconnect, IsConnected, Emit, AddEventListenner}