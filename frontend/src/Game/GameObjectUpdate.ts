import { Matrix2x3, Vec2 } from "./CanvasRendering"

export class GameObject {
    id: string
    vertices: Vec2[] = []

    constructor(id: string) {
        this.id = id
    }

    update(update: ObjectUpdate): void;

    update(update: ObjectUpdate) {
        if ("trfm" in update) {
            for (let vi in this.vertices) {
                this.vertices[vi] = this.vertices[vi].multiply(update.trfm)
            }
        }
        else if ("vert" in update) {
            this.vertices = update.vert
        }
    }

}

export type ObjectTranformUpdate = {
    id: string,
    trfm: Matrix2x3
}

export type ObjectVerticesUpdate = {
    id: string,
    vert: Vec2[]
}

export type ObjectUpdate = ObjectTranformUpdate | ObjectVerticesUpdate