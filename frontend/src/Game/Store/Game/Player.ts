import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vec2 } from "../../CanvasRendering";

export type PlayerState = {
    pos: Vec2,
    dir: Vec2,

    turretDir: Vec2,
    desiredTurretDir: Vec2,

    speed: number,
    rotationSpeed: number,

    //Next are set when the game starts and are constants for certain tank
    maxRotationSpeed: number,
    maxSpeed: number
}


const slice = createSlice({
    initialState: {} as PlayerState,
    name: "player",
    reducers: {
        setDir: (state, action: PayloadAction<Vec2>) => { state.dir = action.payload },
        setPos: (state, action: PayloadAction<Vec2>) => { state.pos = action.payload },
        setTurretDir: (state, action: PayloadAction<Vec2>) => { state.turretDir = action.payload },
        setDesiredTurretDir: (state, action: PayloadAction<Vec2>) => { state.desiredTurretDir = action.payload },
        setSpeed: (state, action: PayloadAction<number>) => { state.speed = action.payload },
        setRotationSpeed: (state, action: PayloadAction<number>) => { state.rotationSpeed = action.payload }
    }
})

export default slice