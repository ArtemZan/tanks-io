import { Matrix2x3, Vec2 } from "./CanvasRendering";

export class Camera2D {
    view: Matrix2x3 = new Matrix2x3(new Vec2(), new Vec2(), new Vec2());
}
