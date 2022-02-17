import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr"

let socket: HubConnection | null = null;
const URL = "http://localhost";
const port = 5000;

type ConnectionListenner = (success: boolean) => void

const connectionListenners: ConnectionListenner[] = []

async function Connect() {
    console.log("Connecting...");
    socket = new HubConnectionBuilder().withUrl(URL + ":" + port + "/API").build();
    await socket.start();
    console.log("Connected");

    while (connectionListenners.length > 0) {
        (connectionListenners.pop() as ConnectionListenner)(true);
    }
}

Connect();


function AddConnectionListenner(callback: ConnectionListenner) {
    if (IsConnected()) {
        callback(true);
        return;
    }

    connectionListenners.push(callback);
}

function Disconnect() {
    socket = null;
}

function Emit(eventName: string, ...data: any[]) {
    if (!IsConnected()) {
        console.warn("Trying to emit message when not connected");
        return;
    }

    //console.log(`Emiting '${eventName}' with arguments: `, data)

    socket?.invoke(eventName, ...data);
}

type EventCallback = (...data: any) => void | 0;

const eventListenners: { [en: string]: EventCallback[] } = {}

//@param callback - handles the event and returns 0 if this listenner must be removed
function AddEventListenner(eventName: string, callback: EventCallback) {
    if (!IsConnected()) {
        console.warn("Trying to add event listenner when not connected");
        return;
    }

    if (eventListenners[eventName] === undefined) {
        eventListenners[eventName] = [callback];
    }
    else {
        eventListenners[eventName].push(callback);
    }

    socket?.on(eventName, OnEvent.bind(null, eventName))
}

function OnEvent(eventName: string, ...data: any) {

    let listenners = eventListenners[eventName];

    //console.log(eventName, listenners)

    
    if (listenners) {
        for (let i in listenners) {
            if(listenners[i](data) === 0)
            {
                delete listenners[i]
            }
        }

        listenners = listenners.filter(callback => callback)
    }
}

function IsConnected() {
    return socket !== null && socket.state === HubConnectionState.Connected;
}

export { Connect, Disconnect, IsConnected, Emit, AddEventListenner, AddConnectionListenner }