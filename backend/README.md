# Tanks IO server

### The server for a tanks game
<br>
<br>

#### This server uses socket.io and express.js for server-client communication
<br>

#### To host this server use `npm start`
<br>

#### This server is hosted on port 1234 (temporarily)

<br>
<br>

# Endpoints (socket.io events):

* `join`

    payload: 
    
        code: number - room code to join

    emits `join` on success or `wrongCode`

    <br>
        
* `createRoom`

    payload: `none`

    emits `wait` when created and `join` when someone has joined the room

    <br>

* `leave`

    payload: `none`

    if there is <= 1 person left in the room, emits `wait` to the remaining client

    <br>
        
* `startMoving`

    payload:

        ahead: boolean

    <br>

            
* `stopMoving`

    payload: `none`

    <br>

            
* `startRotating`

    payload:

        clockwise: boolean

    <br>

            
* `stopRotating`

    payload: `none`

    <br>

            
* `startRotatingTurret`

    payload:

        dir: {x: number, y: number} - the target in world coordinates RELATIVE TO THE PLAYER

    <br>
                
* `stopRotatingTurret`

    payload: `none`

    <br>
                    
* `shoot`

    payload: `none`

    <br>


# Emitted events: 

* `update`

* `wait`

* `join`