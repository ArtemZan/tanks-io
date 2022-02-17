import { Matrix2x3, Vec2, Vec3 } from "./CanvasRendering"

export class GameObject {
    id: string
    vertices: Vec2[] = []

    constructor(id: string) {
        this.id = id
    }

    update(update: ObjectUpdate) {
        if ("trfm" in update) {
            const origin = Vec2.clone(update.or)
            for (let vi in this.vertices) {
                let vert = Vec2.clone(this.vertices[vi]).sub(origin)
                this.vertices[vi] = (new Vec3(vert.x, vert.y, 1).multiply(Matrix2x3.clone(update.trfm)) as Vec2).add(origin);
            }
        }
        else if ("vert" in update) {
            this.vertices = update.vert
        }
    }

}

export type ObjectTranformUpdate = {
    id: string,
    trfm: Matrix2x3,
    or: Vec2
}

export type ObjectVerticesUpdate = {
    id: string,
    vert: Vec2[]
}

export type ObjectUpdate = ObjectTranformUpdate | ObjectVerticesUpdate